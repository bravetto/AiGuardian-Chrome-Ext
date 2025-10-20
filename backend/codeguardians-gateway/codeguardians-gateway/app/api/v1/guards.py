"""
CodeGuardians Gateway - Guard Services API Routes

This module provides the API endpoints for interacting with guard services
through the unified gateway.
"""

import uuid
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import logging

from app.core.guard_orchestrator import (
    orchestrator,
    OrchestrationRequest,
    OrchestrationResponse,
    GuardServiceType,
    ServiceHealth
)
from app.core.exceptions import GuardServiceError, ServiceUnavailableError
from app.utils.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/api/v1/guards", tags=["Guard Services"])


class GuardRequest(BaseModel):
    """Request model for guard service operations."""
    service_type: str = Field(..., description="Type of guard service to use")
    payload: Dict[str, Any] = Field(..., description="Request payload for the guard service")
    user_id: Optional[str] = Field(None, description="User ID for request tracking")
    session_id: Optional[str] = Field(None, description="Session ID for request tracking")
    priority: int = Field(1, description="Request priority (1-10)")
    timeout: Optional[int] = Field(None, description="Request timeout in seconds")
    fallback_enabled: bool = Field(True, description="Enable fallback mechanisms")


class GuardResponse(BaseModel):
    """Response model for guard service operations."""
    request_id: str
    service_type: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None
    service_used: Optional[str] = None
    fallback_used: bool = False


class HealthResponse(BaseModel):
    """Response model for service health checks."""
    service_name: str
    status: str
    last_check: str
    response_time: Optional[float] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = {}


@router.post("/process", response_model=GuardResponse)
async def process_guard_request(
    request: GuardRequest,
    background_tasks: BackgroundTasks,
    http_request: Request
) -> GuardResponse:
    """
    Process a request through the appropriate guard service.
    
    This endpoint routes requests to the correct guard service based on the
    service_type parameter and returns the processed result.
    """
    try:
        # Generate unique request ID
        request_id = str(uuid.uuid4())
        
        # Validate service type
        try:
            service_type = GuardServiceType(request.service_type.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid service type: {request.service_type}. "
                       f"Valid types: {[t.value for t in GuardServiceType]}"
            )
        
        # Create orchestration request
        orchestration_request = OrchestrationRequest(
            request_id=request_id,
            service_type=service_type,
            payload=request.payload,
            user_id=request.user_id,
            session_id=request.session_id,
            priority=request.priority,
            timeout=request.timeout,
            fallback_enabled=request.fallback_enabled
        )
        
        # Process request through orchestrator
        response = await orchestrator.orchestrate_request(orchestration_request)
        
        # Log request for monitoring
        background_tasks.add_task(
            log_guard_request,
            request_id,
            service_type.value,
            request.user_id,
            response.success,
            response.processing_time
        )
        
        return GuardResponse(
            request_id=response.request_id,
            service_type=response.service_type.value,
            success=response.success,
            data=response.data,
            error=response.error,
            processing_time=response.processing_time,
            service_used=response.service_used,
            fallback_used=response.fallback_used
        )
        
    except GuardServiceError as e:
        logger.error(f"Guard service error: {e}")
        raise HTTPException(status_code=502, detail=str(e))
    except ServiceUnavailableError as e:
        logger.error(f"Service unavailable: {e}")
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in guard request processing: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/tokenguard/optimize", response_model=GuardResponse)
async def optimize_tokens(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    http_request: Request
) -> GuardResponse:
    """
    Optimize tokens using TokenGuard service.
    
    This endpoint provides direct access to TokenGuard's token optimization
    capabilities for cost reduction and efficiency.
    """
    guard_request = GuardRequest(
        service_type="tokenguard",
        payload=request,
        user_id=http_request.headers.get("X-User-ID"),
        session_id=http_request.headers.get("X-Session-ID")
    )
    
    return await process_guard_request(guard_request, background_tasks, http_request)


@router.post("/trustguard/validate", response_model=GuardResponse)
async def validate_trust(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    http_request: Request
) -> GuardResponse:
    """
    Validate trust and reliability using TrustGuard service.
    
    This endpoint provides direct access to TrustGuard's AI failure pattern
    detection and validation capabilities.
    """
    guard_request = GuardRequest(
        service_type="trustguard",
        payload=request,
        user_id=http_request.headers.get("X-User-ID"),
        session_id=http_request.headers.get("X-Session-ID")
    )
    
    return await process_guard_request(guard_request, background_tasks, http_request)


@router.post("/contextguard/analyze", response_model=GuardResponse)
async def analyze_context(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    http_request: Request
) -> GuardResponse:
    """
    Analyze context drift using ContextGuard service.
    
    This endpoint provides direct access to ContextGuard's context drift
    detection and memory management capabilities.
    """
    guard_request = GuardRequest(
        service_type="contextguard",
        payload=request,
        user_id=http_request.headers.get("X-User-ID"),
        session_id=http_request.headers.get("X-Session-ID")
    )
    
    return await process_guard_request(guard_request, background_tasks, http_request)


@router.post("/biasguard/detect", response_model=GuardResponse)
async def detect_bias(
    request: Dict[str, Any],
    background_tasks: BackgroundTasks,
    http_request: Request
) -> GuardResponse:
    """
    Detect bias using BiasGuard service.
    
    This endpoint provides direct access to BiasGuard's bias detection
    and mitigation capabilities.
    """
    guard_request = GuardRequest(
        service_type="biasguard",
        payload=request,
        user_id=http_request.headers.get("X-User-ID"),
        session_id=http_request.headers.get("X-Session-ID")
    )
    
    return await process_guard_request(guard_request, background_tasks, http_request)


@router.get("/health", response_model=Dict[str, HealthResponse])
async def get_services_health() -> Dict[str, HealthResponse]:
    """
    Get health status of all guard services.
    
    Returns the current health status, response times, and metadata
    for all registered guard services.
    """
    try:
        health_data = await orchestrator.get_service_health()
        
        response = {}
        for service_name, health in health_data.items():
            response[service_name] = HealthResponse(
                service_name=health.service_name,
                status=health.status.value,
                last_check=health.last_check.isoformat(),
                response_time=health.response_time,
                error_message=health.error_message,
                metadata=health.metadata
            )
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting service health: {e}")
        raise HTTPException(status_code=500, detail="Failed to get service health")


@router.get("/health/{service_name}", response_model=HealthResponse)
async def get_service_health(service_name: str) -> HealthResponse:
    """
    Get health status of a specific guard service.
    
    Returns the current health status, response time, and metadata
    for the specified guard service.
    """
    try:
        health = await orchestrator.get_service_health(service_name)
        
        return HealthResponse(
            service_name=health.service_name,
            status=health.status.value,
            last_check=health.last_check.isoformat(),
            response_time=health.response_time,
            error_message=health.error_message,
            metadata=health.metadata
        )
        
    except Exception as e:
        logger.error(f"Error getting health for service {service_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get health for {service_name}")


@router.post("/health/refresh")
async def refresh_health_checks(background_tasks: BackgroundTasks) -> JSONResponse:
    """
    Refresh health checks for all guard services.
    
    Triggers immediate health checks for all registered services
    and updates their status.
    """
    try:
        background_tasks.add_task(orchestrator.refresh_health_checks)
        
        return JSONResponse(
            status_code=202,
            content={"message": "Health checks refresh initiated"}
        )
        
    except Exception as e:
        logger.error(f"Error refreshing health checks: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh health checks")


@router.get("/services")
async def list_services() -> Dict[str, Any]:
    """
    List all available guard services and their configurations.
    
    Returns information about all registered guard services including
    their types, endpoints, and current status.
    """
    try:
        services_info = {}
        
        for service_name, config in orchestrator.services.items():
            health = orchestrator.health_status.get(service_name)
            
            services_info[service_name] = {
                "name": config.name,
                "service_type": config.service_type.value,
                "base_url": config.base_url,
                "enabled": config.enabled,
                "priority": config.priority,
                "tags": config.tags,
                "status": health.status.value if health else "unknown",
                "last_check": health.last_check.isoformat() if health else None
            }
        
        return {
            "services": services_info,
            "total_services": len(services_info),
            "healthy_services": len([s for s in services_info.values() if s["status"] == "healthy"])
        }
        
    except Exception as e:
        logger.error(f"Error listing services: {e}")
        raise HTTPException(status_code=500, detail="Failed to list services")


async def log_guard_request(
    request_id: str,
    service_type: str,
    user_id: Optional[str],
    success: bool,
    processing_time: Optional[float]
):
    """Log guard request for monitoring and analytics."""
    logger.info(
        f"Guard request processed - "
        f"ID: {request_id}, "
        f"Service: {service_type}, "
        f"User: {user_id}, "
        f"Success: {success}, "
        f"Time: {processing_time:.3f}s"
    )
