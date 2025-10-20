#!/bin/bash

# Advanced Features Test Script
# Tests Mobile APIs, Performance Monitoring, and Caching

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://10.100.6.2:5002/v1"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test counter functions
increment_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

pass_test() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✅ PASS${NC}"
}

fail_test() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}❌ FAIL${NC}"
}

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local timeout="${4:-10}"
    local method="${5:-GET}"
    
    echo -n "Testing $name... "
    increment_test
    
    if [ "$method" = "POST" ]; then
        response=$(timeout $timeout curl -s -w "%{http_code}" -X POST "$url" 2>/dev/null || echo "000")
    else
        response=$(timeout $timeout curl -s -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    fi
    
    status_code="${response: -3}"
    body="${response%???}"
    
    if [ "$status_code" = "$expected_status" ]; then
        pass_test
        return 0
    else
        fail_test
        echo "  Expected: $expected_status, Got: $status_code"
        if [ ${#body} -lt 200 ]; then
            echo "  Response: $body"
        fi
        return 1
    fi
}

echo -e "${BLUE}🚀 Advanced Features Test Suite${NC}"
echo "=================================="
echo ""

# Mobile API Tests
echo -e "${YELLOW}📱 Mobile API Tests${NC}"
echo "-------------------"

test_endpoint "Mobile Settings" "$API_BASE/api/mobile/settings" "200"
test_endpoint "Mobile Dashboard (1 hour)" "$API_BASE/api/mobile/dashboard?hours=1" "200" 15
test_endpoint "Mobile Violations (1 hour)" "$API_BASE/api/mobile/violations?hours=1&limit=10" "200" 15
test_endpoint "Mobile Employees (1 hour)" "$API_BASE/api/mobile/employees?hours=1" "200" 15
test_endpoint "Mobile Cameras (1 hour)" "$API_BASE/api/mobile/cameras?hours=1" "200" 15
test_endpoint "Mobile Notifications (1 hour)" "$API_BASE/api/mobile/notifications?hours=1&limit=5" "200" 15
test_endpoint "Mobile Sync Data" "$API_BASE/api/mobile/sync?limit=10" "200" 15

echo ""

# Performance API Tests
echo -e "${YELLOW}⚡ Performance API Tests${NC}"
echo "-------------------------"

test_endpoint "Performance Metrics" "$API_BASE/api/performance/metrics" "200"
test_endpoint "Performance Summary" "$API_BASE/api/performance/summary" "200"
test_endpoint "Performance Recommendations" "$API_BASE/api/performance/recommendations" "200"
test_endpoint "System Health" "$API_BASE/api/performance/health" "200"

echo ""

# Cache API Tests
echo -e "${YELLOW}🗄️ Cache API Tests${NC}"
echo "------------------"

test_endpoint "Cache Statistics" "$API_BASE/api/performance/cache/stats" "200"
test_endpoint "Cache Keys" "$API_BASE/api/performance/cache/keys" "200"
test_endpoint "Clear Cache" "$API_BASE/api/performance/cache/clear" "200" 5 "POST"
test_endpoint "Reset Performance Metrics" "$API_BASE/api/performance/reset" "200" 5 "POST"

echo ""

# WebSocket Tests
echo -e "${YELLOW}🔌 WebSocket API Tests${NC}"
echo "----------------------"

test_endpoint "WebSocket Stats" "$API_BASE/api/websocket/stats" "200"
test_endpoint "WebSocket Activity" "$API_BASE/api/websocket/activity?hours=1" "200" 15
test_endpoint "WebSocket Test Event" "$API_BASE/api/websocket/test" "200" 5 "POST"

echo ""

# Core API Tests (Quick)
echo -e "${YELLOW}🔧 Core API Tests (Quick)${NC}"
echo "---------------------------"

test_endpoint "Health Check" "$API_BASE/health" "200"
test_endpoint "Camera List" "$API_BASE/api/cameras" "200"
test_endpoint "Swagger UI" "$API_BASE/docs" "200"
test_endpoint "Media Proxy" "$API_BASE/media/" "200"

echo ""

# Test Results Summary
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "========================"
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed.${NC}"
    exit 1
fi
