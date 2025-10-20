# API: Test Media URLs

## Endpoint
`GET /v1/api/recent-media/test-media`

## Description
Test media URL accessibility for debugging and verification purposes.

## Phase
Phase 1: Foundation & Media

## Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| clip_id | string | No | null | Test specific clip ID |
| recording_id | string | No | null | Test specific recording ID |

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/api/recent-media/test-media"

# Test specific clip
curl "http://localhost:5002/v1/api/recent-media/test-media?clip_id=1760915764.052192-k1dp3s"

# Test specific recording
curl "http://localhost:5002/v1/api/recent-media/test-media?recording_id=1760915899.0-teptn7"
```

## Response Example
```json
{
  "success": true,
  "message": "Media URL test completed",
  "data": {
    "video_server_url": "http://10.0.20.6:8000",
    "tests": [
      {
        "type": "recent_clip",
        "id": "1760915764.052192-k1dp3s",
        "camera": "employees_04",
        "thumbnail_url": "http://10.0.20.6:8000/clips/review/thumb-employees_04-1760915764.052192-k1dp3s.webp",
        "status": "found"
      },
      {
        "type": "recent_recording",
        "id": "1760915899.0-teptn7",
        "camera": "employees_02",
        "video_url": "http://10.0.20.6:8000/recordings/2025-10-19/23/employees_02/18.19.mp4",
        "status": "found"
      }
    ]
  },
  "timestamp": "2025-10-19T23:18:41.157Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
```sql
-- Test specific clip
SELECT id, camera, thumb_path FROM reviewsegment WHERE id = $1;

-- Test specific recording
SELECT id, camera, path FROM recordings WHERE id = $1;

-- Test recent data
SELECT id, camera, thumb_path FROM reviewsegment ORDER BY start_time DESC LIMIT 1;
SELECT id, camera, path FROM recordings ORDER BY start_time DESC LIMIT 1;
```

### Local MongoDB (WRITE)
None - Testing only

## Implementation Notes
- Tests media URL generation and database lookups
- Can test specific IDs or recent data automatically
- Verifies both clips and recordings accessibility
- Useful for debugging media serving issues
- Returns detailed test results for each media type

## Related Endpoints
- `/v1/api/recent-media/recordings` - Recent recordings
- `/v1/api/recent-media/clips` - Recent clips
- `/media/*` - Direct media streaming proxy

## Testing
```bash
# Test with no parameters (uses recent data)
curl -v "http://localhost:5002/v1/api/recent-media/test-media"

# Test specific clip ID
curl -v "http://localhost:5002/v1/api/recent-media/test-media?clip_id=1760915764.052192-k1dp3s"

# Test specific recording ID
curl -v "http://localhost:5002/v1/api/recent-media/test-media?recording_id=1760915899.0-teptn7"

# Expected: 200 OK with test results
# Status should be "found" for valid IDs
```

## Error Handling
- **400 Bad Request**: Invalid ID format
- **500 Internal Server Error**: Database connection issues
- **503 Service Unavailable**: Frigate database unreachable
- Returns "not_found" status for invalid IDs
- Returns "error" status for database errors
