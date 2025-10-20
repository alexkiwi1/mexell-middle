# API: API Information

## Endpoint
`GET /v1/api/info`

## Description
Comprehensive API information endpoint with detailed configuration and feature information.

## Phase
Phase 1: Foundation & Media

## Query Parameters
None

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/api/info"
```

## Response Example
```json
{
  "success": true,
  "message": "API Information",
  "data": {
    "api": {
      "name": "Frigate Middleware API",
      "version": "1.0.0",
      "description": "Comprehensive middleware service for Frigate surveillance dashboard",
      "openapi": "3.1.0"
    },
    "features": [
      "Real-time phone violation detection",
      "Employee tracking and attendance management",
      "Camera monitoring and activity tracking",
      "Zone-based analytics and heatmaps",
      "Video and media file serving",
      "Dashboard analytics and reporting"
    ],
    "database": {
      "frigate_postgresql": {
        "status": "read-only",
        "purpose": "Detection events and media metadata"
      },
      "local_mongodb": {
        "status": "read-write",
        "purpose": "Cache, analytics, and user data"
      }
    },
    "media": {
      "video_server": "http://10.0.20.6:8000",
      "supported_formats": ["mp4", "webp", "jpg", "png"]
    },
    "limits": {
      "max_query_limit": 1000,
      "default_query_limit": 100,
      "max_hours_lookback": 168
    }
  },
  "timestamp": "2025-10-19T23:18:30.384Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
None - Static configuration only

### Local MongoDB (WRITE)
None - Static configuration only

## Implementation Notes
- Returns detailed API configuration and capabilities
- Lists all supported features and formats
- Shows database configuration and purposes
- Includes query limits and constraints
- Useful for client integration and documentation

## Related Endpoints
- `/v1/` - Root endpoint with basic info
- `/v1/health` - Service health status
- `/v1/docs` - Swagger documentation

## Testing
```bash
# Test API info endpoint
curl -v "http://localhost:5002/v1/api/info"

# Expected: 200 OK with detailed API information
# Should include features, database config, and limits
```

## Error Handling
- **500 Internal Server Error**: Application configuration issues
- Very unlikely to fail as it returns static configuration
- No external dependencies
