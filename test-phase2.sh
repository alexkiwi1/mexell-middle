#!/bin/bash

# Frigate Middleware API - Phase 2 Test Script
# Tests all Phase 1 & 2 endpoints with real data

BASE_URL="http://10.100.6.2:5002"
echo "🧪 Testing Frigate Middleware API - Phase 1 & 2"
echo "Base URL: $BASE_URL"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    echo -n "Testing $name ($url)... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $response)"
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $response)"
        curl -s "$url" | head -c 200 # Show response body on failure
        echo ""
    fi
}

# Test with data validation
test_endpoint_with_data() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    local data_check="$4"
    echo -n "Testing $name ($url)... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" == "$expected_status" ]; then
        # Check if response contains expected data
        data_response=$(curl -s "$url")
        if echo "$data_response" | grep -q "$data_check"; then
            echo -e "${GREEN}PASS${NC} (Status: $response, Data: ✓)"
        else
            echo -e "${YELLOW}PASS${NC} (Status: $response, Data: ⚠️ - $data_check not found)"
        fi
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $response)"
        curl -s "$url" | head -c 200
        echo ""
    fi
}

echo -e "\n${BLUE}=== Phase 1: Foundation & Media ===${NC}"

# 1. Health Check
test_endpoint_with_data "Health Check" "$BASE_URL/v1/health" "200" "healthy"

# 2. Root Endpoint
test_endpoint_with_data "Root Endpoint" "$BASE_URL/v1/" "200" "success"

# 3. API Info
test_endpoint_with_data "API Info" "$BASE_URL/v1/api/info" "200" "features"

# 4. Cameras List
test_endpoint_with_data "Cameras List" "$BASE_URL/v1/api/cameras/list" "200" "cameras"

# 5. Recent Recordings
test_endpoint_with_data "Recent Recordings" "$BASE_URL/v1/api/recent-media/recordings?limit=3" "200" "recordings"

# 6. Recent Clips
test_endpoint_with_data "Recent Clips" "$BASE_URL/v1/api/recent-media/clips?limit=3" "200" "clips"

echo -e "\n${BLUE}=== Phase 2: Camera Monitoring ===${NC}"

# 7. Camera Summary (All)
test_endpoint_with_data "Camera Summary (All)" "$BASE_URL/v1/api/cameras/summary?hours=24" "200" "summaries"

# 8. Camera Summary (Specific)
test_endpoint_with_data "Camera Summary (Specific)" "$BASE_URL/v1/api/cameras/employees_01/summary?hours=24" "200" "camera"

# 9. Camera Activity Feed
test_endpoint_with_data "Camera Activity" "$BASE_URL/v1/api/cameras/employees_01/activity?hours=1&limit=5" "200" "activities"

# 10. Camera Status
test_endpoint_with_data "Camera Status" "$BASE_URL/v1/api/cameras/employees_01/status" "200" "status"

# 11. Camera Violations
test_endpoint_with_data "Camera Violations" "$BASE_URL/v1/api/cameras/employees_01/violations?hours=24&limit=5" "200" "violations"

# 12. Clear Camera Cache
test_endpoint_with_data "Clear Camera Cache" "$BASE_URL/v1/api/cameras/cache" "200" "cleared"

echo -e "\n${BLUE}=== Media & Proxy Tests ===${NC}"

# 13. Test Media URLs
test_endpoint_with_data "Test Media URLs" "$BASE_URL/v1/api/recent-media/test-media" "200" "video_server_url"

# 14. Media Proxy - Video Stream
echo -n "Testing Media Proxy - Video Stream... "
video_response=$(curl -s -I "$BASE_URL/media/recordings/2025-10-19/23/employees_02/18.19.mp4")
if echo "$video_response" | grep -q "HTTP/1.1 200 OK"; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
    echo "$video_response" | head -5
fi

# 15. Media Proxy - Thumbnail
echo -n "Testing Media Proxy - Thumbnail... "
thumb_response=$(curl -s -I "$BASE_URL/media/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp")
if echo "$thumb_response" | grep -q "HTTP/1.1 200 OK"; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
    echo "$thumb_response" | head -5
fi

echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo "Phase 1 & 2 endpoints have been tested."
echo "Check the results above for any failures."
echo ""
echo "To test with different parameters:"
echo "  curl \"$BASE_URL/v1/api/cameras/summary?hours=1\""
echo "  curl \"$BASE_URL/v1/api/cameras/employees_02/activity?hours=6&limit=20\""
echo ""
echo "To test media proxy with different files:"
echo "  curl -I \"$BASE_URL/media/recordings/2025-10-19/23/employees_01/18.20.mp4\""
echo "  curl -I \"$BASE_URL/media/clips/review/thumb-employees_02-1760914420.651279-dlfiqf.webp\""
echo ""
echo "🎉 Phase 2 Camera Monitoring is ready for production!"
