"""
Tests for CodeGuardians Gateway Orchestrator

This module contains comprehensive tests for the guard service orchestrator,
including unit tests, integration tests, and edge case scenarios.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
import httpx

from app.core.guard_orchestrator import (
    GuardServiceOrchestrator,
    GuardServiceConfig,
    GuardServiceType,
    ServiceStatus,
    ServiceHealth,
    OrchestrationRequest,
    OrchestrationResponse,
    CircuitBreaker
)


class TestCircuitBreaker:
    """Test circuit breaker functionality."""
    
    def test_circuit_breaker_initial_state(self):
        """Test circuit breaker starts in CLOSED state."""
        cb = CircuitBreaker(threshold=3, timeout=60)
        assert cb.state == "CLOSED"
        assert cb.failure_count == 0
        assert cb.can_execute() is True
    
    def test_circuit_breaker_record_success(self):
        """Test recording successful operations."""
        cb = CircuitBreaker(threshold=3, timeout=60)
        cb.record_success()
        assert cb.state == "CLOSED"
        assert cb.failure_count == 0
    
    def test_circuit_breaker_record_failure(self):
        """Test recording failed operations."""
        cb = CircuitBreaker(threshold=3, timeout=60)
        cb.record_failure()
        assert cb.failure_count == 1
        assert cb.state == "CLOSED"
        assert cb.can_execute() is True
    
    def test_circuit_breaker_opens_after_threshold(self):
        """Test circuit breaker opens after threshold failures."""
        cb = CircuitBreaker(threshold=3, timeout=60)
        
        # Record failures up to threshold
        for _ in range(3):
            cb.record_failure()
        
        assert cb.state == "OPEN"
        assert cb.can_execute() is False
    
    def test_circuit_breaker_half_open_after_timeout(self):
        """Test circuit breaker transitions to HALF_OPEN after timeout."""
        cb = CircuitBreaker(threshold=3, timeout=1)  # 1 second timeout
        
        # Open the circuit breaker
        for _ in range(3):
            cb.record_failure()
        
        assert cb.state == "OPEN"
        
        # Wait for timeout and check transition
        import time
        time.sleep(1.1)
        assert cb.can_execute() is True
        assert cb.state == "HALF_OPEN"


class TestGuardServiceOrchestrator:
    """Test guard service orchestrator functionality."""
    
    @pytest.fixture
    async def orchestrator(self):
        """Create orchestrator instance for testing."""
        orch = GuardServiceOrchestrator()
        # Mock HTTP client to avoid actual network calls
        orch.http_client = AsyncMock()
        return orch
    
    @pytest.mark.asyncio
    async def test_orchestrator_initialization(self, orchestrator):
        """Test orchestrator initialization."""
        await orchestrator.initialize()
        
        assert orchestrator._initialized is True
        assert len(orchestrator.services) > 0
        assert len(orchestrator.circuit_breakers) > 0
        assert orchestrator.http_client is not None
    
    @pytest.mark.asyncio
    async def test_service_configuration_loading(self, orchestrator):
        """Test service configuration loading."""
        await orchestrator._load_service_configurations()
        
        # Check that all expected services are loaded
        expected_services = ["tokenguard", "trustguard", "contextguard", "biasguard"]
        for service_name in expected_services:
            assert service_name in orchestrator.services
            config = orchestrator.services[service_name]
            assert isinstance(config, GuardServiceConfig)
            assert config.enabled is True
    
    @pytest.mark.asyncio
    async def test_health_check_success(self, orchestrator):
        """Test successful health check."""
        # Mock successful HTTP response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "healthy"}
        mock_response.headers = {"content-type": "application/json"}
        
        orchestrator.http_client.get.return_value = mock_response
        
        health = await orchestrator._check_service_health("tokenguard")
        
        assert health.status == ServiceStatus.HEALTHY
        assert health.response_time is not None
        assert health.error_message is None
        assert health.metadata == {"status": "healthy"}
    
    @pytest.mark.asyncio
    async def test_health_check_failure(self, orchestrator):
        """Test failed health check."""
        # Mock failed HTTP response
        orchestrator.http_client.get.side_effect = httpx.ConnectError("Connection failed")
        
        health = await orchestrator._check_service_health("tokenguard")
        
        assert health.status == ServiceStatus.UNHEALTHY
        assert health.response_time is not None
        assert "Connection failed" in health.error_message
    
    @pytest.mark.asyncio
    async def test_orchestrate_request_success(self, orchestrator):
        """Test successful request orchestration."""
        await orchestrator.initialize()
        
        # Mock successful service response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        
        orchestrator.http_client.post.return_value = mock_response
        
        request = OrchestrationRequest(
            request_id="test-123",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is True
        assert response.data == {"result": "success"}
        assert response.service_used == "tokenguard"
        assert response.processing_time is not None
    
    @pytest.mark.asyncio
    async def test_orchestrate_request_service_unavailable(self, orchestrator):
        """Test request orchestration when service is unavailable."""
        await orchestrator.initialize()
        
        # Mark service as unhealthy
        orchestrator.health_status["tokenguard"] = ServiceHealth(
            service_name="tokenguard",
            status=ServiceStatus.UNHEALTHY,
            last_check=datetime.now(),
            error_message="Service down"
        )
        
        request = OrchestrationRequest(
            request_id="test-123",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is False
        assert "not available" in response.error
    
    @pytest.mark.asyncio
    async def test_orchestrate_request_circuit_breaker_open(self, orchestrator):
        """Test request orchestration when circuit breaker is open."""
        await orchestrator.initialize()
        
        # Open circuit breaker
        circuit_breaker = orchestrator.circuit_breakers["tokenguard"]
        for _ in range(5):  # Exceed threshold
            circuit_breaker.record_failure()
        
        request = OrchestrationRequest(
            request_id="test-123",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is False
        assert "Circuit breaker is open" in response.error
    
    @pytest.mark.asyncio
    async def test_endpoint_determination(self, orchestrator):
        """Test endpoint determination for different service types."""
        await orchestrator.initialize()
        
        # Test TokenGuard endpoint
        request = OrchestrationRequest(
            request_id="test-123",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={}
        )
        endpoint = orchestrator._determine_endpoint(request)
        assert endpoint == "/api/v1/optimize"
        
        # Test TrustGuard endpoint
        request.service_type = GuardServiceType.TRUST_GUARD
        endpoint = orchestrator._determine_endpoint(request)
        assert endpoint == "/api/v1/validate"
        
        # Test ContextGuard endpoint
        request.service_type = GuardServiceType.CONTEXT_GUARD
        endpoint = orchestrator._determine_endpoint(request)
        assert endpoint == "/api/v1/analyze"
        
        # Test BiasGuard endpoint
        request.service_type = GuardServiceType.BIAS_GUARD
        endpoint = orchestrator._determine_endpoint(request)
        assert endpoint == "/api/v1/detect"
    
    @pytest.mark.asyncio
    async def test_get_service_health(self, orchestrator):
        """Test getting service health information."""
        await orchestrator.initialize()
        
        # Test getting health for specific service
        health = await orchestrator.get_service_health("tokenguard")
        assert isinstance(health, ServiceHealth)
        assert health.service_name == "tokenguard"
        
        # Test getting health for all services
        all_health = await orchestrator.get_service_health()
        assert isinstance(all_health, dict)
        assert "tokenguard" in all_health
    
    @pytest.mark.asyncio
    async def test_refresh_health_checks(self, orchestrator):
        """Test refreshing health checks for all services."""
        await orchestrator.initialize()
        
        # Mock health check responses
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"status": "healthy"}
        mock_response.headers = {"content-type": "application/json"}
        
        orchestrator.http_client.get.return_value = mock_response
        
        await orchestrator.refresh_health_checks()
        
        # Verify health checks were performed
        assert orchestrator.http_client.get.call_count >= len(orchestrator.services)
    
    @pytest.mark.asyncio
    async def test_shutdown(self, orchestrator):
        """Test orchestrator shutdown."""
        await orchestrator.initialize()
        
        await orchestrator.shutdown()
        
        # Verify HTTP client was closed
        orchestrator.http_client.aclose.assert_called_once()


class TestIntegrationScenarios:
    """Test integration scenarios and edge cases."""
    
    @pytest.mark.asyncio
    async def test_concurrent_requests(self):
        """Test handling concurrent requests."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        # Mock successful responses
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        orchestrator.http_client.post.return_value = mock_response
        
        await orchestrator.initialize()
        
        # Create multiple concurrent requests
        requests = []
        for i in range(10):
            request = OrchestrationRequest(
                request_id=f"test-{i}",
                service_type=GuardServiceType.TOKEN_GUARD,
                payload={"text": f"test content {i}"}
            )
            requests.append(orchestrator.orchestrate_request(request))
        
        # Execute all requests concurrently
        responses = await asyncio.gather(*requests)
        
        # Verify all requests succeeded
        assert len(responses) == 10
        for response in responses:
            assert response.success is True
            assert response.data == {"result": "success"}
    
    @pytest.mark.asyncio
    async def test_service_failover_scenario(self):
        """Test service failover scenario."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        await orchestrator.initialize()
        
        # Mark primary service as unhealthy
        orchestrator.health_status["tokenguard"] = ServiceHealth(
            service_name="tokenguard",
            status=ServiceStatus.UNHEALTHY,
            last_check=datetime.now(),
            error_message="Service down"
        )
        
        request = OrchestrationRequest(
            request_id="test-failover",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        # Should fail due to service being unavailable
        assert response.success is False
        assert "not available" in response.error
    
    @pytest.mark.asyncio
    async def test_timeout_handling(self):
        """Test timeout handling."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        await orchestrator.initialize()
        
        # Mock timeout error
        orchestrator.http_client.post.side_effect = httpx.TimeoutException("Request timeout")
        
        request = OrchestrationRequest(
            request_id="test-timeout",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"},
            timeout=1  # 1 second timeout
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is False
        assert "timeout" in response.error.lower()
    
    @pytest.mark.asyncio
    async def test_invalid_service_type(self):
        """Test handling of invalid service type."""
        orchestrator = GuardServiceOrchestrator()
        await orchestrator.initialize()
        
        # This should not happen in normal operation due to validation,
        # but test the internal logic
        request = OrchestrationRequest(
            request_id="test-invalid",
            service_type=GuardServiceType.TOKEN_GUARD,  # Valid type
            payload={"text": "test content"}
        )
        
        # Manually set invalid service type to test internal handling
        request.service_type = None
        
        with pytest.raises(AttributeError):
            await orchestrator.orchestrate_request(request)


class TestEdgeCases:
    """Test edge cases and error conditions."""
    
    @pytest.mark.asyncio
    async def test_empty_payload(self):
        """Test handling of empty payload."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        orchestrator.http_client.post.return_value = mock_response
        
        await orchestrator.initialize()
        
        request = OrchestrationRequest(
            request_id="test-empty",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={}  # Empty payload
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is True
        assert response.data == {"result": "success"}
    
    @pytest.mark.asyncio
    async def test_large_payload(self):
        """Test handling of large payload."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"result": "success"}
        orchestrator.http_client.post.return_value = mock_response
        
        await orchestrator.initialize()
        
        # Create large payload
        large_text = "x" * 100000  # 100KB of text
        request = OrchestrationRequest(
            request_id="test-large",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": large_text}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is True
        assert response.data == {"result": "success"}
    
    @pytest.mark.asyncio
    async def test_malformed_response(self):
        """Test handling of malformed service response."""
        orchestrator = GuardServiceOrchestrator()
        orchestrator.http_client = AsyncMock()
        
        # Mock malformed response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.side_effect = ValueError("Invalid JSON")
        orchestrator.http_client.post.return_value = mock_response
        
        await orchestrator.initialize()
        
        request = OrchestrationRequest(
            request_id="test-malformed",
            service_type=GuardServiceType.TOKEN_GUARD,
            payload={"text": "test content"}
        )
        
        response = await orchestrator.orchestrate_request(request)
        
        assert response.success is False
        assert "Invalid JSON" in response.error


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
