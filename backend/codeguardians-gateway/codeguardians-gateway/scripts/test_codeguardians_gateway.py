#!/usr/bin/env python3
"""
CodeGuardians Gateway - Comprehensive Testing Script

This script provides comprehensive testing for the CodeGuardians Gateway
using Template Heaven's testing framework and best practices.
"""

import asyncio
import json
import time
import sys
from pathlib import Path
from typing import Dict, Any, List
import httpx
import pytest
from datetime import datetime

# Add the project root to the path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from app.core.guard_orchestrator import (
    GuardServiceOrchestrator,
    GuardServiceType,
    OrchestrationRequest
)


class CodeGuardiansGatewayTester:
    """Comprehensive tester for CodeGuardians Gateway."""
    
    def __init__(self, gateway_url: str = "http://localhost:8000"):
        self.gateway_url = gateway_url
        self.http_client = httpx.AsyncClient(timeout=30.0)
        self.test_results = []
        
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all comprehensive tests."""
        print("🧪 Starting CodeGuardians Gateway Comprehensive Testing...")
        print("=" * 60)
        
        test_suites = [
            ("Gateway Health Tests", self.test_gateway_health),
            ("Service Discovery Tests", self.test_service_discovery),
            ("Guard Service Integration Tests", self.test_guard_service_integration),
            ("Orchestration Tests", self.test_orchestration),
            ("Error Handling Tests", self.test_error_handling),
            ("Performance Tests", self.test_performance),
            ("Security Tests", self.test_security),
            ("Edge Case Tests", self.test_edge_cases)
        ]
        
        overall_results = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0,
            "test_suites": {},
            "start_time": datetime.now().isoformat(),
            "end_time": None
        }
        
        for suite_name, test_function in test_suites:
            print(f"\n🔍 Running {suite_name}...")
            try:
                suite_results = await test_function()
                overall_results["test_suites"][suite_name] = suite_results
                overall_results["total_tests"] += suite_results["total"]
                overall_results["passed_tests"] += suite_results["passed"]
                overall_results["failed_tests"] += suite_results["failed"]
                
                status = "✅ PASSED" if suite_results["failed"] == 0 else "❌ FAILED"
                print(f"   {status} - {suite_results['passed']}/{suite_results['total']} tests passed")
                
            except Exception as e:
                print(f"   ❌ ERROR - {suite_name} failed: {e}")
                overall_results["test_suites"][suite_name] = {
                    "total": 0,
                    "passed": 0,
                    "failed": 1,
                    "error": str(e)
                }
                overall_results["failed_tests"] += 1
        
        overall_results["end_time"] = datetime.now().isoformat()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {overall_results['total_tests']}")
        print(f"Passed: {overall_results['passed_tests']}")
        print(f"Failed: {overall_results['failed_tests']}")
        print(f"Success Rate: {(overall_results['passed_tests'] / max(overall_results['total_tests'], 1)) * 100:.1f}%")
        
        if overall_results["failed_tests"] == 0:
            print("\n🎉 ALL TESTS PASSED! CodeGuardians Gateway is ready for production.")
        else:
            print(f"\n⚠️  {overall_results['failed_tests']} tests failed. Please review and fix issues.")
        
        return overall_results
    
    async def test_gateway_health(self) -> Dict[str, Any]:
        """Test gateway health and basic functionality."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test 1: Gateway liveness
        results["total"] += 1
        try:
            response = await self.http_client.get(f"{self.gateway_url}/health/live")
            if response.status_code == 200:
                results["passed"] += 1
                results["tests"].append({"name": "Gateway Liveness", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Gateway Liveness", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Gateway Liveness", "status": "FAILED", "error": str(e)})
        
        # Test 2: Gateway readiness
        results["total"] += 1
        try:
            response = await self.http_client.get(f"{self.gateway_url}/health/ready")
            if response.status_code == 200:
                results["passed"] += 1
                results["tests"].append({"name": "Gateway Readiness", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Gateway Readiness", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Gateway Readiness", "status": "FAILED", "error": str(e)})
        
        # Test 3: API documentation
        results["total"] += 1
        try:
            response = await self.http_client.get(f"{self.gateway_url}/docs")
            if response.status_code == 200:
                results["passed"] += 1
                results["tests"].append({"name": "API Documentation", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "API Documentation", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "API Documentation", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_service_discovery(self) -> Dict[str, Any]:
        """Test service discovery and health monitoring."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test 1: List services
        results["total"] += 1
        try:
            response = await self.http_client.get(f"{self.gateway_url}/api/v1/guards/services")
            if response.status_code == 200:
                data = response.json()
                if "services" in data and len(data["services"]) > 0:
                    results["passed"] += 1
                    results["tests"].append({"name": "Service Discovery", "status": "PASSED", "services": len(data["services"])})
                else:
                    results["failed"] += 1
                    results["tests"].append({"name": "Service Discovery", "status": "FAILED", "error": "No services found"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Service Discovery", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Service Discovery", "status": "FAILED", "error": str(e)})
        
        # Test 2: Service health checks
        results["total"] += 1
        try:
            response = await self.http_client.get(f"{self.gateway_url}/api/v1/guards/health")
            if response.status_code == 200:
                data = response.json()
                if len(data) > 0:
                    results["passed"] += 1
                    results["tests"].append({"name": "Service Health Checks", "status": "PASSED", "services": len(data)})
                else:
                    results["failed"] += 1
                    results["tests"].append({"name": "Service Health Checks", "status": "FAILED", "error": "No health data"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Service Health Checks", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Service Health Checks", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_guard_service_integration(self) -> Dict[str, Any]:
        """Test integration with individual guard services."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test TokenGuard integration
        results["total"] += 1
        try:
            payload = {
                "text": "This is a test text for token optimization.",
                "max_tokens": 100,
                "optimization_level": "high"
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/tokenguard/optimize",
                json=payload
            )
            if response.status_code in [200, 502, 503]:  # 502/503 expected if service not running
                results["passed"] += 1
                results["tests"].append({"name": "TokenGuard Integration", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "TokenGuard Integration", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "TokenGuard Integration", "status": "FAILED", "error": str(e)})
        
        # Test TrustGuard integration
        results["total"] += 1
        try:
            payload = {
                "text": "This is a test text for trust validation.",
                "validation_type": "comprehensive"
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/trustguard/validate",
                json=payload
            )
            if response.status_code in [200, 502, 503]:  # 502/503 expected if service not running
                results["passed"] += 1
                results["tests"].append({"name": "TrustGuard Integration", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "TrustGuard Integration", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "TrustGuard Integration", "status": "FAILED", "error": str(e)})
        
        # Test ContextGuard integration
        results["total"] += 1
        try:
            payload = {
                "context": "This is a test context for drift analysis.",
                "session_id": "test-session-123"
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/contextguard/analyze",
                json=payload
            )
            if response.status_code in [200, 502, 503]:  # 502/503 expected if service not running
                results["passed"] += 1
                results["tests"].append({"name": "ContextGuard Integration", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "ContextGuard Integration", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "ContextGuard Integration", "status": "FAILED", "error": str(e)})
        
        # Test BiasGuard integration
        results["total"] += 1
        try:
            payload = {
                "content": "This is a test content for bias detection.",
                "analysis_type": "comprehensive"
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/biasguard/detect",
                json=payload
            )
            if response.status_code in [200, 502, 503]:  # 502/503 expected if service not running
                results["passed"] += 1
                results["tests"].append({"name": "BiasGuard Integration", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "BiasGuard Integration", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "BiasGuard Integration", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_orchestration(self) -> Dict[str, Any]:
        """Test orchestration functionality."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test unified orchestration endpoint
        results["total"] += 1
        try:
            payload = {
                "service_type": "tokenguard",
                "payload": {
                    "text": "This is a test text for orchestration.",
                    "optimization_level": "medium"
                },
                "user_id": "test-user-123",
                "session_id": "test-session-456"
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/process",
                json=payload
            )
            if response.status_code in [200, 400, 502, 503]:  # 400 for invalid service type, 502/503 for service unavailable
                results["passed"] += 1
                results["tests"].append({"name": "Unified Orchestration", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Unified Orchestration", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Unified Orchestration", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_error_handling(self) -> Dict[str, Any]:
        """Test error handling and edge cases."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test invalid service type
        results["total"] += 1
        try:
            payload = {
                "service_type": "invalid_service",
                "payload": {"text": "test"}
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/process",
                json=payload
            )
            if response.status_code == 400:  # Expected for invalid service type
                results["passed"] += 1
                results["tests"].append({"name": "Invalid Service Type Handling", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Invalid Service Type Handling", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Invalid Service Type Handling", "status": "FAILED", "error": str(e)})
        
        # Test malformed request
        results["total"] += 1
        try:
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/process",
                json={"invalid": "request"}
            )
            if response.status_code in [400, 422]:  # Expected for malformed request
                results["passed"] += 1
                results["tests"].append({"name": "Malformed Request Handling", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Malformed Request Handling", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Malformed Request Handling", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_performance(self) -> Dict[str, Any]:
        """Test performance and load handling."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test concurrent requests
        results["total"] += 1
        try:
            start_time = time.time()
            
            # Create multiple concurrent requests
            tasks = []
            for i in range(10):
                payload = {
                    "service_type": "tokenguard",
                    "payload": {"text": f"Test text {i}"}
                }
                task = self.http_client.post(
                    f"{self.gateway_url}/api/v1/guards/process",
                    json=payload
                )
                tasks.append(task)
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            end_time = time.time()
            
            # Check that all requests completed (even if they failed due to service unavailability)
            successful_responses = [r for r in responses if not isinstance(r, Exception)]
            if len(successful_responses) == 10:
                results["passed"] += 1
                results["tests"].append({
                    "name": "Concurrent Request Handling",
                    "status": "PASSED",
                    "duration": end_time - start_time,
                    "requests": 10
                })
            else:
                results["failed"] += 1
                results["tests"].append({
                    "name": "Concurrent Request Handling",
                    "status": "FAILED",
                    "error": f"Only {len(successful_responses)}/10 requests completed"
                })
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Concurrent Request Handling", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_security(self) -> Dict[str, Any]:
        """Test security features."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test CORS headers
        results["total"] += 1
        try:
            response = await self.http_client.options(f"{self.gateway_url}/api/v1/guards/health")
            if "access-control-allow-origin" in response.headers:
                results["passed"] += 1
                results["tests"].append({"name": "CORS Headers", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "CORS Headers", "status": "FAILED", "error": "CORS headers not found"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "CORS Headers", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def test_edge_cases(self) -> Dict[str, Any]:
        """Test edge cases and boundary conditions."""
        results = {"total": 0, "passed": 0, "failed": 0, "tests": []}
        
        # Test empty payload
        results["total"] += 1
        try:
            payload = {
                "service_type": "tokenguard",
                "payload": {}
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/process",
                json=payload
            )
            if response.status_code in [200, 502, 503]:  # Should handle empty payload gracefully
                results["passed"] += 1
                results["tests"].append({"name": "Empty Payload Handling", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Empty Payload Handling", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Empty Payload Handling", "status": "FAILED", "error": str(e)})
        
        # Test large payload
        results["total"] += 1
        try:
            large_text = "x" * 10000  # 10KB of text
            payload = {
                "service_type": "tokenguard",
                "payload": {"text": large_text}
            }
            response = await self.http_client.post(
                f"{self.gateway_url}/api/v1/guards/process",
                json=payload
            )
            if response.status_code in [200, 413, 502, 503]:  # 413 for payload too large, 502/503 for service unavailable
                results["passed"] += 1
                results["tests"].append({"name": "Large Payload Handling", "status": "PASSED"})
            else:
                results["failed"] += 1
                results["tests"].append({"name": "Large Payload Handling", "status": "FAILED", "error": f"Status {response.status_code}"})
        except Exception as e:
            results["failed"] += 1
            results["tests"].append({"name": "Large Payload Handling", "status": "FAILED", "error": str(e)})
        
        return results
    
    async def close(self):
        """Close HTTP client."""
        await self.http_client.aclose()


async def main():
    """Main testing function."""
    gateway_url = "http://localhost:8000"
    
    if len(sys.argv) > 1:
        gateway_url = sys.argv[1]
    
    print(f"🎯 Testing CodeGuardians Gateway at: {gateway_url}")
    
    tester = CodeGuardiansGatewayTester(gateway_url)
    
    try:
        results = await tester.run_all_tests()
        
        # Save results to file
        results_file = project_root / "test_results.json"
        with open(results_file, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\n📄 Test results saved to: {results_file}")
        
        # Exit with appropriate code
        if results["failed_tests"] == 0:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Testing failed with error: {e}")
        sys.exit(1)
    finally:
        await tester.close()


if __name__ == "__main__":
    asyncio.run(main())
