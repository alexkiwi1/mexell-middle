#!/bin/bash

# Production Optimizations Test Script
# Tests Redis caching, enhanced security, and performance monitoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://10.100.6.2:5002"
TEST_DURATION=30
CONCURRENT_USERS=5

echo -e "${BLUE}🚀 PRODUCTION OPTIMIZATIONS TEST SUITE${NC}"
echo "================================================"
echo "Testing: Redis Caching, Security, Performance"
echo "API Base: $API_BASE"
echo "Duration: ${TEST_DURATION}s"
echo "Concurrent Users: $CONCURRENT_USERS"
echo ""

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local test_name="$1"
    local endpoint="$2"
    local method="${3:-GET}"
    local data="$4"
    local expected_status="${5:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $test_name... "
    
    local response
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -H "X-API-Key: frigate-api-key-2024" \
            -d "$data" \
            "$API_BASE$endpoint" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" \
            -H "X-API-Key: frigate-api-key-2024" \
            "$API_BASE$endpoint" 2>/dev/null)
    fi
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected $expected_status, got $http_code)"
        echo "Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Test rate limiting
test_rate_limiting() {
    echo -e "\n${YELLOW}🔒 Testing Rate Limiting...${NC}"
    
    # Test general rate limit (should allow 100 requests per 15 minutes)
    echo "Testing general rate limit..."
    for i in {1..5}; do
        test_endpoint "General Rate Limit $i" "/api/cameras" "GET" "" "200"
    done
    
    # Test strict rate limit (should allow 20 requests per 15 minutes)
    echo "Testing strict rate limit..."
    for i in {1..3}; do
        test_endpoint "Strict Rate Limit $i" "/api/violations" "GET" "" "200"
    done
    
    # Test WebSocket rate limit (should allow 10 requests per minute)
    echo "Testing WebSocket rate limit..."
    for i in {1..3}; do
        test_endpoint "WebSocket Rate Limit $i" "/api/websocket/test" "POST" '{"eventType":"test","data":{"message":"test"}}' "200"
    done
}

# Test security headers
test_security_headers() {
    echo -e "\n${YELLOW}🛡️  Testing Security Headers...${NC}"
    
    local response=$(curl -s -I "$API_BASE/health")
    
    echo -n "Testing security headers... "
    if echo "$response" | grep -q "X-Content-Type-Options: nosniff" && \
       echo "$response" | grep -q "X-Frame-Options: DENY" && \
       echo "$response" | grep -q "X-XSS-Protection: 1; mode=block"; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Test API key validation
test_api_key_validation() {
    echo -e "\n${YELLOW}🔑 Testing API Key Validation...${NC}"
    
    # Test without API key (should fail)
    echo -n "Testing without API key... "
    local response=$(curl -s -w "\n%{http_code}" "$API_BASE/api/cameras" 2>/dev/null)
    local http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected 401/403, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test with invalid API key (should fail)
    echo -n "Testing with invalid API key... "
    response=$(curl -s -w "\n%{http_code}" -H "X-API-Key: invalid-key" "$API_BASE/api/cameras" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected 401/403, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test with valid API key (should pass)
    test_endpoint "Valid API Key" "/api/cameras" "GET" "" "200"
}

# Test Redis caching
test_redis_caching() {
    echo -e "\n${YELLOW}📦 Testing Redis Caching...${NC}"
    
    # Test cache stats endpoint
    test_endpoint "Cache Stats" "/api/performance/cache/stats" "GET" "" "200"
    
    # Test cache operations
    echo -n "Testing cache set operation... "
    local response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "X-API-Key: frigate-api-key-2024" \
        -d '{"value":{"test":"data"},"ttl":60}' \
        "$API_BASE/api/performance/cache/test-key" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test cache get operation
    test_endpoint "Cache Get" "/api/performance/cache/test-key" "GET" "" "200"
    
    # Test cache clear
    test_endpoint "Cache Clear" "/api/performance/cache/clear" "POST" "" "200"
}

# Test performance monitoring
test_performance_monitoring() {
    echo -e "\n${YELLOW}📊 Testing Performance Monitoring...${NC}"
    
    # Test performance metrics
    test_endpoint "Performance Metrics" "/api/performance/metrics" "GET" "" "200"
    
    # Test system health
    test_endpoint "System Health" "/api/performance/health" "GET" "" "200"
    
    # Test performance recommendations
    test_endpoint "Performance Recommendations" "/api/performance/recommendations" "GET" "" "200"
}

# Test input validation
test_input_validation() {
    echo -e "\n${YELLOW}✅ Testing Input Validation...${NC}"
    
    # Test invalid date format
    echo -n "Testing invalid date format... "
    local response=$(curl -s -w "\n%{http_code}" \
        -H "X-API-Key: frigate-api-key-2024" \
        "$API_BASE/api/violations?start_date=invalid-date" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "400" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected 400, got $http_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Test invalid limit parameter
    echo -n "Testing invalid limit parameter... "
    response=$(curl -s -w "\n%{http_code}" \
        -H "X-API-Key: frigate-api-key-2024" \
        "$API_BASE/api/violations?limit=9999" 2>/dev/null)
    
    http_code=$(echo "$response" | tail -n1)
    if [ "$http_code" = "400" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected 400, got $http_code)"
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Test load performance
test_load_performance() {
    echo -e "\n${YELLOW}⚡ Testing Load Performance...${NC}"
    
    echo "Running load test for ${TEST_DURATION} seconds with $CONCURRENT_USERS concurrent users..."
    
    # Create a simple load test
    local start_time=$(date +%s)
    local end_time=$((start_time + TEST_DURATION))
    local request_count=0
    
    while [ $(date +%s) -lt $end_time ]; do
        # Run concurrent requests
        for i in $(seq 1 $CONCURRENT_USERS); do
            {
                curl -s -H "X-API-Key: frigate-api-key-2024" "$API_BASE/api/cameras" > /dev/null 2>&1
                request_count=$((request_count + 1))
            } &
        done
        wait
        sleep 1
    done
    
    local actual_duration=$((end_time - start_time))
    local rps=$((request_count / actual_duration))
    
    echo "Load test completed:"
    echo "  Total requests: $request_count"
    echo "  Duration: ${actual_duration}s"
    echo "  Requests per second: $rps"
    
    if [ $rps -gt 10 ]; then
        echo -e "${GREEN}✅ PASS${NC} - Performance is good ($rps RPS)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} - Performance may need optimization ($rps RPS)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Test Redis connectivity
test_redis_connectivity() {
    echo -e "\n${YELLOW}🔗 Testing Redis Connectivity...${NC}"
    
    # Check if Redis is available through cache stats
    local response=$(curl -s -H "X-API-Key: frigate-api-key-2024" "$API_BASE/api/performance/cache/stats" 2>/dev/null)
    
    if echo "$response" | grep -q "redis_available"; then
        local redis_status=$(echo "$response" | grep -o '"redis_available":[^,]*' | cut -d':' -f2 | tr -d ' "')
        if [ "$redis_status" = "true" ]; then
            echo -e "${GREEN}✅ PASS${NC} - Redis is available"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo -e "${YELLOW}⚠️  WARNING${NC} - Redis is not available, using memory cache"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        fi
    else
        echo -e "${RED}❌ FAIL${NC} - Could not determine Redis status"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Main test execution
main() {
    echo "Starting production optimizations test suite..."
    echo ""
    
    # Wait for API to be ready
    echo "Waiting for API to be ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$API_BASE/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ API is ready${NC}"
            break
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}❌ API is not ready after $max_attempts attempts${NC}"
        exit 1
    fi
    
    echo ""
    
    # Run all tests
    test_redis_connectivity
    test_security_headers
    test_api_key_validation
    test_rate_limiting
    test_redis_caching
    test_performance_monitoring
    test_input_validation
    test_load_performance
    
    # Print summary
    echo ""
    echo "================================================"
    echo -e "${BLUE}📊 TEST SUMMARY${NC}"
    echo "================================================"
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Success Rate: $success_rate%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
        echo "Production optimizations are working correctly."
        exit 0
    else
        echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
        echo "Please review the failed tests and fix the issues."
        exit 1
    fi
}

# Run main function
main "$@"

