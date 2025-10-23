# Violations API - Frontend Developer Guide

## Overview

This document provides comprehensive API documentation for violation tracking and management, specifically designed for frontend developers. The violation system tracks cell phone usage violations with intelligent employee assignment, media URLs, and real-time monitoring capabilities.

## ✅ Recent Updates (Clean Response - Working URLs Only)

**Issue Resolved**: API now returns only working URLs, eliminating all 404 errors from fake URLs.

**What Was Fixed**:
- **Data Source**: Switched from `timeline` table to `reviewsegment` table
- **Media URLs**: Now use actual `thumb_path` values from database
- **ID Format**: Uses correct Frigate clip IDs (e.g., `bb5fqc`, `j6pqyo`)
- **Thumbnail URLs**: Guaranteed to work and return HTTP 200 OK
- **Video URLs**: Uses recording timestamp API with ±2 seconds for working video URLs
- **Clean Response**: Removed all fake URLs that could return 404 errors

**Before**: API returned fake URLs that caused 404 errors
**After**: Only working URLs are returned, with proper error handling for missing recordings

## Base Configuration

```javascript
const API_BASE = "http://10.0.20.8:5002/v1";
const VIDEO_SERVER = "http://10.0.20.6:8000";
```

## Core Violation APIs

### 1. Get Camera Violations

**Endpoint:** `GET /api/cameras/{camera_name}/violations`

**Description:** Get cell phone violations for a specific camera with employee assignment

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `camera_name` | string | Yes | - | Camera name (e.g., "employees_01") |
| `hours` | integer | No | 24 | Hours to look back |
| `start_date` | string | No | - | Start date (YYYY-MM-DD) |
| `end_date` | string | No | - | End date (YYYY-MM-DD) |
| `timezone` | string | No | "UTC" | Timezone for date conversion |
| `limit` | integer | No | 100 | Maximum violations to return |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/cameras/employees_01/violations?hours=24&limit=50`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Camera violations for employees_01 retrieved successfully",
  "data": {
    "violations": [
      {
        "timestamp": "2025-10-20T12:47:50.000Z",
        "timestampRelative": "2 hours ago",
        "camera": "employees_01",
        "assignedEmployee": "Muhammad Taha",
        "assignmentMethod": "desk_zone",
        "assignmentConfidence": "high",
        "assignmentReason": null,
        "faceEmployeeName": null,
        "deskEmployeeName": "Muhammad Taha",
        "zones": ["desk_11"],
        "objects": ["cell phone"],
        "confidence": 0.95,
        "type": "cell_phone",
        "media": {
          "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-employees_01-1761029742.097229-bb5fqc.webp",
          "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/06/employees_01/55.32.mp4#t=8.1,11.5",
          "timestamp": 1761029742.097229,
          "camera": "employees_01",
          "violation_id": "bb5fqc",
          "severity": "detection",
          "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
          "warning": "Both thumbnail and video URLs are guaranteed to work.",
          "video_url_error": null,
          "video_server_url": "http://10.0.20.6:8000"
        }
      }
    ],
    "count": 15,
    "camera": "employees_01",
    "filters": {
      "hours": 24,
      "limit": 100,
      "start_date": null,
      "end_date": null
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

### 2. Get Violations Summary by Employee

**Endpoint:** `GET /api/violations/summary`

**Description:** Get summary of all employee violations with statistics

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `hours` | integer | No | 24 | Hours to look back |
| `start_date` | string | No | - | Start date (YYYY-MM-DD) |
| `end_date` | string | No | - | End date (YYYY-MM-DD) |
| `camera` | string | No | - | Filter by specific camera |
| `timezone` | string | No | "UTC" | Timezone for date conversion |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/violations/summary?hours=24&camera=employees_01`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violations summary by employee retrieved successfully",
  "data": {
    "summary": [
      {
        "employeeName": "Muhammad Taha",
        "totalViolations": 15,
        "violations": [...],
        "assignmentMethods": {
          "face_recognition": 2,
          "desk_zone": 12,
          "recent_activity": 1,
          "camera_fallback": 0,
          "unknown": 0
        }
      },
      {
        "employeeName": "Bilal Soomro",
        "totalViolations": 8,
        "violations": [...],
        "assignmentMethods": {
          "face_recognition": 5,
          "desk_zone": 3,
          "recent_activity": 0,
          "camera_fallback": 0,
          "unknown": 0
        }
      }
    ],
    "count": 2,
    "filters": {
      "hours": 24,
      "start_date": null,
      "end_date": null,
      "camera": "employees_01"
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

### 3. Get Violations by Employee

**Endpoint:** `GET /api/violations/employee/{employee_name}`

**Description:** Get all violations for a specific employee

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `employee_name` | string | Yes | - | Employee name (URL encoded) |
| `hours` | integer | No | 24 | Hours to look back |
| `start_date` | string | No | - | Start date (YYYY-MM-DD) |
| `end_date` | string | No | - | End date (YYYY-MM-DD) |
| `camera` | string | No | - | Filter by specific camera |
| `limit` | integer | No | 100 | Maximum violations to return |
| `timezone` | string | No | "UTC" | Timezone for date conversion |

**Example Request:**
```javascript
const employeeName = encodeURIComponent("Muhammad Taha");
const response = await fetch(`${API_BASE}/api/violations/employee/${employeeName}?hours=24&limit=50`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violations for employee Muhammad Taha retrieved successfully",
  "data": {
    "violations": [...], // Same structure as camera violations
    "count": 15,
    "employee": "Muhammad Taha",
    "filters": {
      "hours": 24,
      "start_date": null,
      "end_date": null,
      "camera": null,
      "limit": 100
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

### 4. Get Violation Media URLs

**Endpoint:** `GET /api/violations/media/{violation_id}/{camera}/{timestamp}`

**Description:** Get media URLs for a specific violation

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `violation_id` | string | Yes | Violation ID from timeline |
| `camera` | string | Yes | Camera name |
| `timestamp` | number | Yes | Unix timestamp |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/violations/media/2spjde/employees_01/1760964470`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violation media URLs retrieved successfully",
  "data": {
    "snapshot_url": "http://10.0.20.6:8000/clips/employees_01-1760964470-2spjde.jpg",
    "clean_snapshot_url": "http://10.0.20.6:8000/clips/employees_01-1760964470-2spjde-clean.png",
    "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-employees_01-1760964470-2spjde.webp",
    "recording_url": "http://10.0.20.6:8000/recordings/2025-10-20/12/employees_01/",
    "preview_url": "http://10.0.20.6:8000/clips/previews/employees_01/",
    "video_server_url": "http://10.0.20.6:8000",
    "timestamp": 1760964470,
    "camera": "employees_01",
    "violation_id": "2spjde",
    "date_folder": "2025-10-20",
    "hour_folder": "12",
    "metadata": {
      "violation_id": "2spjde",
      "camera": "employees_01",
      "timestamp": 1760964470,
      "timestamp_iso": "2025-10-20T12:47:50.000Z",
      "timestamp_relative": "2 hours ago",
      "generated_at": "2025-10-21T06:48:42.110Z"
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

## Mobile-Optimized APIs

### 5. Get Mobile Violations

**Endpoint:** `GET /api/mobile/violations`

**Description:** Get paginated violations list optimized for mobile apps

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | - | Start date (YYYY-MM-DD) |
| `end_date` | string | No | - | End date (YYYY-MM-DD) |
| `hours` | integer | No | 24 | Hours to look back |
| `limit` | integer | No | 50 | Number of violations to return |
| `offset` | integer | No | 0 | Number of violations to skip |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/mobile/violations?limit=20&offset=0`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Mobile violations data retrieved successfully",
  "data": {
    "violations": [...], // Same structure as camera violations
    "pagination": {
      "total": 150,
      "limit": 20,
      "offset": 0,
      "hasMore": true,
      "nextOffset": 20
    },
    "filters": {
      "start_date": null,
      "end_date": null,
      "hours": 24,
      "limit": 20,
      "offset": 0
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

## Real-Time APIs

### 6. Get Real-Time Activity Summary

**Endpoint:** `GET /api/websocket/activity-summary`

**Description:** Get real-time activity summary including violations

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `hours` | integer | No | 1 | Hours to look back |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/websocket/activity-summary?hours=1`);
const data = await response.json();
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Real-time activity summary retrieved successfully",
  "data": {
    "summary": {
      "total_cameras": 12,
      "active_cameras": 8,
      "total_employees": 64,
      "active_employees": 45,
      "total_violations": 15,
      "recent_violations": 3
    },
    "violations": [
      {
        "camera": "employees_01",
        "count": 8
      },
      {
        "camera": "employees_02",
        "count": 4
      }
    ],
    "employeeActivity": [
      {
        "employee": "Muhammad Taha",
        "camera": "employees_01",
        "activityCount": 5,
        "lastSeen": "2025-10-21T06:45:30.000Z"
      }
    ],
    "cameraStatus": [...],
    "filters": {
      "hours": 1
    }
  },
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

## Report APIs

### 7. Generate Violation Report

**Endpoint:** `GET /api/reports/violations`

**Description:** Generate detailed violation report with media URLs and analysis

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | - | Start date (YYYY-MM-DD) |
| `end_date` | string | No | - | End date (YYYY-MM-DD) |
| `hours` | integer | No | - | Hours to look back |
| `employee_name` | string | No | - | Filter by specific employee |
| `camera` | string | No | - | Filter by specific camera |
| `timezone` | string | No | "UTC" | Timezone for date conversion |
| `format` | string | No | "json" | Report format (json, csv, pdf) |
| `severity` | string | No | - | Filter by severity (high, medium, low) |
| `include_media` | boolean | No | true | Include media URLs in report |

**Example Request:**
```javascript
const response = await fetch(`${API_BASE}/api/reports/violations?start_date=2025-10-20&end_date=2025-10-21&format=json&include_media=true`);
const data = await response.json();
```

## Frontend Integration Examples

### React Hook for Violations

```javascript
import { useState, useEffect } from 'react';

const useViolations = (camera, hours = 24) => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/cameras/${camera}/violations?hours=${hours}`);
        const data = await response.json();
        
        if (data.success) {
          setViolations(data.data.violations);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, [camera, hours]);

  return { violations, loading, error };
};

// Usage
const ViolationsList = ({ camera }) => {
  const { violations, loading, error } = useViolations(camera);

  if (loading) return <div>Loading violations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {violations.map((violation, index) => (
        <div key={index} className="violation-card">
          <h3>{violation.assignedEmployee}</h3>
          <p>{violation.timestampRelative}</p>
          <p>Camera: {violation.camera}</p>
          <p>Confidence: {violation.confidence}</p>
          
          {/* Thumbnail - guaranteed to work */}
          <img src={violation.media.thumbnail_url} alt="Violation thumbnail" />
          
          {/* Video - only show if available */}
          {violation.media.video_url && (
            <video controls preload="metadata">
              <source src={violation.media.video_url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          
          {/* Show status if no video available */}
          {!violation.media.video_url && (
            <div className="no-video">
              <p>No video recording available</p>
              <small>{violation.media.warning}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### Vue.js Composable for Violations

```javascript
import { ref, onMounted } from 'vue';

export function useViolations() {
  const violations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const fetchViolations = async (camera, hours = 24) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await fetch(`${API_BASE}/api/cameras/${camera}/violations?hours=${hours}`);
      const data = await response.json();
      
      if (data.success) {
        violations.value = data.data.violations;
      } else {
        error.value = data.message;
      }
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  return {
    violations,
    loading,
    error,
    fetchViolations
  };
}
```

### Angular Service for Violations

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ViolationsService {
  private apiBase = 'http://10.0.20.8:5002/v1';

  constructor(private http: HttpClient) {}

  getCameraViolations(camera: string, hours: number = 24): Observable<any> {
    const params = new HttpParams()
      .set('hours', hours.toString());
    
    return this.http.get(`${this.apiBase}/api/cameras/${camera}/violations`, { params });
  }

  getViolationsSummary(hours: number = 24, camera?: string): Observable<any> {
    let params = new HttpParams().set('hours', hours.toString());
    if (camera) {
      params = params.set('camera', camera);
    }
    
    return this.http.get(`${this.apiBase}/api/violations/summary`, { params });
  }

  getEmployeeViolations(employeeName: string, hours: number = 24): Observable<any> {
    const params = new HttpParams()
      .set('hours', hours.toString());
    
    return this.http.get(`${this.apiBase}/api/violations/employee/${encodeURIComponent(employeeName)}`, { params });
  }
}
```

## Employee Assignment Logic

The violation system uses intelligent employee assignment with multiple fallback strategies:

### Assignment Priority

1. **Face Recognition** (Highest Priority)
   - Uses `face_employee_name` from timeline data
   - Confidence: High

2. **Desk Zone Assignment**
   - Maps desk zones to specific employees
   - Uses `zones` array from violation data
   - Confidence: High

3. **Recent Activity Analysis**
   - Analyzes recent violations in the same camera
   - Finds most frequently active employee
   - Confidence: Medium

4. **Camera-Based Fallback**
   - Uses camera-specific employee lists
   - Implements time-based rotation
   - Confidence: Low

5. **Unknown** (Fallback)
   - When no assignment method works
   - Confidence: None

### Desk Zone Mapping

```javascript
const DESK_EMPLOYEE_MAPPING = {
  "desk_01": "Safia Imtiaz",
  "desk_02": "Kinza Amin",
  "desk_03": "Aiman Jawaid",
  // ... complete mapping available in violations.service.js
  "desk_64": "Arbaz"
};
```

## Media URL Structure

### ✅ Working URLs (Guaranteed to Work)
- **Thumbnail**: `http://10.0.20.6:8000/clips/review/thumb-camera-timestamp-violationId.webp` ✅
  - Uses actual `thumb_path` from `reviewsegment` table
  - Returns HTTP 200 OK
  - Most reliable for displaying violation images

- **Video**: `http://10.0.20.6:8000/recordings/YYYY-MM-DD/HH/camera/MM.SS.mp4#t=start,end` ✅
  - Uses recording timestamp API with ±2 seconds
  - Returns HTTP 200 OK when recording exists
  - Includes time fragment for precise playback
  - Returns `null` if no recording found for timestamp

### 🚫 No Fake URLs

The API now **only returns URLs that actually work**:

- ❌ **No generated URLs** that might return 404
- ❌ **No fake file paths** that don't exist
- ❌ **No placeholder URLs** for non-existent files
- ✅ **Only working URLs** that return HTTP 200 OK

### 🔧 Media URL Generation

The violations API uses a **working URLs only** approach:

- **Data Source**: `reviewsegment` table (has actual `thumb_path` values)
- **Thumbnail URLs**: Uses actual `thumb_path` from database (guaranteed to work)
- **Video URLs**: Uses recording timestamp API with ±2 seconds (only when recording exists)
- **Response**: Clean, minimal response with only working URLs
- **Error Handling**: Returns `null` for video_url when no recording found (instead of fake URLs)

## Error Handling

### Common Error Responses

```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error information",
  "timestamp": "2025-10-21T06:48:42.110Z"
}
```

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request (missing/invalid parameters)
- **404**: Not Found (camera/employee not found)
- **500**: Internal Server Error

## Performance Considerations

### Caching
- Violation data is cached for 5 minutes
- Media URLs are generated on-demand
- **Thumbnail URLs are guaranteed to work** (use actual database paths)
- Use appropriate cache headers for static media

### Pagination
- Use `limit` and `offset` parameters for large datasets
- Mobile API provides pagination metadata
- Default limit is 100 for desktop, 50 for mobile

### Real-time Updates
- Use WebSocket endpoints for real-time data
- Poll every 30-60 seconds for updates
- Consider implementing WebSocket connections for live updates

## Security Notes

- All APIs require no authentication (internal network)
- Media URLs point to internal video server
- Employee names are sanitized and validated
- No sensitive data exposed in error messages

## Testing Examples

### Test Camera Violations
```bash
curl "http://10.0.20.8:5002/v1/api/cameras/employees_01/violations?hours=24&limit=10"
```

### Test Employee Summary
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary?hours=24"
```

### Test Specific Employee
```bash
curl "http://10.0.20.8:5002/v1/api/violations/employee/Muhammad%20Taha?hours=24"
```

### Test Media URLs
```bash
curl "http://10.0.20.8:5002/v1/api/violations/media/bb5fqc/employees_01/1761029742"
```

### Test Working Thumbnail URLs
```bash
# Test if thumbnail URL actually works (should return 200 OK)
curl -I "http://10.0.20.6:8000/clips/review/thumb-employees_01-1761029742.097229-bb5fqc.webp"
```

### Test Working Video URLs
```bash
# Test if video URL actually works (should return 200 OK)
curl -I "http://10.0.20.6:8000/recordings/2025-10-21/06/employees_01/55.32.mp4"
```

### Test Clean Response Format
```bash
# Test the new clean response format with only working URLs
curl -s "http://10.0.20.8:5002/v1/api/cameras/employees_01/violations?limit=1" | jq '.data.violations[0].media'
```

**Expected Response:**
```json
{
  "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-employees_01-1761029742.097229-bb5fqc.webp",
  "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/06/employees_01/55.32.mp4#t=8.1,11.5",
  "timestamp": 1761029742.097229,
  "camera": "employees_01",
  "violation_id": "bb5fqc",
  "severity": "detection",
  "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
  "warning": "Both thumbnail and video URLs are guaranteed to work.",
  "video_url_error": null,
  "video_server_url": "http://10.0.20.6:8000"
}
```

## ✅ Key Improvements Summary

### What's New in the Violations API

1. **🚫 No More Fake URLs** - API only returns URLs that actually work
2. **✅ Working Thumbnails** - Uses actual `thumb_path` from database (HTTP 200 OK)
3. **✅ Working Videos** - Uses recording timestamp API with ±2 seconds (when recording exists)
4. **✅ Clean Response** - Minimal, focused response with only working URLs
5. **✅ Smart Error Handling** - Returns `null` for video_url when no recording found
6. **✅ Clear Status Messages** - Informative warnings and error messages

### Frontend Integration Benefits

- **No More 404 Errors** - All returned URLs are guaranteed to work
- **Simplified Logic** - No need to handle fake URLs or fallback logic
- **Better UX** - Users see working media or clear "not available" messages
- **Reliable Media** - Thumbnails always work, videos work when recordings exist

### Migration Notes

- **Breaking Change**: Response format is now cleaner with fewer fields
- **Removed Fields**: `clips_url`, `recordings_url`, `video_file_url`, `preview_url`, `snapshot_url`, `clean_snapshot_url`
- **New Fields**: `video_url` (working video with time fragment), `video_url_error` (error details)
- **Updated Fields**: `note` and `warning` now reflect the new working URLs approach

## Related APIs

- **Cameras API**: `/v1/api/cameras` - Camera management and status
- **Analytics API**: `/v1/api/analytics` - Analytics and insights
- **Reports API**: `/v1/api/reports` - Report generation
- **WebSocket API**: `/v1/api/websocket` - Real-time data
- **Health API**: `/v1/health` - System health status

## Support

For issues or questions regarding the Violations API:

1. Check the error messages for specific guidance
2. Verify camera names and employee names are correct
3. Ensure date/time parameters are in the correct format
4. Check the system health endpoint for service status
5. Review the Swagger documentation at `/v1/docs`
