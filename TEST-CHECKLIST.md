# Frigate Middleware API - Test Checklist

## 🧪 Phase 1 Endpoints Test Checklist

### Import Instructions
1. Download `insomnia-automated-tests.json`
2. Open Insomnia
3. Click "Import" → "From File"
4. Select the downloaded file
5. Switch to "Development Environment" (localhost:5002) or "Production Environment" (10.100.6.2:5002)

---

## ✅ Test Results Checklist

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

- [ ] **2.1 Cameras List** - `GET /v1/api/cameras/list`
  - **Expected**: 200 OK, array of camera names
  - **Check**: Returns 11 cameras: admin_office, employees_01-08, meeting_room, reception

### 3. Media APIs

- [ ] **3.1 Recent Recordings (All)** - `GET /v1/api/recent-media/recordings?limit=5`
  - **Expected**: 200 OK, array of recording objects
  - **Check**: Real video files, working video_urls pointing to 10.0.20.6:8000

- [ ] **3.2 Recent Recordings (Filtered)** - `GET /v1/api/recent-media/recordings?camera=employees_01&limit=3`
  - **Expected**: 200 OK, filtered recordings
  - **Check**: Only employees_01 camera recordings, working URLs

- [ ] **3.3 Recent Clips (All)** - `GET /v1/api/recent-media/clips?limit=5`
  - **Expected**: 200 OK, array of clip objects
  - **Check**: Real event clips, working thumbnail_urls pointing to 10.0.20.6:8000

- [ ] **3.4 Recent Clips (Filtered)** - `GET /v1/api/recent-media/clips?camera=employees_04&limit=3`
  - **Expected**: 200 OK, filtered clips
  - **Check**: Only employees_04 camera clips, working URLs

- [ ] **3.5 Test Media URLs (General)** - `GET /v1/api/recent-media/test-media`
  - **Expected**: 200 OK, test results
  - **Check**: Shows recent clip and recording URLs, status "found"

- [ ] **3.6 Test Media URLs (Specific Clip)** - `GET /v1/api/recent-media/test-media?clip_id=1760915764.052192-k1dp3s`
  - **Expected**: 200 OK, specific clip test
  - **Check**: Tests specific clip ID, shows thumbnail URL

- [ ] **3.7 Test Media URLs (Specific Recording)** - `GET /v1/api/recent-media/test-media?recording_id=1760915899.0-teptn7`
  - **Expected**: 200 OK, specific recording test
  - **Check**: Tests specific recording ID, shows video URL

### 4. Media Proxy Tests

- [ ] **4.1 Video Stream Test** - `GET /media/recordings/2025-10-19/23/employees_02/18.19.mp4`
  - **Expected**: 200 OK, video/mp4 content
  - **Check**: Content-Type: video/mp4, Accept-Ranges: bytes, file size > 0

- [ ] **4.2 Thumbnail Image Test** - `GET /media/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp`
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

## 🔧 Environment Switching

### Development Testing
- **Base URL**: `http://localhost:5002`
- **Database**: 10.0.20.6:5433
- **Video Server**: http://10.0.20.6:8000

### Production Testing
- **Base URL**: `http://10.100.6.2:5002`
- **Database**: 10.0.20.6:5433
- **Video Server**: http://10.0.20.6:8000

---

## 📊 Test Results Summary

**Total Tests**: 13 endpoints
**Expected Pass Rate**: 100%
**Real Data**: ✅ All endpoints use actual Frigate database
**No Mock Data**: ✅ All responses contain real video files and clips

---

## 🚀 Quick Start

1. Import `insomnia-automated-tests.json` into Insomnia
2. Select "Development Environment"
3. Run tests in order (1.1 → 1.2 → 1.3 → 2.1 → 3.1 → etc.)
4. Check each response against expected results
5. Mark completed tests in this checklist

**Ready to test!** 🎉
