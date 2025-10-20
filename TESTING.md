# Frigate Middleware API - Testing Guide

## Overview

This guide provides comprehensive testing resources for the Frigate Middleware API Phase 1 endpoints.

## Test Resources

### 1. Insomnia Collection
**File:** `insomnia-tests.json`

**Import Instructions:**
1. Open Insomnia
2. Click "Import" → "From File"
3. Select `insomnia-tests.json`
4. The collection will be imported with all Phase 1 endpoints

**Features:**
- 13 pre-configured requests
- Environment variables for easy switching between dev/prod
- Organized by Phase 1 endpoints
- Includes media proxy tests
- Real parameter examples from actual database

### 2. Bash Test Script
**File:** `test-script.sh`

**Run Instructions:**
```bash
# Make executable (if not already)
chmod +x test-script.sh

# Run all tests
./test-script.sh

# Run with custom base URL
BASE_URL="http://10.100.6.2:5002" ./test-script.sh
```

**Features:**
- Automated testing of all Phase 1 endpoints
- Color-coded output (✅ PASS / ❌ FAIL)
- HTTP status code validation
- Media proxy testing
- Real-time response validation

## Phase 1 Endpoints Tested

### Foundation APIs
1. **Health Check** - `GET /v1/health`
2. **Root Endpoint** - `GET /v1/`
3. **API Info** - `GET /v1/api/info`

### Camera APIs
4. **Cameras List** - `GET /v1/api/cameras/list`

### Media APIs
5. **Recent Recordings** - `GET /v1/api/recent-media/recordings`
6. **Recent Clips** - `GET /v1/api/recent-media/clips`
7. **Test Media URLs** - `GET /v1/api/recent-media/test-media`

### Media Proxy
8. **Video Streaming** - `GET /media/recordings/*`
9. **Thumbnail Images** - `GET /media/clips/review/*`

## Manual Testing Commands

### Basic Health Check
```bash
curl -v "http://localhost:5002/v1/health"
```

### List All Cameras
```bash
curl "http://localhost:5002/v1/api/cameras/list"
```

### Get Recent Recordings
```bash
# All cameras, limit 5
curl "http://localhost:5002/v1/api/recent-media/recordings?limit=5"

# Specific camera
curl "http://localhost:5002/v1/api/recent-media/recordings?camera=employees_01&limit=3"
```

### Get Recent Clips
```bash
# All cameras, limit 5
curl "http://localhost:5002/v1/api/recent-media/clips?limit=5"

# Specific camera
curl "http://localhost:5002/v1/api/recent-media/clips?camera=employees_04&limit=3"
```

### Test Media URLs
```bash
# Test recent media
curl "http://localhost:5002/v1/api/recent-media/test-media"

# Test specific clip
curl "http://localhost:5002/v1/api/recent-media/test-media?clip_id=1760915764.052192-k1dp3s"

# Test specific recording
curl "http://localhost:5002/v1/api/recent-media/test-media?recording_id=1760915899.0-teptn7"
```

### Test Media Proxy
```bash
# Test video streaming
curl -I "http://localhost:5002/media/recordings/2025-10-19/23/employees_02/18.19.mp4"

# Test thumbnail
curl -I "http://localhost:5002/media/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp"
```

## Expected Responses

### Health Check
```json
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "services": {
      "frigate_database": {
        "status": "connected"
      }
    }
  }
}
```

### Cameras List
```json
{
  "success": true,
  "data": {
    "cameras": ["admin_office", "employees_01", "employees_02", ...],
    "count": 11
  }
}
```

### Recent Recordings
```json
{
  "success": true,
  "data": {
    "recordings": [
      {
        "id": "1760915899.0-teptn7",
        "camera": "employees_02",
        "video_url": "http://10.0.20.6:8000/recordings/...",
        "start_time_iso": "2025-10-19T23:18:19.000Z"
      }
    ]
  }
}
```

## Environment Variables

### Development
- **Base URL:** `http://localhost:5002`
- **Database:** Frigate PostgreSQL (10.0.20.6:5433) + Local MongoDB
- **Media Server:** `http://10.0.20.6:8000`

### Production
- **Base URL:** `http://10.100.6.2:5002`
- **Database:** Frigate PostgreSQL (10.0.20.6:5433) + Local MongoDB
- **Media Server:** `http://10.0.20.6:8000`

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Docker containers are running
   - Check if port 5002 is available
   - Verify docker-compose.yml configuration

2. **Database Connection Failed**
   - Check PostgreSQL connection in health endpoint
   - Verify Frigate database credentials
   - Ensure network connectivity to 10.0.20.6:5433

3. **Media Files Not Found**
   - Verify video server is running on 10.0.20.6:8000
   - Check if media files exist in Frigate storage
   - Test media proxy endpoint

4. **Empty Responses**
   - Check if Frigate database has recent data
   - Verify camera names in database
   - Check timestamp ranges

### Debug Commands

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs node-app

# Test database connection
docker-compose exec node-app node -e "
const { query } = require('./src/config/postgres');
query('SELECT NOW()').then(console.log).catch(console.error);
"

# Test media server
curl -I "http://10.0.20.6:8000/recordings/2025-10-19/23/employees_02/18.19.mp4"
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test health endpoint
ab -n 100 -c 10 "http://localhost:5002/v1/health"

# Test cameras list
ab -n 50 -c 5 "http://localhost:5002/v1/api/cameras/list"

# Test recent recordings
ab -n 30 -c 3 "http://localhost:5002/v1/api/recent-media/recordings?limit=5"
```

### Memory Usage
```bash
# Monitor container resources
docker stats

# Check specific container
docker stats mexell-middle_node-app_1
```

## Test Data

All tests use **real data** from the Frigate database:
- **Cameras:** 11 active cameras from recordings table
- **Recordings:** Actual video files from last 24 hours
- **Clips:** Real event clips from reviewsegment table
- **Media URLs:** Working URLs pointing to Frigate video server

## Success Criteria

✅ **All endpoints return 200 OK**  
✅ **Real data from Frigate database**  
✅ **Media proxy serves files correctly**  
✅ **Response times under 500ms**  
✅ **No mock or placeholder data**  
✅ **Proper error handling**  

## Next Steps

After Phase 1 testing is complete:
1. Implement Phase 2: Camera Monitoring
2. Add Phase 2 endpoints to test scripts
3. Update Insomnia collection
4. Continue with Phase 3-6 implementation
