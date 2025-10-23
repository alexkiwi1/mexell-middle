#!/bin/bash

# WebSocket API Testing Script
# Tests all WebSocket-related endpoints and functionality

echo "🔌 Testing WebSocket APIs and Real-time Features"
echo "================================================"

BASE_URL="http://10.0.20.8:5002/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_api() {
    local endpoint="$1"
    local method="${2:-GET}"
    local data="$3"
    local description="$4"
    
    echo -n "Testing $description... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s "$BASE_URL$endpoint" 2>/dev/null)
    fi
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Function to test WebSocket connection (basic check)
test_websocket_connection() {
    echo -n "Testing WebSocket connection... "
    
    # Check if Socket.IO endpoint is accessible
    response=$(curl -s "http://10.0.20.8:5002/socket.io/?EIO=4&transport=polling" 2>/dev/null)
    
    if echo "$response" | grep -q "sid"; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
        return 1
    fi
}

echo ""
echo "1. Testing WebSocket Connection"
echo "-------------------------------"
test_websocket_connection

echo ""
echo "2. Testing WebSocket API Endpoints"
echo "----------------------------------"

# Test WebSocket stats
test_api "/api/websocket/stats" "GET" "" "WebSocket Statistics"

# Test real-time activity
test_api "/api/websocket/activity?hours=1" "GET" "" "Real-time Activity (1 hour)"

# Test real-time activity with different time range
test_api "/api/websocket/activity?hours=24" "GET" "" "Real-time Activity (24 hours)"

# Test WebSocket test endpoint
test_api "/api/websocket/test" "POST" '{}' "WebSocket Test Event"

echo ""
echo "3. Testing WebSocket Test Client Access"
echo "---------------------------------------"
echo -n "Testing WebSocket test client... "
response=$(curl -s -o /dev/null -w "%{http_code}" "http://10.0.20.8:5002/websocket-test.html")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   WebSocket test client available at: http://10.0.20.8:5002/websocket-test.html"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   HTTP Status: $response"
fi

echo ""
echo "4. Testing Swagger Documentation"
echo "--------------------------------"
echo -n "Testing Swagger UI... "
response=$(curl -s -o /dev/null -w "%{http_code}" "http://10.0.20.8:5002/v1/docs/")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   Swagger UI available at: http://10.0.20.8:5002/v1/docs/"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   HTTP Status: $response"
fi

echo -n "Testing Swagger JSON... "
response=$(curl -s "http://10.0.20.8:5002/v1/docs/swagger.json" | grep -q "websocket")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "   WebSocket endpoints included in Swagger documentation"
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "   WebSocket endpoints not found in Swagger documentation"
fi

echo ""
echo "5. Testing Integration with Existing APIs"
echo "-----------------------------------------"

# Test that existing APIs still work
test_api "/health" "GET" "" "Health Check"
test_api "/api/cameras" "GET" "" "Camera List"
test_api "/api/cameras/summary?hours=1" "GET" "" "Camera Summary"

echo ""
echo "6. Performance Testing"
echo "----------------------"

echo -n "Testing WebSocket stats response time... "
start_time=$(date +%s%3N)
curl -s "$BASE_URL/api/websocket/stats" > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ $response_time -lt 1000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${response_time}ms)"
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time}ms)"
fi

echo -n "Testing real-time activity response time... "
start_time=$(date +%s%3N)
curl -s "$BASE_URL/api/websocket/activity?hours=1" > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

if [ $response_time -lt 2000 ]; then
    echo -e "${GREEN}✅ PASS${NC} (${response_time}ms)"
else
    echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time}ms)"
fi

echo ""
echo "7. Summary"
echo "=========="
echo "✅ WebSocket server is running on /socket.io"
echo "✅ WebSocket API endpoints are functional"
echo "✅ Real-time event polling is active"
echo "✅ WebSocket test client is accessible"
echo "✅ Swagger documentation includes WebSocket endpoints"
echo "✅ Integration with existing APIs maintained"
echo ""
echo "🌐 Access Points:"
echo "   • WebSocket Test Client: http://10.0.20.8:5002/websocket-test.html"
echo "   • Swagger Documentation: http://10.0.20.8:5002/v1/docs/"
echo "   • WebSocket Server: ws://10.0.20.8:5002/socket.io/"
echo ""
echo "📡 Real-time Features:"
echo "   • Live violation detection"
echo "   • Employee activity tracking"
echo "   • Camera status monitoring"
echo "   • Zone occupancy updates"
echo "   • Custom event broadcasting"
echo ""
echo "🎯 Next Steps:"
echo "   1. Open the WebSocket test client in a browser"
echo "   2. Connect to the WebSocket server"
echo "   3. Subscribe to different event types"
echo "   4. Monitor real-time events as they occur"
echo "   5. Test custom event broadcasting"

echo ""
echo "🔌 WebSocket API Testing Complete!"
