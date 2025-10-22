# Violations API Structure Documentation

## Overview

The Violations API provides comprehensive access to cell phone violation data with employee assignment, confidence scores, and media URLs. All endpoints support the simplified desk-zone assignment logic and include Frigate confidence scores.

## Base URL

```
http://10.100.6.2:5002/v1
```

## Authentication

No authentication required (internal network only).

## API Endpoints

### 1. Violations Summary by Employee

**Endpoint:** `GET /api/violations/summary`

**Description:** Get all violations grouped by employee for a specified date range.

**Parameters:**
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format  
- `hours` (number, optional): Hours to look back from now
- `limit` (number, optional): Maximum violations per employee (default: 50)

**Example Request:**
```bash
curl "http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21&limit=10"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violations summary by employee retrieved successfully",
  "data": {
    "summary": [
      {
        "employeeName": "Muhammad Roshan",
        "totalViolations": 2,
        "violations": [
          {
            "timestamp": "2025-10-21T09:23:30.925Z",
            "timestampRelative": "10/21/2025, 9:23:30 AM",
            "camera": "admin_office",
            "assignedEmployee": "Muhammad Roshan",
            "assignmentMethod": "desk_zone",
            "assignmentConfidence": "high",
            "assignmentReason": "Phone detected at desk_62",
            "faceEmployeeName": null,
            "deskEmployeeName": "Muhammad Roshan",
            "zones": ["employee_area", "desk_62"],
            "objects": ["person-verified", "person"],
            "confidence": 0.7,
            "frigateScore": 0.7,
            "confidenceNote": "Estimated based on severity (alert=0.9, detection=0.7)",
            "severity": "detection",
            "detectorType": null,
            "modelHash": null,
            "type": "cell_phone",
            "media": {
              "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-admin_office-1761038610.925424-s0u2d8.webp",
              "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/09/admin_office/23.30.mp4#t=0.0,2.9",
              "timestamp": 1761038610.925424,
              "camera": "admin_office",
              "violation_id": "1761038610.925424-s0u2d8",
              "severity": "detection",
              "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
              "warning": "Both thumbnail and video URLs are guaranteed to work.",
              "video_url_error": null,
              "video_server_url": "http://10.0.20.6:8000"
            }
          }
        ],
        "assignmentMethods": {
          "face_recognition": 0,
          "desk_zone": 2,
          "unknown": 0
        }
      }
    ],
    "count": 1,
    "filters": {
      "start_date": "2025-10-21",
      "end_date": "2025-10-21",
      "limit": 10
    }
  },
  "timestamp": "2025-10-21T09:39:41.317Z"
}
```

### 2. Violations by Employee Name

**Endpoint:** `GET /api/violations/employee/{name}`

**Description:** Get all violations for a specific employee.

**Parameters:**
- `name` (string, required): Employee name (URL path parameter)
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format
- `hours` (number, optional): Hours to look back from now
- `limit` (number, optional): Maximum violations to return (default: 50)

**Example Request:**
```bash
curl "http://10.100.6.2:5002/v1/api/violations/employee/Muhammad%20Roshan?hours=24&limit=5"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violations for employee retrieved successfully",
  "data": {
    "employeeName": "Muhammad Roshan",
    "totalViolations": 2,
    "violations": [
      {
        "timestamp": "2025-10-21T09:23:30.925Z",
        "timestampRelative": "10/21/2025, 9:23:30 AM",
        "camera": "admin_office",
        "assignedEmployee": "Muhammad Roshan",
        "assignmentMethod": "desk_zone",
        "assignmentConfidence": "high",
        "assignmentReason": "Phone detected at desk_62",
        "faceEmployeeName": null,
        "deskEmployeeName": "Muhammad Roshan",
        "zones": ["employee_area", "desk_62"],
        "objects": ["person-verified", "person"],
        "confidence": 0.7,
        "frigateScore": 0.7,
        "confidenceNote": "Estimated based on severity (alert=0.9, detection=0.7)",
        "severity": "detection",
        "detectorType": null,
        "modelHash": null,
        "type": "cell_phone",
        "media": {
          "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-admin_office-1761038610.925424-s0u2d8.webp",
          "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/09/admin_office/23.30.mp4#t=0.0,2.9",
          "timestamp": 1761038610.925424,
          "camera": "admin_office",
          "violation_id": "1761038610.925424-s0u2d8",
          "severity": "detection",
          "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
          "warning": "Both thumbnail and video URLs are guaranteed to work.",
          "video_url_error": null,
          "video_server_url": "http://10.0.20.6:8000"
        }
      }
    ],
    "filters": {
      "employeeName": "Muhammad Roshan",
      "hours": 24,
      "limit": 5
    }
  },
  "timestamp": "2025-10-21T09:39:41.317Z"
}
```

### 3. Violations by Camera

**Endpoint:** `GET /api/cameras/{camera}/violations`

**Description:** Get all violations for a specific camera.

**Parameters:**
- `camera` (string, required): Camera name (URL path parameter)
- `start_date` (string, optional): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date in YYYY-MM-DD format
- `hours` (number, optional): Hours to look back from now
- `limit` (number, optional): Maximum violations to return (default: 50)

**Example Request:**
```bash
curl "http://10.100.6.2:5002/v1/api/cameras/admin_office/violations?hours=24&limit=5"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Violations for camera retrieved successfully",
  "data": {
    "camera": "admin_office",
    "count": 2,
    "violations": [
      {
        "timestamp": "2025-10-21T09:23:30.925Z",
        "timestampRelative": "10/21/2025, 9:23:30 AM",
        "camera": "admin_office",
        "assignedEmployee": "Muhammad Roshan",
        "assignmentMethod": "desk_zone",
        "assignmentConfidence": "high",
        "assignmentReason": "Phone detected at desk_62",
        "faceEmployeeName": null,
        "deskEmployeeName": "Muhammad Roshan",
        "zones": ["employee_area", "desk_62"],
        "objects": ["person-verified", "person"],
        "confidence": 0.7,
        "frigateScore": 0.7,
        "confidenceNote": "Estimated based on severity (alert=0.9, detection=0.7)",
        "severity": "detection",
        "detectorType": null,
        "modelHash": null,
        "type": "cell_phone",
        "media": {
          "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-admin_office-1761038610.925424-s0u2d8.webp",
          "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/09/admin_office/23.30.mp4#t=0.0,2.9",
          "timestamp": 1761038610.925424,
          "camera": "admin_office",
          "violation_id": "1761038610.925424-s0u2d8",
          "severity": "detection",
          "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
          "warning": "Both thumbnail and video URLs are guaranteed to work.",
          "video_url_error": null,
          "video_server_url": "http://10.0.20.6:8000"
        }
      }
    ],
    "filters": {
      "camera": "admin_office",
      "hours": 24,
      "limit": 5
    }
  },
  "timestamp": "2025-10-21T09:39:41.317Z"
}
```

### 4. Violation Media URLs

**Endpoint:** `GET /api/violations/media/{id}/{camera}/{timestamp}`

**Description:** Get media URLs for a specific violation.

**Parameters:**
- `id` (string, required): Violation ID
- `camera` (string, required): Camera name
- `timestamp` (number, required): Unix timestamp

**Example Request:**
```bash
curl "http://10.100.6.2:5002/v1/api/violations/media/1761038610.925424-s0u2d8/admin_office/1761038610.925424"
```

**Response Structure:**
```json
{
  "success": true,
  "message": "Media URLs retrieved successfully",
  "data": {
    "violation_id": "1761038610.925424-s0u2d8",
    "camera": "admin_office",
    "timestamp": 1761038610.925424,
    "media": {
      "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-admin_office-1761038610.925424-s0u2d8.webp",
      "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/09/admin_office/23.30.mp4#t=0.0,2.9",
      "timestamp": 1761038610.925424,
      "camera": "admin_office",
      "violation_id": "1761038610.925424-s0u2d8",
      "severity": "detection",
      "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
      "warning": "Both thumbnail and video URLs are guaranteed to work.",
      "video_url_error": null,
      "video_server_url": "http://10.0.20.6:8000"
    }
  },
  "timestamp": "2025-10-21T09:39:41.317Z"
}
```

## Data Fields Reference

### Violation Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO timestamp of violation |
| `timestampRelative` | string | Human-readable timestamp |
| `camera` | string | Camera name where violation occurred |
| `assignedEmployee` | string | Employee assigned to violation |
| `assignmentMethod` | string | Method used for assignment (`desk_zone`, `no_desk`) |
| `assignmentConfidence` | string | Confidence level (`high`, `none`) |
| `assignmentReason` | string | Explanation of assignment |
| `faceEmployeeName` | string\|null | Face recognition result (if available) |
| `deskEmployeeName` | string\|null | Desk zone assignment result |
| `zones` | array | Frigate zones where violation occurred |
| `objects` | array | Detected objects |
| `confidence` | number | Frigate confidence score (0.0-1.0) |
| `frigateScore` | number | Alias for confidence score |
| `confidenceNote` | string | Explanation of confidence score source |
| `severity` | string | Violation severity (`alert`, `detection`) |
| `detectorType` | string\|null | Frigate detector type |
| `modelHash` | string\|null | Frigate model hash |
| `type` | string | Always `cell_phone` |

### Media Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `thumbnail_url` | string | Thumbnail image URL (guaranteed to work) |
| `video_url` | string\|null | Video clip URL with time fragment |
| `timestamp` | number | Unix timestamp of violation |
| `camera` | string | Camera name |
| `violation_id` | string | Unique violation identifier |
| `severity` | string | Violation severity |
| `note` | string | Information about URL generation |
| `warning` | string | Warning about URL availability |
| `video_url_error` | string\|null | Error message if video URL unavailable |
| `video_server_url` | string | Base URL for media server |

### Assignment Methods

| Method | Description | Confidence |
|--------|-------------|------------|
| `desk_zone` | Phone detected on specific desk | `high` |
| `no_desk` | No desk zone detected | `none` |

### Confidence Score Mapping

| Severity | Confidence Score | Description |
|----------|------------------|-------------|
| `alert` | 0.9 | High priority violations |
| `detection` | 0.7 | Medium priority violations |
| Other | 0.5 | Low priority violations |

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid parameters",
  "error": "Parameter validation failed"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "No violations found",
  "error": "No data available for specified criteria"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

## Usage Examples

### Frontend Integration (React)

```javascript
// Fetch violations for today
const fetchViolations = async () => {
  const response = await fetch('http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21');
  const data = await response.json();
  
  if (data.success) {
    return data.data.summary;
  }
  throw new Error(data.message);
};

// Display violation with confidence
const ViolationCard = ({ violation }) => (
  <div className="violation-card">
    <h3>{violation.assignedEmployee}</h3>
    <p>Camera: {violation.camera}</p>
    <p>Confidence: {violation.confidence} ({violation.confidenceNote})</p>
    <p>Method: {violation.assignmentMethod}</p>
    <p>Reason: {violation.assignmentReason}</p>
    
    {violation.media.thumbnail_url && (
      <img src={violation.media.thumbnail_url} alt="Violation thumbnail" />
    )}
    
    {violation.media.video_url && (
      <video controls>
        <source src={violation.media.video_url} type="video/mp4" />
      </video>
    )}
  </div>
);
```

### Python Integration

```python
import requests
import json

def get_violations_summary(start_date, end_date, limit=50):
    url = "http://10.100.6.2:5002/v1/api/violations/summary"
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "limit": limit
    }
    
    response = requests.get(url, params=params)
    data = response.json()
    
    if data["success"]:
        return data["data"]["summary"]
    else:
        raise Exception(data["message"])

# Usage
violations = get_violations_summary("2025-10-21", "2025-10-21")
for employee in violations:
    print(f"Employee: {employee['employeeName']}")
    print(f"Total Violations: {employee['totalViolations']}")
    for violation in employee['violations']:
        print(f"  - Camera: {violation['camera']}")
        print(f"  - Confidence: {violation['confidence']}")
        print(f"  - Assignment: {violation['assignmentMethod']}")
```

## Performance Notes

- **Response Time**: Typically 1-3 seconds for summary endpoints
- **Rate Limiting**: No rate limits (internal network)
- **Caching**: No caching implemented
- **Pagination**: Use `limit` parameter to control response size
- **Media URLs**: Thumbnail URLs are fast, video URLs may take 2-5 seconds to generate

## Recent Updates

### Version 2.0.0 (Current)
- ✅ **Simplified Assignment Logic**: Desk-zone only assignment
- ✅ **Confidence Scores**: Frigate confidence scores included
- ✅ **Enhanced Media URLs**: Working thumbnail and video URLs
- ✅ **Transparent Scoring**: Clear confidence score explanations
- ✅ **Backward Compatible**: All existing endpoints unchanged

### Version 1.0.0 (Deprecated)
- ❌ Complex 4-tier assignment logic
- ❌ No confidence scores
- ❌ Unreliable media URLs
- ❌ Random camera fallback assignments

## Support

For technical support or questions about the API, contact the development team.

---

**Last Updated**: October 21, 2025  
**API Version**: 2.0.0  
**Base URL**: http://10.100.6.2:5002/v1

