# API: Recent Clips

## Endpoint
`GET /v1/api/recent-media/clips`

## Description
Retrieve recent clips from the reviewsegment table with thumbnail URLs for event review.

## Phase
Phase 1: Foundation & Media

## Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| camera | string | No | null | Filter by specific camera name |
| limit | integer | No | 50 | Maximum number of clips to return |

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/api/recent-media/clips?limit=5&camera=employees_04"
```

## Response Example
```json
{
  "success": true,
  "message": "Recent clips retrieved successfully",
  "data": {
    "clips": [
      {
        "id": "1760915764.052192-k1dp3s",
        "camera": "employees_04",
        "start_time": 1760915764.052192,
        "end_time": null,
        "severity": "detection",
        "thumb_path": "/media/frigate/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp",
        "data": {
          "audio": [],
          "zones": [],
          "objects": ["person"],
          "detections": ["1760915763.877192-g6uloe"],
          "sub_labels": []
        },
        "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp",
        "start_time_iso": "2025-10-19T23:16:04.052Z",
        "end_time_iso": null,
        "duration": null,
        "duration_readable": null
      }
    ],
    "count": 1,
    "filters": {
      "camera": "employees_04",
      "limit": 5
    }
  },
  "timestamp": "2025-10-19T23:18:38.363Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
```sql
SELECT 
  id,
  camera,
  start_time,
  end_time,
  severity,
  thumb_path,
  data
FROM reviewsegment
WHERE camera = $1
ORDER BY start_time DESC
LIMIT $2;
```

### Local MongoDB (WRITE)
None - Direct database query

## Implementation Notes
- Queries reviewsegment table for event clips
- Includes detection metadata in JSONB data field
- Converts thumbnail paths to working URLs
- Shows zones, objects, and detection details
- Severity levels: detection, alert, significant_motion

## Related Endpoints
- `/v1/api/cameras/list` - List all cameras
- `/v1/api/recent-media/recordings` - Recent video recordings
- `/v1/api/recent-media/test-media` - Test media URL accessibility

## Testing
```bash
# Test recent clips
curl -v "http://localhost:5002/v1/api/recent-media/clips?limit=3"

# Test with camera filter
curl -v "http://localhost:5002/v1/api/recent-media/clips?camera=employees_02&limit=5"

# Expected: 200 OK with array of clip objects
# Thumbnail URLs should be accessible
```

## Error Handling
- **400 Bad Request**: Invalid limit parameter
- **500 Internal Server Error**: Database connection issues
- **503 Service Unavailable**: Frigate database unreachable
- Returns empty array if no clips found
