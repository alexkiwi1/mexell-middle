# API: Health Check

## Endpoint
`GET /v1/health`

## Description
Comprehensive health check endpoint with detailed status information for all services including Frigate PostgreSQL database connectivity.

## Phase
Phase 1: Foundation & Media

## Query Parameters
None

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/health"
```

## Response Example
```json
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-19T23:18:25.536Z",
    "uptime": 13.987363431,
    "responseTime": "202ms",
    "services": {
      "frigate_database": {
        "status": "connected",
        "host": "10.0.20.6",
        "port": "5433",
        "database": "frigate_db"
      },
      "video_server": {
        "status": "external",
        "url": "http://10.0.20.6:8000"
      }
    },
    "version": "1.0.0",
    "environment": "development"
  },
  "timestamp": "2025-10-19T23:18:25.536Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
```sql
SELECT NOW() as current_time;
```

### Local MongoDB (WRITE)
None - Health check only

## Implementation Notes
- Tests PostgreSQL connection with simple query
- Measures response time for performance monitoring
- Returns detailed service status information
- Used for load balancer health checks
- No authentication required

## Related Endpoints
- `/v1/` - Root endpoint with API information
- `/v1/api/info` - Detailed API information

## Testing
```bash
# Test health endpoint
curl -v "http://localhost:5002/v1/health"

# Expected: 200 OK with healthy status
# Unhealthy: 503 Service Unavailable
```

## Error Handling
- **503 Service Unavailable**: When Frigate database is unreachable
- **500 Internal Server Error**: When health check itself fails
- Response includes error details in development mode
