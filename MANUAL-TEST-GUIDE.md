# Frigate Middleware API - Manual Test Guide

## 🧪 Manual Testing Instructions

Since Insomnia test scripts aren't working, here's a manual testing guide to verify all endpoints.

### **Base URL**: `http://10.100.6.2:5002`

---

## ✅ Phase 1: Foundation & Media Tests

### 1.1 Health Check
**URL**: `GET http://10.100.6.2:5002/v1/health`

**Expected Response**:
```json
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "database": {
      "postgresql": "Connected",
      "mongodb": "Connected"
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, database connections show "Connected"

---

### 1.2 Root Endpoint
**URL**: `GET http://10.100.6.2:5002/v1/`

**Expected Response**:
```json
{
  "success": true,
  "message": "Frigate Middleware API",
  "data": {
    "name": "Frigate Middleware API",
    "version": "1.0.0",
    "servers": [...]
  }
}
```

**✅ Check**: Status 200, `success: true`, contains API name and version

---

### 1.3 API Info
**URL**: `GET http://10.100.6.2:5002/v1/api/info`

**Expected Response**:
```json
{
  "success": true,
  "message": "API Information",
  "data": {
    "api": {
      "name": "Frigate Middleware API",
      "version": "1.0.0"
    },
    "features": [...],
    "database": {
      "frigate_postgresql": {"status": "read-only"},
      "local_mongodb": {"status": "read-write"}
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, contains features and database config

---

### 1.4 Cameras List
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/list`

**Expected Response**:
```json
{
  "success": true,
  "message": "Cameras retrieved successfully",
  "data": {
    "cameras": ["admin_office", "employees_01", "employees_02", ...],
    "count": 11
  }
}
```

**✅ Check**: Status 200, `success: true`, cameras array with 11 cameras

---

### 1.5 Recent Recordings
**URL**: `GET http://10.100.6.2:5002/v1/api/recent-media/recordings?limit=3`

**Expected Response**:
```json
{
  "success": true,
  "message": "Recent recordings retrieved successfully",
  "data": {
    "recordings": [
      {
        "id": "...",
        "camera": "...",
        "videoUrl": "http://10.0.20.6:8000/...",
        "startTime": "2025-10-19T...",
        "endTime": "2025-10-19T..."
      }
    ]
  }
}
```

**✅ Check**: Status 200, `success: true`, recordings array, videoUrl points to 10.0.20.6:8000

---

### 1.6 Recent Clips
**URL**: `GET http://10.100.6.2:5002/v1/api/recent-media/clips?limit=3`

**Expected Response**:
```json
{
  "success": true,
  "message": "Recent clips retrieved successfully",
  "data": {
    "clips": [
      {
        "id": "...",
        "camera": "...",
        "thumbnailUrl": "http://10.0.20.6:8000/...",
        "startTime": "2025-10-19T..."
      }
    ]
  }
}
```

**✅ Check**: Status 200, `success: true`, clips array, thumbnailUrl points to 10.0.20.6:8000

---

## ✅ Phase 2: Camera Monitoring Tests

### 2.1 Camera Summary (All)
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/summary?hours=24`

**Expected Response**:
```json
{
  "success": true,
  "message": "Camera summaries retrieved successfully",
  "data": {
    "summaries": [
      {
        "camera": "employees_01",
        "status": "inactive",
        "detections": {
          "person": 0,
          "cellPhone": 0,
          "total": 0
        },
        "activityLevel": "low"
      }
    ],
    "count": 11
  }
}
```

**✅ Check**: Status 200, `success: true`, summaries array with camera data

---

### 2.2 Camera Summary (Specific)
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/employees_01/summary?hours=24`

**Expected Response**:
```json
{
  "success": true,
  "message": "Camera summary for employees_01 retrieved successfully",
  "data": {
    "camera": "employees_01",
    "status": "inactive",
    "timeRange": {
      "hours": 24,
      "startTime": "2025-10-18T...",
      "endTime": "2025-10-19T..."
    },
    "recordings": {
      "total": 0,
      "totalDuration": 0
    },
    "detections": {
      "total": 0,
      "person": 0,
      "cellPhone": 0
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, detailed camera data with timeRange and detections

---

### 2.3 Camera Activity
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/employees_01/activity?hours=1&limit=5`

**Expected Response**:
```json
{
  "success": true,
  "message": "Camera activity for employees_01 retrieved successfully",
  "data": {
    "activities": [],
    "count": 0,
    "camera": "employees_01",
    "filters": {
      "hours": 1,
      "limit": 5
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, activities array (may be empty)

---

### 2.4 Camera Status
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/employees_01/status`

**Expected Response**:
```json
{
  "success": true,
  "message": "Camera status for employees_01 retrieved successfully",
  "data": {
    "camera": "employees_01",
    "status": "inactive",
    "health": {
      "hasRecentActivity": false,
      "hasRecentRecordings": false
    },
    "metrics": {
      "recentDetections": 0,
      "recentRecordings": 0,
      "hourlyActivity": []
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, camera status and health metrics

---

### 2.5 Camera Violations
**URL**: `GET http://10.100.6.2:5002/v1/api/cameras/employees_01/violations?hours=24&limit=5`

**Expected Response**:
```json
{
  "success": true,
  "message": "Camera violations for employees_01 retrieved successfully",
  "data": {
    "violations": [],
    "count": 0,
    "camera": "employees_01",
    "filters": {
      "hours": 24,
      "limit": 5
    }
  }
}
```

**✅ Check**: Status 200, `success: true`, violations array (may be empty)

---

## 🎯 Quick Test Commands

### Using curl (from command line):
```bash
# Test health
curl "http://10.100.6.2:5002/v1/health"

# Test cameras
curl "http://10.100.6.2:5002/v1/api/cameras/list"

# Test recordings
curl "http://10.100.6.2:5002/v1/api/recent-media/recordings?limit=3"

# Test camera summary
curl "http://10.100.6.2:5002/v1/api/cameras/summary?hours=24"

# Test specific camera
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/status"
```

### Using Insomnia (without test scripts):
1. Import `insomnia-simple-tests.json`
2. Select "Development" environment
3. Run each request manually
4. Check response matches expected format above

---

## ✅ Success Criteria

**All endpoints should return**:
- ✅ HTTP Status: 200 OK
- ✅ JSON Response: `{"success": true, ...}`
- ✅ Real Data: From Frigate database (not mock data)
- ✅ Proper URLs: Media URLs point to `10.0.20.6:8000`
- ✅ Valid JSON: No parsing errors

**If any endpoint fails**:
- ❌ Check server is running: `curl http://10.100.6.2:5002/v1/health`
- ❌ Check database connection in health response
- ❌ Check URL format and parameters
- ❌ Check server logs for errors

---

## 🎉 Expected Results

**Phase 1**: 6/6 endpoints working ✅
**Phase 2**: 5/5 endpoints working ✅
**Total**: 11/11 endpoints working ✅

**Ready for Phase 3 implementation!** 🚀

