# Daily Violations API - Frontend Integration Guide

## API Endpoint

```
GET http://10.100.6.2:5002/v1/api/violations/summary
```

## Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `start_date` | string | No | 24h ago | Start date (YYYY-MM-DD) |
| `end_date` | string | No | now | End date (YYYY-MM-DD) |
| `timezone` | string | No | Asia/Karachi | Timezone for date conversion |
| `limit` | integer | No | 100 | Max violations to return |
| `hours` | integer | No | 24 | Hours to look back (if no dates) |

## Example Requests

### Get Today's Violations
```
GET /v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21&timezone=Asia/Karachi
```

### Get Last 24 Hours
```
GET /v1/api/violations/summary?hours=24
```

### Get Date Range
```
GET /v1/api/violations/summary?start_date=2025-10-20&end_date=2025-10-21&timezone=Asia/Karachi
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

## Response Fields Explained

### Top Level
- `success` - Boolean indicating if request was successful
- `message` - Human-readable message
- `data.employees` - Array of employees with violations (sorted by violation count, highest first)
- `data.count` - Number of employees with violations
- `data.filters` - Applied filters
- `timestamp` - Server timestamp of response

### Employee Object
- `employeeName` - Name of employee assigned to violations
- `totalViolations` - Total count of violations for this employee
- `violations` - Array of violation details
- `assignmentMethods` - Breakdown of how violations were assigned

### Violation Object
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

### Media Object
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
- **Format**: `http://10.0.20.6:8000/clips/review/thumb-{camera}-{timestamp}-{id}.webp`
- **Status**: HTTP 200 OK (tested and confirmed)

### Video URLs
- **Generated dynamically** - Uses recording timestamp API with ±2 second window
- **May be null** - If recording not found or timeout occurs
- **Includes time fragment** - Format: `#t=start,end` for direct playback at violation time
- **Check `video_url_error`** - Contains error message if generation failed
- **Format**: `http://10.0.20.6:8000/recordings/{date}/{hour}/{camera}/{minute}.mp4#t={start},{end}`

## Error Responses

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

## Frontend Display Recommendations

### Employee List View
- Show employee name and violation count
- Display assignment confidence levels
- Group violations by employee
- Sort by violation count (highest first)

### Violation Details View
- Display thumbnail image (always available)
- Show video player if video URL available
- Display timestamp and camera information
- Show assignment method and confidence
- Display error message if video unavailable

### Media Handling
- **Thumbnails**: Always display (guaranteed to work)
- **Videos**: Check if `video_url` exists before showing player
- **Errors**: Show `video_url_error` message when video unavailable
- **Loading**: Show loading state while fetching data

## Testing

### Test with curl
```bash
# Get today's violations
curl "http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21"

# Get violations with pretty JSON
curl "http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '.'

# Count total violations
curl "http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '[.data.employees[].totalViolations] | add'

# Get employee with most violations
curl "http://10.100.6.2:5002/v1/api/violations/summary?start_date=2025-10-21&end_date=2025-10-21" | jq '.data.employees[0] | {name: .employeeName, count: .totalViolations}'
```

### Test Thumbnail URLs
```bash
# Test if thumbnail URL actually works (should return 200 OK)
curl -I "http://10.0.20.6:8000/clips/review/thumb-meeting_room-1761035213.941356-uhxyfh.webp"
```

## Key Benefits

### Single API Call
- **Before**: Need to call API for each employee separately (50+ calls)
- **After**: One call gets all employees with violations
- **Performance**: Much faster loading, reduced server load

### Complete Data
- **Employee grouping** - Violations automatically grouped by employee
- **Media URLs** - Both thumbnails and video clips included
- **Assignment info** - Know how reliable each assignment is
- **Error handling** - Clear messages when videos unavailable

### Smart Assignment
- **High confidence** - Desk zone and face recognition assignments
- **Low confidence** - Camera fallback assignments
- **Transparency** - Know assignment method and confidence level

## FAQ

### Q: Why are some video URLs null?
**A:** Video URL generation requires querying the recordings table. If a recording isn't found (deleted, not saved, or outside retention period), the video URL will be null. The `video_url_error` field explains the specific reason.

### Q: How are violations assigned to employees?
**A:** The system uses a 4-tier priority: 1) Face recognition (highest confidence), 2) Desk zone mapping, 3) Camera-based fallback (lowest confidence), 4) Unknown. Check `assignmentMethod` and `assignmentConfidence` fields.

### Q: Are thumbnail URLs always available?
**A:** Yes, thumbnail URLs are always available and guaranteed to work (they're stored in the database as `thumb_path`).

### Q: What's the maximum date range I can query?
**A:** There's no hard limit, but larger ranges (>7 days) may be slow. Recommended: Query 1-3 days at a time.

### Q: How often should I poll this API?
**A:** For real-time updates: every 30-60 seconds. For daily reports: once per day. Consider implementing webhooks for better performance.

---

**API Version**: 1.0  
**Last Updated**: October 21, 2025  
**Documentation Maintained By**: Frigate Middleware Team
