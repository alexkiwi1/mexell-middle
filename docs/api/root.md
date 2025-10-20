# API: Root Endpoint

## Endpoint
`GET /v1/`

## Description
Root endpoint with comprehensive API information and metadata.

## Phase
Phase 1: Foundation & Media

## Query Parameters
None

## Path Parameters
None

## Request Example
```bash
curl "http://localhost:5002/v1/"
```

## Response Example
```json
{
  "success": true,
  "message": "Frigate Middleware API",
  "data": {
    "name": "Frigate Middleware API",
    "version": "1.0.0",
    "description": "A comprehensive middleware service for Frigate surveillance dashboard with real-time phone violation detection, employee tracking, and attendance management.",
    "contact": {
      "name": "Frigate Dashboard Middleware",
      "email": "admin@frigate-dashboard.com"
    },
    "license": {
      "name": "MIT License",
      "url": "https://opensource.org/licenses/MIT"
    },
    "servers": [
      {
        "url": "http://10.100.6.2:5002",
        "description": "Production Server"
      },
      {
        "url": "http://localhost:5002",
        "description": "Development Server"
      }
    ],
    "endpoints": {
      "health": "/health",
      "api_info": "/api/info",
      "cameras": "/api/cameras/*",
      "violations": "/api/violations/*",
      "employees": "/api/employees/*",
      "attendance": "/api/attendance/*",
      "zones": "/api/zones/*",
      "dashboard": "/api/dashboard/*",
      "media": "/api/recent-media/*"
    },
    "documentation": "/v1/docs"
  },
  "timestamp": "2025-10-19T23:18:28.054Z"
}
```

## Database Queries
### Frigate PostgreSQL (READ-ONLY)
None - Static information only

### Local MongoDB (WRITE)
None - Static information only

## Implementation Notes
- Returns static API metadata and configuration
- Lists all available endpoint categories
- Provides server URLs for different environments
- Includes contact and license information
- No database queries required

## Related Endpoints
- `/v1/health` - Health check
- `/v1/api/info` - Detailed API information
- `/v1/docs` - Swagger documentation

## Testing
```bash
# Test root endpoint
curl -v "http://localhost:5002/v1/"

# Expected: 200 OK with API information
# Should include all endpoint categories
```

## Error Handling
- **500 Internal Server Error**: Application startup issues
- Very unlikely to fail as it returns static data
- No external dependencies
