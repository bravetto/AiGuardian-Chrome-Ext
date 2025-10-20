"""
CodeGuardians Gateway - Guard Services Orchestrator

This module provides the core orchestration logic for managing and routing
requests to all guard services in the Code Guardians ecosystem.
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
import httpx
import json
from pathlib import Path

from app.core.config import get_settings
from app.core.exceptions import (
    GuardServiceError,
    ServiceUnavailableError,
    ConfigurationError
)
from app.utils.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()


class GuardServiceType(Enum):
    """Enumeration of available guard service types."""
    TOKEN_GUARD = "tokenguard"
    TRUST_GUARD = "trustguard"
    CONTEXT_GUARD = "contextguard"
    BIAS_GUARD = "biasguard"


class ServiceStatus(Enum):
    """Service health status enumeration."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    UNHEALTHY = "unhealthy"
    UNKNOWN = "unknown"


@dataclass
class GuardServiceConfig:
    """Configuration for a guard service."""
    name: str
    service_type: GuardServiceType
    base_url: str
    health_endpoint: str = "/health"
    timeout: int = 30
    retry_attempts: int = 3
    circuit_breaker_threshold: int = 5
    circuit_breaker_timeout: int = 60
    enabled: bool = True
    priority: int = 1
    tags: List[str] = field(default_factory=list)


@dataclass
class ServiceHealth:
    """Service health information."""
    service_name: str
    status: ServiceStatus
    last_check: datetime
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class OrchestrationRequest:
    """Request for guard service orchestration."""
    request_id: str
    service_type: GuardServiceType
    payload: Dict[str, Any]
    user_id: Optional[str] = None
    session_id: Optional[str] = None
    priority: int = 1
    timeout: Optional[int] = None
    fallback_enabled: bool = True


@dataclass
class OrchestrationResponse:
    """Response from guard service orchestration."""
    request_id: str
    service_type: GuardServiceType
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None
    service_used: Optional[str] = None
    fallback_used: bool = False


class CircuitBreaker:
    """Circuit breaker implementation for service protection."""
    
    def __init__(self, threshold: int = 5, timeout: int = 60):
        self.threshold = threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def can_execute(self) -> bool:
        """Check if the circuit breaker allows execution."""
        if self.state == "CLOSED":
            return True
        elif self.state == "OPEN":
            if self.last_failure_time and \
               datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = "HALF_OPEN"
                return True
            return False
        else:  # HALF_OPEN
            return True
    
    def record_success(self):
        """Record a successful operation."""
        self.failure_count = 0
        self.state = "CLOSED"
    
    def record_failure(self):
        """Record a failed operation."""
        self.failure_count += 1
        self.last_failure_time = datetime.now()
        
        if self.failure_count >= self.threshold:
            self.state = "OPEN"


class GuardServiceOrchestrator:
    """
    Main orchestrator for CodeGuardians guard services.
    
    Provides unified access, routing, health monitoring, and management
    for all guard services in the ecosystem.
    """
    
    def __init__(self):
        self.services: Dict[str, GuardServiceConfig] = {}
        self.health_status: Dict[str, ServiceHealth] = {}
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.http_client: Optional[httpx.AsyncClient] = None
        self._initialized = False
        
    async def initialize(self):
        """Initialize the orchestrator with service configurations."""
        if self._initialized:
            return
            
        logger.info("Initializing CodeGuardians Gateway Orchestrator...")
        
        # Initialize HTTP client
        self.http_client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
        )
        
        # Load service configurations
        await self._load_service_configurations()
        
        # Initialize circuit breakers
        await self._initialize_circuit_breakers()
        
        # Perform initial health checks
        await self._perform_health_checks()
        
        self._initialized = True
        logger.info("CodeGuardians Gateway Orchestrator initialized successfully")
    
    async def _load_service_configurations(self):
        """Load guard service configurations."""
        # Default service configurations
        default_configs = {
            "tokenguard": GuardServiceConfig(
                name="TokenGuard",
                service_type=GuardServiceType.TOKEN_GUARD,
                base_url="http://localhost:8001",
                health_endpoint="/health",
                priority=1,
                tags=["token", "optimization", "cost"]
            ),
            "trustguard": GuardServiceConfig(
                name="TrustGuard",
                service_type=GuardServiceType.TRUST_GUARD,
                base_url="http://localhost:8002",
                health_endpoint="/health",
                priority=1,
                tags=["trust", "reliability", "validation"]
            ),
            "contextguard": GuardServiceConfig(
                name="ContextGuard",
                service_type=GuardServiceType.CONTEXT_GUARD,
                base_url="http://localhost:8003",
                health_endpoint="/health",
                priority=1,
                tags=["context", "drift", "memory"]
            ),
            "biasguard": GuardServiceConfig(
                name="BiasGuard",
                service_type=GuardServiceType.BIAS_GUARD,
                base_url="http://localhost:8004",
                health_endpoint="/health",
                priority=1,
                tags=["bias", "detection", "mitigation"]
            )
        }
        
        # Load from environment or config file if available
        for service_name, config in default_configs.items():
            self.services[service_name] = config
            logger.info(f"Loaded configuration for {config.name}")
    
    async def _initialize_circuit_breakers(self):
        """Initialize circuit breakers for all services."""
        for service_name, config in self.services.items():
            self.circuit_breakers[service_name] = CircuitBreaker(
                threshold=config.circuit_breaker_threshold,
                timeout=config.circuit_breaker_timeout
            )
    
    async def _perform_health_checks(self):
        """Perform initial health checks on all services."""
        tasks = []
        for service_name in self.services.keys():
            tasks.append(self._check_service_health(service_name))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _check_service_health(self, service_name: str) -> ServiceHealth:
        """Check the health of a specific service."""
        config = self.services.get(service_name)
        if not config:
            return ServiceHealth(
                service_name=service_name,
                status=ServiceStatus.UNKNOWN,
                last_check=datetime.now(),
                error_message="Service configuration not found"
            )
        
        start_time = datetime.now()
        try:
            health_url = f"{config.base_url}{config.health_endpoint}"
            response = await self.http_client.get(health_url, timeout=5.0)
            
            response_time = (datetime.now() - start_time).total_seconds()
            
            if response.status_code == 200:
                status = ServiceStatus.HEALTHY
                error_message = None
                metadata = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
            else:
                status = ServiceStatus.UNHEALTHY
                error_message = f"HTTP {response.status_code}"
                metadata = {}
            
            health = ServiceHealth(
                service_name=service_name,
                status=status,
                last_check=datetime.now(),
                response_time=response_time,
                error_message=error_message,
                metadata=metadata
            )
            
        except Exception as e:
            response_time = (datetime.now() - start_time).total_seconds()
            health = ServiceHealth(
                service_name=service_name,
                status=ServiceStatus.UNHEALTHY,
                last_check=datetime.now(),
                response_time=response_time,
                error_message=str(e)
            )
        
        self.health_status[service_name] = health
        return health
    
    async def orchestrate_request(self, request: OrchestrationRequest) -> OrchestrationResponse:
        """
        Orchestrate a request to the appropriate guard service.
        
        Args:
            request: The orchestration request
            
        Returns:
            OrchestrationResponse with the result
        """
        if not self._initialized:
            await self.initialize()
        
        start_time = datetime.now()
        service_name = request.service_type.value
        
        try:
            # Check if service is available
            if not self._is_service_available(service_name):
                raise ServiceUnavailableError(f"Service {service_name} is not available")
            
            # Check circuit breaker
            circuit_breaker = self.circuit_breakers.get(service_name)
            if circuit_breaker and not circuit_breaker.can_execute():
                raise ServiceUnavailableError(f"Circuit breaker is open for {service_name}")
            
            # Route request to service
            response_data = await self._route_request(request)
            
            # Record success in circuit breaker
            if circuit_breaker:
                circuit_breaker.record_success()
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return OrchestrationResponse(
                request_id=request.request_id,
                service_type=request.service_type,
                success=True,
                data=response_data,
                processing_time=processing_time,
                service_used=service_name
            )
            
        except Exception as e:
            # Record failure in circuit breaker
            circuit_breaker = self.circuit_breakers.get(service_name)
            if circuit_breaker:
                circuit_breaker.record_failure()
            
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return OrchestrationResponse(
                request_id=request.request_id,
                service_type=request.service_type,
                success=False,
                error=str(e),
                processing_time=processing_time,
                service_used=service_name
            )
    
    def _is_service_available(self, service_name: str) -> bool:
        """Check if a service is available for requests."""
        config = self.services.get(service_name)
        if not config or not config.enabled:
            return False
        
        health = self.health_status.get(service_name)
        if not health:
            return False
        
        return health.status in [ServiceStatus.HEALTHY, ServiceStatus.DEGRADED]
    
    async def _route_request(self, request: OrchestrationRequest) -> Dict[str, Any]:
        """Route a request to the appropriate service."""
        service_name = request.service_type.value
        config = self.services[service_name]
        
        # Determine endpoint based on service type and payload
        endpoint = self._determine_endpoint(request)
        url = f"{config.base_url}{endpoint}"
        
        # Prepare request
        headers = {
            "Content-Type": "application/json",
            "X-Request-ID": request.request_id
        }
        
        if request.user_id:
            headers["X-User-ID"] = request.user_id
        
        if request.session_id:
            headers["X-Session-ID"] = request.session_id
        
        # Make request
        timeout = request.timeout or config.timeout
        response = await self.http_client.post(
            url,
            json=request.payload,
            headers=headers,
            timeout=timeout
        )
        
        if response.status_code != 200:
            raise GuardServiceError(f"Service returned status {response.status_code}")
        
        return response.json()
    
    def _determine_endpoint(self, request: OrchestrationRequest) -> str:
        """Determine the appropriate endpoint for a request."""
        service_type = request.service_type
        
        # Default endpoints for each service type
        endpoints = {
            GuardServiceType.TOKEN_GUARD: "/api/v1/optimize",
            GuardServiceType.TRUST_GUARD: "/api/v1/validate",
            GuardServiceType.CONTEXT_GUARD: "/api/v1/analyze",
            GuardServiceType.BIAS_GUARD: "/api/v1/detect"
        }
        
        return endpoints.get(service_type, "/api/v1/process")
    
    async def get_service_health(self, service_name: Optional[str] = None) -> Union[ServiceHealth, Dict[str, ServiceHealth]]:
        """Get health status for services."""
        if service_name:
            return self.health_status.get(service_name, ServiceHealth(
                service_name=service_name,
                status=ServiceStatus.UNKNOWN,
                last_check=datetime.now(),
                error_message="Service not found"
            ))
        return self.health_status.copy()
    
    async def refresh_health_checks(self):
        """Refresh health checks for all services."""
        tasks = []
        for service_name in self.services.keys():
            tasks.append(self._check_service_health(service_name))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def shutdown(self):
        """Shutdown the orchestrator and cleanup resources."""
        if self.http_client:
            await self.http_client.aclose()
        logger.info("CodeGuardians Gateway Orchestrator shutdown complete")


# Global orchestrator instance
orchestrator = GuardServiceOrchestrator()
