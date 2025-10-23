# Daily Violations API - Complete Guide

## Overview

The Daily Violations API provides a comprehensive view of all employee violations for a specified date range in a **single API call**. This eliminates the need for multiple per-employee requests and significantly improves frontend performance.

## Endpoint

```
GET /v1/api/violations/summary
```

**Server:** `http://10.0.20.8:5002`

## Key Features

✅ **Single API Call** - Get all employees with violations in one request  
✅ **Grouped by Employee** - Violations automatically grouped by assigned employee name  
✅ **Complete Media URLs** - Includes both thumbnail and video URLs for each violation  
✅ **Smart Employee Assignment** - Uses desk zones, face recognition, and camera fallbacks  
✅ **Timezone Support** - Proper timezone handling (default: Asia/Karachi)  
✅ **Date Range Filtering** - Filter by specific dates or hours lookback  
✅ **Error Handling** - Graceful handling of missing recordings with clear error messages

## Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | 24h ago | Start date in YYYY-MM-DD format |
| `end_date` | string | No | now | End date in YYYY-MM-DD format |
| `timezone` | string | No | Asia/Karachi | Timezone for date conversion |
| `limit` | integer | No | 100 | Max violations to return (total, not per employee) |
| `hours` | integer | No | 24 | Hours to look back (if no dates specified) |

## Example Requests

### Get All Violations for Specific Date
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21&timezone=Asia/Karachi"
```

### Get Violations for Date Range
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-20&end_date=2025-10-21&timezone=Asia/Karachi"
```

### Get Last 24 Hours (Default)
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary"
```

### Get Last 48 Hours
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary?hours=48"
```

### Limit Total Violations Returned
```bash
curl "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21&limit=50"
```

## Response Structure

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Violations summary retrieved successfully",
  "data": {
    "employees": [
      {
        "employeeName": "Muhammad Roshan",
        "totalViolations": 5,
        "violations": [
          {
            "timestamp": "2025-10-21T07:00:42.097Z",
            "timestampRelative": "10/21/2025, 7:00:42 AM",
            "camera": "admin_office",
            "assignedEmployee": "Muhammad Roshan",
            "assignmentMethod": "desk_zone",
            "assignmentConfidence": "high",
            "assignmentReason": null,
            "faceEmployeeName": null,
            "deskEmployeeName": "Muhammad Roshan",
            "zones": ["employee_area", "desk_62"],
            "objects": ["cell phone", "person"],
            "confidence": null,
            "type": "cell_phone",
            "media": {
              "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-admin_office-1761030042.097656-dduzbp.webp",
              "video_url": "http://10.0.20.6:8000/recordings/2025-10-21/07/admin_office/00.26.mp4#t=14.1,18.0",
              "timestamp": 1761030042.097656,
              "camera": "admin_office",
              "violation_id": "1761030042.097656-dduzbp",
              "severity": "alert",
              "note": "Only working URLs are included. Thumbnail URL uses actual thumb_path. Video URL uses recording timestamp API with ±2 seconds.",
              "warning": "Both thumbnail and video URLs are guaranteed to work.",
              "video_url_error": null,
              "video_server_url": "http://10.0.20.6:8000"
            }
          }
        ],
        "assignmentMethods": {
          "face_recognition": 0,
          "desk_zone": 5,
          "unknown": 0,
          "camera_fallback": null
        }
      },
      {
        "employeeName": "Arifa Dhari",
        "totalViolations": 4,
        "violations": [...]
      }
    ],
    "count": 10,
    "filters": {
      "hours": 24,
      "start_date": "2025-10-21",
      "end_date": "2025-10-21"
    }
  },
  "timestamp": "2025-10-21T09:07:53.836Z"
}
```

### Response Fields Explained

#### Top Level
- `success` - Boolean indicating if request was successful
- `message` - Human-readable message
- `data.employees` - Array of employees with violations (sorted by violation count, highest first)
- `data.count` - Number of employees with violations
- `data.filters` - Applied filters
- `timestamp` - Server timestamp of response

#### Employee Object
- `employeeName` - Name of employee assigned to violations
- `totalViolations` - Total count of violations for this employee
- `violations` - Array of violation details
- `assignmentMethods` - Breakdown of how violations were assigned (face_recognition, desk_zone, camera_fallback, unknown)

#### Violation Object
- `timestamp` - ISO 8601 timestamp in UTC
- `timestampRelative` - Human-readable timestamp
- `camera` - Camera name where violation occurred
- `assignedEmployee` - Employee assigned to this violation
- `assignmentMethod` - How employee was assigned: `desk_zone` (high confidence), `face_recognition` (high), `camera_fallback` (low), `unknown` (none)
- `assignmentConfidence` - Confidence level: `high`, `medium`, `low`, `none`
- `assignmentReason` - Detailed reason for assignment (for fallback methods)
- `faceEmployeeName` - Employee name from face recognition (if detected)
- `deskEmployeeName` - Employee name from desk zone mapping (if detected)
- `zones` - Array of zones where violation occurred
- `objects` - Array of detected objects (e.g., "cell phone", "person")
- `confidence` - Detection confidence score
- `type` - Violation type (e.g., "cell_phone")
- `media` - Media URLs and metadata (see below)

#### Media Object
- `thumbnail_url` - Direct URL to thumbnail image (always available)
- `video_url` - URL to video clip with time fragment (may be null if recording not found)
- `timestamp` - Unix timestamp of violation
- `camera` - Camera name
- `violation_id` - Unique violation identifier
- `severity` - Violation severity: `alert` (high severity) or `detection` (lower severity)
- `note` - Information about URL generation
- `warning` - Warning message if video URL unavailable
- `video_url_error` - Error message if video URL generation failed (null if successful)
- `video_server_url` - Base URL of video server

## Employee Assignment Logic

The API uses a sophisticated multi-strategy approach to assign violations to employees:

### Priority 1: Face Recognition (High Confidence)
- Uses Frigate's face recognition data
- Matches `data->sub_label` with employee name
- Most accurate method

### Priority 2: Desk Zone Mapping (High Confidence)
- Maps desk zones to specific employees
- Example: `desk_62` → "Muhammad Roshan"
- Uses predefined desk-to-employee mapping
- 66 desks mapped across 6+ cameras

### Priority 3: Camera Fallback (Low Confidence)
- When no desk zone detected
- Uses intelligent time-based rotation
- Considers recent activity patterns
- Distributes violations across camera-specific employees

### Priority 4: Unknown (No Confidence)
- When no assignment possible
- Assigned to "Unknown"
- Typically meeting rooms or common areas

## Media URLs

### Thumbnail URLs
- **Always available** - Generated from actual `thumb_path` in database
- **Guaranteed to work** - Direct path to stored thumbnail
- Format: `http://10.0.20.6:8000/clips/review/thumb-{camera}-{timestamp}-{id}.webp`

### Video URLs
- **Generated dynamically** - Uses recording timestamp API with ±2 second window
- **May be null** - If recording not found or timeout occurs
- **Includes time fragment** - Format: `#t=start,end` for direct playback at violation time
- **Check `video_url_error`** - Contains error message if generation failed
- Format: `http://10.0.20.6:8000/recordings/{date}/{hour}/{camera}/{minute}.mp4#t={start},{end}`

### Handling Missing Video URLs

```javascript
if (violation.media.video_url) {
  // Video available - show video player
  playVideo(violation.media.video_url);
} else {
  // Video unavailable - show thumbnail and error message
  showThumbnail(violation.media.thumbnail_url);
  showError(violation.media.video_url_error || "Video not available");
}
```

## Performance Considerations

### Response Time
- **Fast for thumbnails** - Instant (from database)
- **Slower for video URLs** - Each video URL requires a database query to find recording
- **Timeout handling** - 2-second timeout per video URL generation
- **Expect**: 5-15 seconds for 100 violations with video URLs

### Optimization Tips
1. **Use date ranges** - Narrow down to specific dates for faster response
2. **Limit violations** - Use `limit` parameter to reduce processing
3. **Check video URLs on demand** - Show thumbnails first, load videos when user clicks
4. **Cache results** - Cache response for same date range

## Integration Examples

### JavaScript/React

```javascript
const getDailyViolations = async (date) => {
  const response = await fetch(
    `http://10.0.20.8:5002/v1/api/violations/summary?` +
    `start_date=${date}&end_date=${date}&timezone=Asia/Karachi`
  );
  
  const result = await response.json();
  
  if (result.success) {
    // Group by employee is already done
    const employees = result.data.employees;
    
    employees.forEach(emp => {
      console.log(`${emp.employeeName}: ${emp.totalViolations} violations`);
      
      emp.violations.forEach(v => {
        // Always show thumbnail
        displayThumbnail(v.media.thumbnail_url);
        
        // Show video if available
        if (v.media.video_url) {
          enableVideoPlayback(v.media.video_url);
        } else {
          showVideoError(v.media.video_url_error);
        }
      });
    });
  }
};

// Usage
getDailyViolations('2025-10-21');
```

### Python

```python
import requests
from datetime import date

def get_daily_violations(target_date):
    url = "http://10.0.20.8:5002/v1/api/violations/summary"
    params = {
        "start_date": target_date,
        "end_date": target_date,
        "timezone": "Asia/Karachi"
    }
    
    response = requests.get(url, params=params)
    result = response.json()
    
    if result["success"]:
        employees = result["data"]["employees"]
        
        for emp in employees:
            print(f"{emp['employeeName']}: {emp['totalViolations']} violations")
            
            for violation in emp["violations"]:
                # Thumbnail always available
                thumbnail = violation["media"]["thumbnail_url"]
                
                # Video may be null
                video = violation["media"]["video_url"]
                if video:
                    print(f"  Video: {video}")
                else:
                    error = violation["media"]["video_url_error"]
                    print(f"  Video unavailable: {error}")
    
    return result

# Usage
violations = get_daily_violations("2025-10-21")
```

## Frontend Display Recommendations

### Employee List View
```javascript
<div className="violations-summary">
  <h2>Daily Violations - {date}</h2>
  <p>Total Employees: {data.count}</p>
  
  {data.employees.map(emp => (
    <div key={emp.employeeName} className="employee-card">
      <h3>{emp.employeeName}</h3>
      <span className="badge">{emp.totalViolations} violations</span>
      
      <div className="assignment-breakdown">
        <span>High Confidence: {emp.assignmentMethods.desk_zone + emp.assignmentMethods.face_recognition}</span>
        <span>Low Confidence: {emp.assignmentMethods.camera_fallback || 0}</span>
      </div>
      
      <button onClick={() => showViolations(emp.violations)}>
        View Details
      </button>
    </div>
  ))}
</div>
```

### Violation Details View
```javascript
<div className="violation-details">
  {violations.map(v => (
    <div key={v.media.violation_id} className="violation-item">
      <img src={v.media.thumbnail_url} alt="Violation" />
      
      <div className="info">
        <p>Time: {v.timestampRelative}</p>
        <p>Camera: {v.camera}</p>
        <p>Confidence: {v.assignmentConfidence}</p>
        
        {v.media.video_url ? (
          <video src={v.media.video_url} controls />
        ) : (
          <div className="video-error">
            Video unavailable: {v.media.video_url_error}
          </div>
        )}
      </div>
    </div>
  ))}
</div>
```

## Comparison with Individual Employee API

### OLD Approach (Multiple Calls)
```javascript
// Need to call API for EACH employee separately
const employees = ['John', 'Jane', 'Bob', 'Alice']; // 50+ employees
for (const emp of employees) {
  await fetch(`/api/violations/employee/${emp}?date=2025-10-21`);
}
// Result: 50+ API calls, very slow
```

### NEW Approach (Single Call)
```javascript
// One call gets ALL employees
const result = await fetch('/api/violations/summary?start_date=2025-10-21');
// Result: 1 API call, much faster
```

## Error Handling

### No Violations Found
```json
{
  "success": true,
  "message": "Violations summary retrieved successfully",
  "data": {
    "employees": [],
    "count": 0,
    "filters": {...}
  }
}
```

### Invalid Date Format
```json
{
  "success": false,
  "message": "Invalid date format",
  "error": "Date must be in YYYY-MM-DD format"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve violations",
  "error": "Internal server error"
}
```

## Desk-to-Employee Mapping

The API uses a comprehensive desk mapping (66 desks across 6+ cameras):

### Employees Camera 01 (Desks 01-12)
- desk_01: Safia Imtiaz
- desk_02: Kinza Amin
- desk_05: Summaiya Khan
- desk_11: Muhammad Taha
- desk_12: Muhammad Awais
- etc.

### Employees Camera 02 (Desks 13-24)
- desk_13: Nabeel Bhatti
- desk_16: Saad Bin Salman
- desk_22: Syed Hussain Ali Kazi
- etc.

### Admin Office Camera (Desks 61-66)
- desk_61: Hira Memon
- desk_62: Muhammad Roshan
- desk_63: Syed Safwan Ali Hashmi
- desk_64: Arbaz
- etc.

[Full mapping available in source code: `src/services/violations.service.js`]

## Best Practices

### 1. Date Range Optimization
✅ **DO**: Use specific date ranges
```javascript
?start_date=2025-10-21&end_date=2025-10-21
```

❌ **DON'T**: Request very large date ranges
```javascript
?start_date=2025-01-01&end_date=2025-12-31  // Too slow
```

### 2. Video URL Handling
✅ **DO**: Always check if video_url exists before using
```javascript
if (violation.media.video_url) {
  playVideo(violation.media.video_url);
}
```

❌ **DON'T**: Assume video_url is always available
```javascript
playVideo(violation.media.video_url);  // May be null!
```

### 3. Assignment Confidence
✅ **DO**: Consider confidence levels
```javascript
if (violation.assignmentConfidence === 'high') {
  showHighConfidenceBadge();
} else if (violation.assignmentConfidence === 'low') {
  showLowConfidenceWarning();
}
```

### 4. Error Display
✅ **DO**: Show clear error messages
```javascript
if (violation.media.video_url_error) {
  showError(`Video unavailable: ${violation.media.video_url_error}`);
}
```

## Testing

### Test with curl
```bash
# Get today's violations
curl -s "http://10.0.20.8:5002/v1/api/violations/summary?start_date=$(date +%Y-%m-%d)&end_date=$(date +%Y-%m-%d)" | jq '.data.employees | length'

# Get violations with pretty JSON
curl -s "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '.'

# Count total violations
curl -s "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '[.data.employees[].totalViolations] | add'

# Get employee with most violations
curl -s "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '.data.employees[0] | {name: .employeeName, count: .totalViolations}'
```

### Test Response Time
```bash
time curl -s "http://10.0.20.8:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" > /dev/null
```

## FAQ

### Q: Why are some video URLs null?
**A:** Video URL generation requires querying the recordings table. If a recording isn't found (deleted, not saved, or outside retention period), the video URL will be null. The `video_url_error` field explains the specific reason.

### Q: How are violations assigned to employees?
**A:** The system uses a 4-tier priority: 1) Face recognition (highest confidence), 2) Desk zone mapping, 3) Camera-based fallback (lowest confidence), 4) Unknown. Check `assignmentMethod` and `assignmentConfidence` fields.

### Q: Can I get violations for a specific employee?
**A:** Yes, use the `/api/violations/employee/{employee_name}` endpoint, or filter the summary response on the frontend.

### Q: What's the maximum date range I can query?
**A:** There's no hard limit, but larger ranges (>7 days) may be slow. Recommended: Query 1-3 days at a time.

### Q: Are thumbnail URLs always available?
**A:** Yes, thumbnail URLs are always available and guaranteed to work (they're stored in the database as `thumb_path`).

### Q: What timezone is used?
**A:** Default is Asia/Karachi. You can override with the `timezone` parameter.

### Q: How often should I poll this API?
**A:** For real-time updates: every 30-60 seconds. For daily reports: once per day. Consider implementing webhooks for better performance.

---

**API Version**: 1.0  
**Last Updated**: October 21, 2025  
**Documentation Maintained By**: Frigate Middleware Team


