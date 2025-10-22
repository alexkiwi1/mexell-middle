#!/bin/bash

# Frigate Middleware API - Phase 1 Test Script
# Run this script to test all Phase 1 endpoints

BASE_URL="http://10.100.6.2:5002"
echo "🧪 Testing Frigate Middleware API - Phase 1"
echo "Base URL: $BASE_URL"
echo "=========================================="

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
    
    echo -e "\n${BLUE}Testing: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $http_code"
        echo "Response: $(echo "$body" | jq -r '.message // .success // "OK"' 2>/dev/null || echo "Valid response")"
    else
        echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $http_code"
        echo "Response: $body"
    fi
}

# Test media proxy
test_media_proxy() {
    local name="$1"
    local url="$2"
    
    echo -e "\n${BLUE}Testing Media Proxy: $name${NC}"
    echo "URL: $url"
    
    response=$(curl -s -I "$url")
    http_code=$(echo "$response" | head -n1 | cut -d' ' -f2)
    
    if [[ "$http_code" =~ ^[23][0-9][0-9]$ ]]; then
        echo -e "${GREEN}✅ PASS${NC} - Status: $http_code"
        content_type=$(echo "$response" | grep -i "content-type" | cut -d' ' -f2)
        echo "Content-Type: $content_type"
    else
        echo -e "${RED}❌ FAIL${NC} - Status: $http_code"
    fi
}

echo -e "\n${YELLOW}=== Phase 1: Foundation & Media APIs ===${NC}"

# 1. Health Check
test_endpoint "Health Check" "$BASE_URL/v1/health" "200"

# 2. Root Endpoint
test_endpoint "Root Endpoint" "$BASE_URL/v1/" "200"

# 3. API Info
test_endpoint "API Info" "$BASE_URL/v1/api/info" "200"

# 4. Cameras List
test_endpoint "Cameras List" "$BASE_URL/v1/api/cameras/list" "200"

# 5. Recent Recordings (All)
test_endpoint "Recent Recordings (All)" "$BASE_URL/v1/api/recent-media/recordings?limit=3" "200"

# 6. Recent Recordings (Filtered)
test_endpoint "Recent Recordings (Filtered)" "$BASE_URL/v1/api/recent-media/recordings?camera=employees_01&limit=2" "200"

# 7. Recent Clips (All)
test_endpoint "Recent Clips (All)" "$BASE_URL/v1/api/recent-media/clips?limit=3" "200"

# 8. Recent Clips (Filtered)
test_endpoint "Recent Clips (Filtered)" "$BASE_URL/v1/api/recent-media/clips?camera=employees_04&limit=2" "200"

# 9. Test Media URLs
test_endpoint "Test Media URLs" "$BASE_URL/v1/api/recent-media/test-media" "200"

# 10. Test Media URLs (Specific Clip)
test_endpoint "Test Media URLs (Clip)" "$BASE_URL/v1/api/recent-media/test-media?clip_id=1760915764.052192-k1dp3s" "200"

# 11. Test Media URLs (Specific Recording)
test_endpoint "Test Media URLs (Recording)" "$BASE_URL/v1/api/recent-media/test-media?recording_id=1760915899.0-teptn7" "200"

echo -e "\n${YELLOW}=== Media Proxy Tests ===${NC}"

# 12. Media Proxy - Video Stream
test_media_proxy "Video Stream" "$BASE_URL/media/recordings/2025-10-19/23/employees_02/18.19.mp4"

# 13. Media Proxy - Thumbnail
test_media_proxy "Thumbnail Image" "$BASE_URL/media/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp"

echo -e "\n${YELLOW}=== Test Summary ===${NC}"
echo "All Phase 1 endpoints have been tested."
echo "Check the results above for any failures."
echo ""
echo "To test with different parameters:"
echo "  curl \"$BASE_URL/v1/api/recent-media/recordings?camera=employees_02&limit=5\""
echo "  curl \"$BASE_URL/v1/api/recent-media/clips?camera=employees_03&limit=3\""
echo ""
echo "To test media proxy with different files:"
echo "  curl -I \"$BASE_URL/media/recordings/2025-10-19/23/employees_01/18.20.mp4\""
echo "  curl -I \"$BASE_URL/media/clips/review/thumb-employees_02-1760914420.651279-dlfiqf.webp\""

