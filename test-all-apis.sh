#!/bin/bash

# Complete API Test Suite for Frigate Middleware
# Tests all services, builds container, and validates all APIs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://10.0.20.8:5002/v1"
CONTAINER_NAME="mexell-middle-node-app-1"
IMAGE_NAME="node-app"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test results tracking
declare -A TEST_RESULTS
declare -A PERFORMANCE_RESULTS

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

skip_test() {
    SKIPPED_TESTS=$((SKIPPED_TESTS + 1))
    echo -e "${YELLOW}⏭️  SKIP${NC}"
}

# Enhanced test function with performance tracking
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local timeout="${4:-15}"
    local method="${5:-GET}"
    local data="${6:-}"
    
    echo -n "Testing $name... "
    increment_test
    
    local start_time=$(date +%s%3N)
    
    # Prepare curl command
    local curl_cmd="timeout $timeout curl -s -w \"%{http_code}\""
    
    if [ "$method" = "POST" ]; then
        curl_cmd="$curl_cmd -X POST"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    curl_cmd="$curl_cmd \"$url\""
    
    # Execute request
    local response
    response=$(eval $curl_cmd 2>/dev/null || echo "000")
    
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    local status_code="${response: -3}"
    local body="${response%???}"
    
    # Store performance data
    PERFORMANCE_RESULTS["$name"]="$response_time"
    
    # Validate response
    if [ "$status_code" = "$expected_status" ]; then
        pass_test
        TEST_RESULTS["$name"]="PASS"
        
        # Additional validation for successful responses
        if [ "$status_code" = "200" ] || [ "$status_code" = "201" ]; then
            validate_json_response "$name" "$body"
        fi
        
        # Performance check
        if [ $response_time -gt 5000 ]; then
            echo "  ⚠️  Slow response: ${response_time}ms"
        elif [ $response_time -gt 2000 ]; then
            echo "  ⚠️  Moderate response: ${response_time}ms"
        else
            echo "  ⚡ Fast response: ${response_time}ms"
        fi
        
        return 0
    else
        fail_test
        TEST_RESULTS["$name"]="FAIL"
        echo "  Expected: $expected_status, Got: $status_code"
        
        if [ ${#body} -lt 500 ]; then
            echo "  Response: $body"
        else
            echo "  Response: ${body:0:500}..."
        fi
        
        return 1
    fi
}

# Validate JSON response structure
validate_json_response() {
    local name="$1"
    local body="$2"
    
    # Check if response is valid JSON
    if echo "$body" | jq . >/dev/null 2>&1; then
        echo "  ✅ Valid JSON response"
        
        # Check for required fields
        if echo "$body" | jq -e '.success' >/dev/null 2>&1; then
            echo "  ✅ Success field present"
        fi
        
        if echo "$body" | jq -e '.message' >/dev/null 2>&1; then
            echo "  ✅ Message field present"
        fi
        
        if echo "$body" | jq -e '.timestamp' >/dev/null 2>&1; then
            echo "  ✅ Timestamp field present"
        fi
        
    else
        echo "  ⚠️  Invalid JSON response"
    fi
}

# Test database connectivity
test_database_connectivity() {
    echo -e "${BLUE}🗄️  Testing Database Connectivity${NC}"
    echo "================================="
    
    test_endpoint "Database Health Check" "$API_BASE/health" "200" 10
}

# Test core APIs
test_core_apis() {
    echo -e "${BLUE}🔧 Testing Core APIs${NC}"
    echo "====================="
    
    test_endpoint "Health Check" "$API_BASE/health" "200" 10
    test_endpoint "Camera List" "$API_BASE/api/cameras" "200" 15
    test_endpoint "Camera Summary" "$API_BASE/api/cameras/summary?hours=1" "200" 20
    test_endpoint "Camera Activity" "$API_BASE/api/cameras/activity?hours=1&limit=10" "200" 20
    test_endpoint "Camera Status" "$API_BASE/api/cameras/status?hours=1" "200" 20
    test_endpoint "Camera Violations" "$API_BASE/api/cameras/violations?hours=1" "200" 20
}

# Test mobile APIs
test_mobile_apis() {
    echo -e "${BLUE}📱 Testing Mobile APIs${NC}"
    echo "======================"
    
    test_endpoint "Mobile Settings" "$API_BASE/api/mobile/settings" "200" 10
    test_endpoint "Mobile Dashboard" "$API_BASE/api/mobile/dashboard?hours=1" "200" 20
    test_endpoint "Mobile Violations" "$API_BASE/api/mobile/violations?hours=1&limit=10" "200" 20
    test_endpoint "Mobile Employees" "$API_BASE/api/mobile/employees?hours=1" "200" 20
    test_endpoint "Mobile Cameras" "$API_BASE/api/mobile/cameras?hours=1" "200" 20
    test_endpoint "Mobile Notifications" "$API_BASE/api/mobile/notifications?hours=1&limit=5" "200" 20
    test_endpoint "Mobile Sync Data" "$API_BASE/api/mobile/sync?limit=10" "200" 20
}

# Test employee APIs
test_employee_apis() {
    echo -e "${BLUE}👥 Testing Employee APIs${NC}"
    echo "======================="
    
    test_endpoint "Employee Work Hours" "$API_BASE/api/employees/work-hours?hours=1" "200" 20
    test_endpoint "Employee Break Time" "$API_BASE/api/employees/break-time?hours=1" "200" 20
    test_endpoint "Employee Attendance" "$API_BASE/api/employees/attendance?hours=1" "200" 20
    test_endpoint "Employee Activity Patterns" "$API_BASE/api/employees/activity-patterns?hours=1" "200" 20
}

# Test zone APIs
test_zone_apis() {
    echo -e "${BLUE}🏢 Testing Zone APIs${NC}"
    echo "===================="
    
    test_endpoint "Desk Occupancy" "$API_BASE/api/zones/desk-occupancy?hours=1" "200" 20
    test_endpoint "Zone Utilization" "$API_BASE/api/zones/utilization?hours=1" "200" 20
    test_endpoint "Employee Zone Preferences" "$API_BASE/api/zones/employee-preferences?hours=1" "200" 20
    test_endpoint "Zone Activity Patterns" "$API_BASE/api/zones/activity-patterns?hours=1" "200" 20
}

# Test analytics APIs
test_analytics_apis() {
    echo -e "${BLUE}📊 Testing Analytics APIs${NC}"
    echo "========================="
    
    test_endpoint "Analytics Dashboard" "$API_BASE/api/analytics/dashboard?hours=1" "200" 30
    test_endpoint "Analytics Trends" "$API_BASE/api/analytics/trends?hours=1" "200" 30
    test_endpoint "Performance Metrics" "$API_BASE/api/analytics/performance?hours=1" "200" 30
    test_endpoint "Predictive Analytics" "$API_BASE/api/analytics/predictive?hours=1" "200" 30
    test_endpoint "Custom Reports" "$API_BASE/api/analytics/reports?hours=1" "200" 30
}

# Test performance APIs
test_performance_apis() {
    echo -e "${BLUE}⚡ Testing Performance APIs${NC}"
    echo "============================"
    
    test_endpoint "Performance Metrics" "$API_BASE/api/performance/metrics" "200" 10
    test_endpoint "Performance Summary" "$API_BASE/api/performance/summary" "200" 10
    test_endpoint "System Health" "$API_BASE/api/performance/health" "200" 10
    test_endpoint "Performance Recommendations" "$API_BASE/api/performance/recommendations" "200" 10
    test_endpoint "Cache Statistics" "$API_BASE/api/performance/cache/stats" "200" 10
    test_endpoint "Cache Keys" "$API_BASE/api/performance/cache/keys" "200" 10
    test_endpoint "Clear Cache" "$API_BASE/api/performance/cache/clear" "200" 5 "POST"
    test_endpoint "Reset Performance Metrics" "$API_BASE/api/performance/reset" "200" 5 "POST"
}

# Test WebSocket APIs
test_websocket_apis() {
    echo -e "${BLUE}🔌 Testing WebSocket APIs${NC}"
    echo "=========================="
    
    test_endpoint "WebSocket Stats" "$API_BASE/api/websocket/stats" "200" 10
    test_endpoint "WebSocket Activity" "$API_BASE/api/websocket/activity?hours=1" "200" 20
    test_endpoint "WebSocket Test Event" "$API_BASE/api/websocket/test" "200" 5 "POST"
}

# Test media APIs
test_media_apis() {
    echo -e "${BLUE}🎬 Testing Media APIs${NC}"
    echo "====================="
    
    test_endpoint "Media Proxy Root" "$API_BASE/media/" "200" 10
    test_endpoint "Media Recordings" "$API_BASE/media/recordings/" "200" 10
    test_endpoint "Media Clips" "$API_BASE/media/clips/" "200" 10
}

# Test documentation APIs
test_documentation_apis() {
    echo -e "${BLUE}📚 Testing Documentation APIs${NC}"
    echo "============================="
    
    test_endpoint "Swagger Documentation" "$API_BASE/docs" "200" 10
    test_endpoint "Swagger JSON" "$API_BASE/docs/swagger.json" "200" 10
}

# Build and test container
build_and_test_container() {
    echo -e "${BLUE}🐳 Building and Testing Container${NC}"
    echo "===================================="
    
    echo "Building Docker image..."
    if docker build . -t $IMAGE_NAME; then
        echo -e "${GREEN}✅ Docker image built successfully${NC}"
    else
        echo -e "${RED}❌ Docker build failed${NC}"
        return 1
    fi
    
    echo "Stopping existing container..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
    
    echo "Starting new container..."
    if docker run -d --name $CONTAINER_NAME -p 5002:5002 --network mexell-middle_node-network -e NODE_ENV=development $IMAGE_NAME; then
        echo -e "${GREEN}✅ Container started successfully${NC}"
    else
        echo -e "${RED}❌ Container start failed${NC}"
        return 1
    fi
    
    echo "Waiting for container to be ready..."
    sleep 10
    
    echo "Testing container health..."
    local retries=0
    local max_retries=30
    
    while [ $retries -lt $max_retries ]; do
        if curl -s "$API_BASE/health" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Container is healthy${NC}"
            break
        else
            echo "Waiting for container... ($((retries + 1))/$max_retries)"
            sleep 2
            retries=$((retries + 1))
        fi
    done
    
    if [ $retries -eq $max_retries ]; then
        echo -e "${RED}❌ Container failed to become healthy${NC}"
        return 1
    fi
}

# Generate performance report
generate_performance_report() {
    echo -e "${BLUE}📊 Performance Report${NC}"
    echo "===================="
    
    local total_time=0
    local fast_count=0
    local moderate_count=0
    local slow_count=0
    
    for endpoint in "${!PERFORMANCE_RESULTS[@]}"; do
        local time=${PERFORMANCE_RESULTS[$endpoint]}
        total_time=$((total_time + time))
        
        if [ $time -le 1000 ]; then
            fast_count=$((fast_count + 1))
        elif [ $time -le 3000 ]; then
            moderate_count=$((moderate_count + 1))
        else
            slow_count=$((slow_count + 1))
        fi
    done
    
    local avg_time=0
    if [ ${#PERFORMANCE_RESULTS[@]} -gt 0 ]; then
        avg_time=$((total_time / ${#PERFORMANCE_RESULTS[@]}))
    fi
    
    echo "Total Endpoints Tested: ${#PERFORMANCE_RESULTS[@]}"
    echo "Average Response Time: ${avg_time}ms"
    echo "Fast Responses (≤1s): $fast_count"
    echo "Moderate Responses (1-3s): $moderate_count"
    echo "Slow Responses (>3s): $slow_count"
    echo ""
    
    echo "Slowest Endpoints:"
    for endpoint in "${!PERFORMANCE_RESULTS[@]}"; do
        local time=${PERFORMANCE_RESULTS[$endpoint]}
        if [ $time -gt 3000 ]; then
            echo "  $endpoint: ${time}ms"
        fi
    done
}

# Generate test summary
generate_test_summary() {
    echo -e "${BLUE}📋 Test Summary${NC}"
    echo "==============="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    echo -e "Skipped: ${YELLOW}$SKIPPED_TESTS${NC}"
    
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    fi
    
    echo "Success Rate: $success_rate%"
    echo ""
    
    if [ $FAILED_TESTS -gt 0 ]; then
        echo -e "${RED}Failed Tests:${NC}"
        for test in "${!TEST_RESULTS[@]}"; do
            if [ "${TEST_RESULTS[$test]}" = "FAIL" ]; then
                echo "  ❌ $test"
            fi
        done
        echo ""
    fi
    
    if [ $success_rate -ge 90 ]; then
        echo -e "${GREEN}🎉 Excellent! All tests passed successfully!${NC}"
        return 0
    elif [ $success_rate -ge 70 ]; then
        echo -e "${YELLOW}⚠️  Good, but some tests failed. Check the failed tests above.${NC}"
        return 1
    else
        echo -e "${RED}❌ Many tests failed. Please check the configuration and try again.${NC}"
        return 1
    fi
}

# Main test execution
main() {
    echo -e "${PURPLE}🚀 Frigate Middleware API - Complete Test Suite${NC}"
    echo "====================================================="
    echo ""
    
    # Build and test container
    if ! build_and_test_container; then
        echo -e "${RED}❌ Container setup failed. Exiting.${NC}"
        exit 1
    fi
    
    echo ""
    
    # Run all test suites
    test_database_connectivity
    echo ""
    
    test_core_apis
    echo ""
    
    test_mobile_apis
    echo ""
    
    test_employee_apis
    echo ""
    
    test_zone_apis
    echo ""
    
    test_analytics_apis
    echo ""
    
    test_performance_apis
    echo ""
    
    test_websocket_apis
    echo ""
    
    test_media_apis
    echo ""
    
    test_documentation_apis
    echo ""
    
    # Generate reports
    generate_performance_report
    echo ""
    
    generate_test_summary
    
    # Cleanup
    echo ""
    echo "Cleaning up..."
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
    
    echo -e "${GREEN}✅ Test suite completed!${NC}"
}

# Run main function
main "$@"

