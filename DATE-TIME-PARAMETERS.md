# Date/Time Parameters for Frigate Middleware API

## Overview

All API endpoints now support flexible date and time range queries instead of just "last X hours". This allows you to query specific historical periods with precise control.

## Supported Parameters

### Date/Time Parameters
- `start_date` - Start date (ISO string or YYYY-MM-DD format)
- `end_date` - End date (ISO string or YYYY-MM-DD format)
- `hours` - Hours to look back (fallback option)

### Other Parameters
- `limit` - Maximum number of results to return
- `camera` - Specific camera filter

## Date Format Examples

### ISO Date Strings (Recommended)
```
start_date=2025-10-01T10:00:00.000Z
end_date=2025-10-01T12:00:00.000Z
```

### Simple Date Format
```
start_date=2025-10-01
end_date=2025-10-01
```

### Mixed Formats
```
start_date=2025-10-01T08:00:00.000Z
end_date=2025-10-01
```

## API Endpoints with Date/Time Support

### 1. Camera Summary
**Endpoint:** `GET /v1/api/cameras/summary`

**Parameters:**
- `start_date` - Start date for activity analysis
- `end_date` - End date for activity analysis
- `hours` - Hours to look back (fallback)

**Examples:**
```bash
# Specific date range
curl "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01"

# Time range within a day
curl "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z"

# Last 24 hours (fallback)
curl "http://localhost:5002/v1/api/cameras/summary?hours=24"
```

### 2. Camera Violations
**Endpoint:** `GET /v1/api/cameras/{camera_name}/violations`

**Parameters:**
- `start_date` - Start date for violation search
- `end_date` - End date for violation search
- `hours` - Hours to look back (fallback)
- `limit` - Maximum number of violations to return

**Examples:**
```bash
# Specific date range
curl "http://localhost:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01&end_date=2025-10-01&limit=10"

# Time range within a day
curl "http://localhost:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=5"

# Last 7 days
curl "http://localhost:5002/v1/api/cameras/employees_01/violations?hours=168&limit=20"
```

### 3. Camera Activity
**Endpoint:** `GET /v1/api/cameras/{camera_name}/activity`

**Parameters:**
- `start_date` - Start date for activity feed
- `end_date` - End date for activity feed
- `hours` - Hours to look back (fallback)
- `limit` - Maximum number of activities to return

**Examples:**
```bash
# Specific date range
curl "http://localhost:5002/v1/api/cameras/employees_01/activity?start_date=2025-10-01&end_date=2025-10-01&limit=20"

# Time range within a day
curl "http://localhost:5002/v1/api/cameras/employees_01/activity?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z&limit=10"
```

### 4. Camera Status
**Endpoint:** `GET /v1/api/cameras/{camera_name}/status`

**Parameters:**
- `start_date` - Start date for status analysis
- `end_date` - End date for status analysis
- `hours` - Hours to look back (fallback)

**Examples:**
```bash
# Specific date range
curl "http://localhost:5002/v1/api/cameras/employees_01/status?start_date=2025-10-01&end_date=2025-10-01"

# Time range within a day
curl "http://localhost:5002/v1/api/cameras/employees_01/status?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z"
```

## Response Format

All endpoints return the applied filters in the response:

```json
{
  "success": true,
  "message": "Camera summaries retrieved successfully",
  "data": {
    "summaries": [...],
    "count": 11,
    "filters": {
      "hours": null,
      "start_date": "2025-10-01",
      "end_date": "2025-10-01"
    }
  },
  "timestamp": "2025-10-20T00:53:42.576Z"
}
```

## Date/Time Logic

### Priority Order
1. **Specific Date Range**: If `start_date` or `end_date` is provided, use date range
2. **Hours Lookback**: If only `hours` is provided, use hours lookback
3. **Default**: If no parameters provided, default to 24 hours

### Date Handling
- **ISO Strings**: Full timestamp with timezone (e.g., `2025-10-01T10:00:00.000Z`)
- **Date Only**: Automatically adds time (start: `00:00:00.000Z`, end: `23:59:59.999Z`)
- **Timezone**: All dates are treated as UTC

### Examples of Date Parsing
```javascript
// Input: start_date=2025-10-01
// Parsed: 2025-10-01T00:00:00.000Z

// Input: end_date=2025-10-01
// Parsed: 2025-10-01T23:59:59.999Z

// Input: start_date=2025-10-01T10:00:00.000Z
// Parsed: 2025-10-01T10:00:00.000Z (unchanged)
```

## Use Cases

### 1. Daily Reports
```bash
# Get all activity for October 1st
curl "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01"
```

### 2. Time-Specific Analysis
```bash
# Get violations during work hours (9 AM - 5 PM)
curl "http://localhost:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01T09:00:00.000Z&end_date=2025-10-01T17:00:00.000Z"
```

### 3. Multi-Day Analysis
```bash
# Get activity for the entire week
curl "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-07"
```

### 4. Real-Time Monitoring
```bash
# Get last hour of activity
curl "http://localhost:5002/v1/api/cameras/summary?hours=1"
```

## Error Handling

### Invalid Date Format
```json
{
  "success": false,
  "message": "Invalid date format",
  "error": "start_date must be in ISO format or YYYY-MM-DD"
}
```

### Date Range Validation
- Start date must be before end date
- Dates cannot be in the future
- Invalid dates will fall back to default behavior

## Performance Considerations

- **Large Date Ranges**: Queries spanning many days may take longer
- **Indexing**: Database is indexed on timestamp for optimal performance
- **Limits**: Use `limit` parameter to control result size
- **Caching**: Consider implementing caching for frequently queried date ranges

## Migration from Hours-Based Queries

### Before (Hours-Based)
```bash
curl "http://localhost:5002/v1/api/cameras/summary?hours=24"
```

### After (Date-Based)
```bash
# Equivalent to last 24 hours
curl "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-19T00:00:00.000Z&end_date=2025-10-20T00:00:00.000Z"

# Or still use hours as fallback
curl "http://localhost:5002/v1/api/cameras/summary?hours=24"
```

## Testing

### Test Scripts
```bash
#!/bin/bash

# Test specific date range
echo "Testing October 1st, 2025..."
curl -s "http://localhost:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01" | jq '.data.count'

# Test time range
echo "Testing 10 AM - 12 PM on October 1st..."
curl -s "http://localhost:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=5" | jq '.data.count'

# Test hours fallback
echo "Testing last 24 hours..."
curl -s "http://localhost:5002/v1/api/cameras/summary?hours=24" | jq '.data.count'
```

This documentation provides comprehensive guidance for using the new date/time parameters across all API endpoints.
