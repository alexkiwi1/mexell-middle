# Frigate Middleware API - Phase 2 Test Checklist

## 🧪 Phase 2: Camera Monitoring Test Checklist

### Import Instructions
1. Download `insomnia-phase2-tests.json`
2. Open Insomnia
3. Click "Import" → "From File"
4. Select the downloaded file
5. Switch to "Development Environment" (10.100.6.2:5002)

---

## ✅ Phase 1 Tests (Foundation & Media)

### 1. Foundation APIs

- [ ] **1.1 Health Check** - `GET /v1/health`
  - **Expected**: 200 OK, database connected to 10.0.20.6:5433
  - **Check**: `"status": "healthy"`, `"frigate_database": {"status": "connected"}`

- [ ] **1.2 Root Endpoint** - `GET /v1/`
  - **Expected**: 200 OK, API information
  - **Check**: Contains server URLs, endpoints list, version info

- [ ] **1.3 API Info** - `GET /v1/api/info`
  - **Expected**: 200 OK, detailed configuration
  - **Check**: Features list, database config, media server URL

### 2. Camera APIs

- [ ] **1.4 Cameras List** - `GET /v1/api/cameras/list`
  - **Expected**: 200 OK, array of camera names
  - **Check**: Returns 11 cameras: admin_office, employees_01-08, meeting_room, reception

### 3. Media APIs

- [ ] **1.5 Recent Recordings** - `GET /v1/api/recent-media/recordings?limit=5`
  - **Expected**: 200 OK, array of recording objects
  - **Check**: Real video files, working video_urls pointing to 10.0.20.6:8000

- [ ] **1.6 Recent Clips** - `GET /v1/api/recent-media/clips?limit=5`
  - **Expected**: 200 OK, array of clip objects
  - **Check**: Real event clips, working thumbnail_urls pointing to 10.0.20.6:8000

---

## ✅ Phase 2 Tests (Camera Monitoring)

### 4. Camera Summary APIs

- [ ] **2.1 Camera Summary (All)** - `GET /v1/api/cameras/summary?hours=24`
  - **Expected**: 200 OK, array of camera summaries
  - **Check**: Each camera has status, activity level, detection counts, recording info

- [ ] **2.2 Camera Summary (Specific)** - `GET /v1/api/cameras/employees_01/summary?hours=24`
  - **Expected**: 200 OK, detailed camera summary
  - **Check**: Camera name, status, time range, recordings, detections, recent clips

### 5. Camera Activity APIs

- [ ] **2.3 Camera Activity Feed** - `GET /v1/api/cameras/employees_01/activity?hours=1&limit=10`
  - **Expected**: 200 OK, array of activity events
  - **Check**: Timeline events with timestamps, labels, employee names, zones

### 6. Camera Status APIs

- [ ] **2.4 Camera Status** - `GET /v1/api/cameras/employees_01/status`
  - **Expected**: 200 OK, detailed camera status
  - **Check**: Status, health metrics, recent activity, hourly activity data

### 7. Camera Violations APIs

- [ ] **2.5 Camera Violations** - `GET /v1/api/cameras/employees_01/violations?hours=24&limit=10`
  - **Expected**: 200 OK, array of violations
  - **Check**: Cell phone detections with timestamps, employee names, confidence

### 8. Camera Cache Management

- [ ] **2.6 Clear Camera Cache** - `DELETE /v1/api/cameras/cache`
  - **Expected**: 200 OK, cache cleared
  - **Check**: Success message with timestamp

---

## ✅ Media & Proxy Tests

### 9. Media URL Testing

- [ ] **3.1 Test Media URLs** - `GET /v1/api/recent-media/test-media`
  - **Expected**: 200 OK, test results
  - **Check**: Shows recent clip and recording URLs, status "found"

### 10. Media Proxy Tests

- [ ] **3.2 Video Stream Test** - `GET /media/recordings/2025-10-19/23/employees_02/18.19.mp4`
  - **Expected**: 200 OK, video/mp4 content
  - **Check**: Content-Type: video/mp4, Accept-Ranges: bytes, file size > 0

- [ ] **3.3 Thumbnail Image Test** - `GET /media/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp`
  - **Expected**: 200 OK, image/webp content
  - **Check**: Content-Type: image/webp, file size > 0

---

## 🎯 Success Criteria

### ✅ All Tests Must Pass
- **Status Codes**: All endpoints return 200 OK
- **Response Time**: Under 500ms per request
- **Data Quality**: Real data from Frigate database (no mock data)
- **URLs**: All media URLs point to correct server (10.0.20.6:8000)
- **JSON Format**: Properly formatted responses with success: true

### ❌ Common Issues to Watch For
- **503 Service Unavailable**: Database connection failed
- **Empty Arrays**: No data in database (check timestamps)
- **404 Not Found**: Media files don't exist
- **502 Bad Gateway**: Video server unreachable
- **Invalid JSON**: Response parsing errors

---

## 🔧 Environment Configuration

### Development Testing
- **Base URL**: `http://10.100.6.2:5002`
- **Database**: 10.0.20.6:5433
- **Video Server**: http://10.0.20.6:8000

### Production Testing
- **Base URL**: `http://10.100.6.2:5002`
- **Database**: 10.0.20.6:5433
- **Video Server**: http://10.0.20.6:8000

---

## 📊 Test Results Summary

**Total Tests**: 16 endpoints
- **Phase 1**: 6 endpoints (Foundation & Media)
- **Phase 2**: 6 endpoints (Camera Monitoring)
- **Media Tests**: 3 endpoints (Media & Proxy)
- **Automated**: 1 endpoint (Test Suite)

**Expected Pass Rate**: 100%
**Real Data**: ✅ All endpoints use actual Frigate database
**No Mock Data**: ✅ All responses contain real data or empty arrays when no data

---

## 🚀 Quick Start

1. Import `insomnia-phase2-tests.json` into Insomnia
2. Select "Development Environment"
3. Run tests in order (1.1 → 1.2 → 1.3 → 2.1 → 2.2 → etc.)
4. Check each response against expected results
5. Mark completed tests in this checklist

---

## 📋 Phase 2 Features Tested

### Camera Monitoring
- ✅ Live camera summaries with activity levels
- ✅ Detailed camera analytics and statistics
- ✅ Real-time activity feeds from timeline
- ✅ Camera health status and metrics
- ✅ Camera-specific violation tracking
- ✅ Cache management for performance

### Data Integration
- ✅ Timeline table queries for activity data
- ✅ Recordings table queries for video metadata
- ✅ Reviewsegment table queries for clips
- ✅ Complex aggregations and statistics
- ✅ Real-time data processing

### Error Handling
- ✅ Array validation and null checks
- ✅ Database connection error handling
- ✅ Graceful degradation when no data
- ✅ Proper HTTP status codes
- ✅ Detailed error messages

**Ready to test Phase 2!** 🎉

---

## 🔄 Next Steps

After Phase 2 testing is complete:
1. Implement Phase 3: Violations Tracking
2. Add Phase 3 endpoints to test scripts
3. Update Insomnia collection
4. Continue with Phase 4-6 implementation
