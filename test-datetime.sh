#!/bin/bash

# Frigate Middleware API - Date/Time Parameter Test Script
# This script demonstrates the new date/time functionality

BASE_URL="http://10.100.6.2:5002"
echo "🧪 Testing Frigate Middleware API - Date/Time Parameters"
echo "Base URL: $BASE_URL"
echo "======================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="$3"
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$response" == "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (Status: $response)"
    else
        echo -e "${RED}FAIL${NC} (Expected: $expected_status, Got: $response)"
        curl -s "$url" | head -c 200
        echo ""
    fi
}

# Test with data extraction
test_with_data() {
    local name="$1"
    local url="$2"
    echo -n "Testing $name... "
    response=$(curl -s "$url")
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}PASS${NC}"
        # Extract and display key data
        echo "$response" | grep -o '"count":[0-9]*' | head -1
        echo "$response" | grep -o '"filters":{[^}]*}' | head -1
    else
        echo -e "${RED}FAIL${NC}"
        echo "$response" | head -c 200
        echo ""
    fi
}

echo -e "\n${BLUE}=== Phase 1 - Foundation APIs ===${NC}"

# 1. Health Check
test_endpoint "Health Check" "$BASE_URL/v1/health" "200"

# 2. Cameras List
test_endpoint "Cameras List" "$BASE_URL/v1/api/cameras/list" "200"

# 3. Media Clips
test_endpoint "Media Clips" "$BASE_URL/v1/api/recent-media/clips?limit=3" "200"

echo -e "\n${BLUE}=== Phase 2 - Camera Monitoring (Basic) ===${NC}"

# 4. Camera Summary (Last 24h)
test_with_data "Camera Summary (24h)" "$BASE_URL/v1/api/cameras/summary?hours=24"

# 5. Camera Violations (Last 24h)
test_with_data "Camera Violations (24h)" "$BASE_URL/v1/api/cameras/employees_01/violations?hours=24&limit=5"

# 6. Camera Activity
test_with_data "Camera Activity" "$BASE_URL/v1/api/cameras/employees_01/activity?hours=1&limit=5"

# 7. Camera Status
test_endpoint "Camera Status" "$BASE_URL/v1/api/cameras/employees_01/status" "200"

echo -e "\n${PURPLE}=== Date/Time Parameter Examples ===${NC}"

echo -e "\n${YELLOW}--- Specific Date Range (YYYY-MM-DD) ---${NC}"

# 8. Camera Summary - Specific Date
test_with_data "Camera Summary (Oct 1st)" "$BASE_URL/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01"

# 9. Camera Violations - Specific Date
test_with_data "Camera Violations (Oct 1st)" "$BASE_URL/v1/api/cameras/employees_01/violations?start_date=2025-10-01&end_date=2025-10-01&limit=3"

echo -e "\n${YELLOW}--- Time Range (ISO Format) ---${NC}"

# 10. Camera Summary - Work Hours
test_with_data "Camera Summary (Work Hours)" "$BASE_URL/v1/api/cameras/summary?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z"

# 11. Camera Violations - Morning Period
test_with_data "Camera Violations (Morning)" "$BASE_URL/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=3"

# 12. Camera Violations - Afternoon Period
test_with_data "Camera Violations (Afternoon)" "$BASE_URL/v1/api/cameras/employees_01/violations?start_date=2025-10-01T14:00:00.000Z&end_date=2025-10-01T16:00:00.000Z&limit=3"

echo -e "\n${YELLOW}--- Different Cameras with Date Range ---${NC}"

# 13. Multiple Camera Tests
for camera in employees_02 employees_03 employees_04; do
    test_with_data "Camera Violations ($camera)" "$BASE_URL/v1/api/cameras/$camera/violations?start_date=2025-10-01&end_date=2025-10-01&limit=2"
done

echo -e "\n${YELLOW}--- Backward Compatibility (Hours Parameter) ---${NC}"

# 14. Test hours parameter still works
test_with_data "Camera Summary (6h)" "$BASE_URL/v1/api/cameras/summary?hours=6"
test_with_data "Camera Violations (12h)" "$BASE_URL/v1/api/cameras/employees_01/violations?hours=12&limit=3"

echo -e "\n${YELLOW}--- Edge Cases ---${NC}"

# 15. Single Day (start_date only)
test_with_data "Single Day (start only)" "$BASE_URL/v1/api/cameras/summary?start_date=2025-10-01"

# 16. Single Day (end_date only)
test_with_data "Single Day (end only)" "$BASE_URL/v1/api/cameras/summary?end_date=2025-10-01"

# 17. No parameters (default 24h)
test_with_data "Default (no params)" "$BASE_URL/v1/api/cameras/summary"

echo -e "\n${BLUE}=== Cache Management ===${NC}"

# 18. Clear Cache
test_endpoint "Clear Cache" "$BASE_URL/v1/api/cameras/cache" "200"

echo -e "\n${GREEN}=== Test Summary ===${NC}"
echo "✅ All date/time parameter tests completed!"
echo ""
echo "📊 Key Features Tested:"
echo "  • YYYY-MM-DD date format"
echo "  • ISO 8601 time format"
echo "  • Specific time ranges"
echo "  • Multiple cameras"
echo "  • Backward compatibility"
echo "  • Edge cases"
echo ""
echo "🔧 Usage Examples:"
echo "  # Specific date"
echo "  curl \"$BASE_URL/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01\""
echo ""
echo "  # Time range"
echo "  curl \"$BASE_URL/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=5\""
echo ""
echo "  # Work hours analysis"
echo "  curl \"$BASE_URL/v1/api/cameras/summary?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z\""
