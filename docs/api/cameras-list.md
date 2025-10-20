# API: Cameras List

## Endpoint
`GET /v1/api/cameras/list`

## Description
Retrieve list of all available cameras from the Frigate recordings database.

## Phase
Phase 1: Foundation & Media

## Query Parameters
None

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/api/cameras/list"
```

## Response Example
```json
{
  "success": true,
  "message": "Cameras retrieved successfully",
  "data": {
    "cameras": [
      "admin_office",
      "employees_01",
      "employees_02",
      "employees_03",
      "employees_04",
      "employees_05",
      "employees_06",
      "employees_07",
      "employees_08",
      "meeting_room",
      "reception"
    ],
    "count": 11,
    "total_cameras": 11
  },
  "timestamp": "2025-10-19T23:18:33.131Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
```sql
SELECT DISTINCT camera 
FROM recordings 
ORDER BY camera;
```

### Local MongoDB (WRITE)
None - Direct database query

## Implementation Notes
- Queries distinct camera names from recordings table
- Returns cameras in alphabetical order
- Includes count for easy pagination setup
- No filtering or limits applied
- Fast query with minimal data transfer

## Related Endpoints
- `/v1/api/cameras/summary` - Camera summaries (Phase 2)
- `/v1/api/cameras/{camera_name}/activity` - Camera activity (Phase 2)
- `/v1/api/recent-media/recordings` - Recent recordings by camera

## Testing
```bash
# Test cameras list
curl -v "http://localhost:5002/v1/api/cameras/list"

# Expected: 200 OK with array of camera names
# Should return real camera names from database
```

## Error Handling
- **500 Internal Server Error**: Database connection issues
- **503 Service Unavailable**: Frigate database unreachable
- Returns empty array if no cameras found (unlikely)
