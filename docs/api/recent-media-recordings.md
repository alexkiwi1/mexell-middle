# API: Recent Recordings

## Endpoint
`GET /v1/api/recent-media/recordings`

## Description
Retrieve recent video recordings with working video URLs for streaming.

## Phase
Phase 1: Foundation & Media

## Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| camera | string | No | null | Filter by specific camera name |
| limit | integer | No | 50 | Maximum number of recordings to return |

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/api/recent-media/recordings?limit=5&camera=employees_01"
```

## Response Example
```json
{
  "success": true,
  "message": "Recent recordings retrieved successfully",
  "data": {
    "recordings": [
      {
        "id": "1760915899.0-teptn7",
        "camera": "employees_02",
        "path": "/media/frigate/recordings/2025-10-19/23/employees_02/18.19.mp4",
        "start_time": 1760915899,
        "end_time": 1760915906.663,
        "duration": 7.663,
        "objects": 0,
        "motion": 16,
        "segment_size": 2.39,
        "video_url": "http://10.0.20.6:8000/recordings/2025-10-19/23/employees_02/18.19.mp4",
        "start_time_iso": "2025-10-19T23:18:19.000Z",
        "end_time_iso": "2025-10-19T23:18:26.663Z",
        "duration_readable": "8s"
      }
    ],
    "count": 1,
    "filters": {
      "camera": "employees_01",
      "limit": 5,
      "hours": 24
    }
  },
  "timestamp": "2025-10-19T23:18:35.751Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
```sql
SELECT 
  id,
  camera,
  path,
  start_time,
  end_time,
  duration,
  objects,
  motion,
  segment_size
FROM recordings
WHERE camera = $1 AND start_time >= $2
ORDER BY start_time DESC
LIMIT $3;
```

### Local MongoDB (WRITE)
None - Direct database query

## Implementation Notes
- Queries recordings from last 24 hours by default
- Converts Unix timestamps to ISO format for frontend
- Generates working video URLs for streaming
- Includes metadata like motion detection and object counts
- Paths are converted to full URLs for external access

## Related Endpoints
- `/v1/api/cameras/list` - List all cameras
- `/v1/api/recent-media/clips` - Recent clips/thumbnails
- `/media/recordings/*` - Direct video streaming

## Testing
```bash
# Test recent recordings
curl -v "http://localhost:5002/v1/api/recent-media/recordings?limit=3"

# Test with camera filter
curl -v "http://localhost:5002/v1/api/recent-media/recordings?camera=employees_01&limit=5"

# Expected: 200 OK with array of recording objects
# Video URLs should be accessible
```

## Error Handling
- **400 Bad Request**: Invalid limit parameter
- **500 Internal Server Error**: Database connection issues
- **503 Service Unavailable**: Frigate database unreachable
- Returns empty array if no recordings found
