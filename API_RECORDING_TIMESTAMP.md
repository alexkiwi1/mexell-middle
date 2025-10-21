# Recording at Timestamp API

## Overview

The Recording at Timestamp API provides a way to retrieve video URLs for specific timestamps on cameras with customizable time windows. This API is designed to return clickable video URLs that automatically seek to the event time with context before and after.

**Enhanced Features:**
- Multiple date/time input formats (Unix timestamp, ISO dates, date+time, hours lookback)
- Timezone-aware date conversions
- Flexible parameter combinations
- Backward compatible with existing implementations

## Endpoint

```
GET /v1/api/recordings/at-time
```

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `camera` | string | **Yes** | - | Camera name (e.g., "employees_01", "reception") |
| `timestamp` | string/number | Conditional* | - | Unix timestamp or ISO date string (e.g., "2025-10-20T12:47:50") |
| `start_date` | string | Conditional* | - | Start date in YYYY-MM-DD format |
| `end_date` | string | No | `start_date` | End date in YYYY-MM-DD format |
| `start_time` | string | No | "00:00:00" | Start time in HH:MM:SS format |
| `end_time` | string | No | - | End time in HH:MM:SS format |
| `hours` | integer | Conditional* | - | Hours to look back from current time |
| `timezone` | string | No | "UTC" | Timezone (e.g., "Asia/Karachi", "America/New_York") |
| `window` | integer | No | 2 | Time window in seconds (1-60) |

**At least one time parameter is required**: `timestamp`, `start_date`, or `hours`

## Examples

### 1. Unix Timestamp (Original Method)

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734"
```

### 2. ISO Date String

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=2025-10-20T12:47:50"
```

### 3. Date + Time with Timezone

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&start_time=12:47:50&timezone=Asia/Karachi&window=5"
```

### 4. Date Only (Defaults to Midnight)

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&timezone=Asia/Karachi"
```

### 5. Hours Lookback

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&hours=24&window=3"
```

### 6. Custom Time Window

```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734&window=5"
```

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "message": "Recording found successfully",
  "data": {
    "video_url": "http://10.0.20.6:8000/recordings/2025-10-20/12/employees_08/47.50.mp4#t=0.7,4.7",
    "recording_id": "1760964470.0-2spjde",
    "camera": "employees_08",
    "exact_timestamp": 1760964472.674734,
    "timestamp_iso": "2025-10-20T12:47:52.674Z",
    "timezone": "Asia/Karachi",
    "time_window": {
      "start_seconds": 0.6747341156005859,
      "end_seconds": 4.674734115600586,
      "duration_seconds": 4,
      "start_timestamp": 1760964470.674734,
      "end_timestamp": 1760964474.674734
    },
    "playback_info": {
      "event_at_seconds": 2.674734115600586,
      "window_seconds": 2,
      "total_clip_duration": 4
    },
    "recording_info": {
      "path": "/media/frigate/recordings/2025-10-20/12/employees_08/47.50.mp4",
      "start_time": 1760964470,
      "end_time": 1760964481.391,
      "duration": 11.391,
      "offset_in_recording": 2.674734115600586
    },
    "input_parameters": {
      "method": "date_time",
      "start_date": "2025-10-20",
      "start_time": "12:47:50",
      "timezone": "Asia/Karachi",
      "window": 2
    }
  },
  "timestamp": "2025-10-21T06:22:08.422Z"
}
```

### Error Responses

#### Missing Camera Parameter (400)

```json
{
  "success": false,
  "message": "Camera parameter is required",
  "error": "Missing required parameter: camera"
}
```

#### Missing Time Parameter (400)

```json
{
  "success": false,
  "message": "Time parameter is required",
  "error": "Provide timestamp, start_date, or hours parameter"
}
```

#### Invalid Date Format (400)

```json
{
  "success": false,
  "message": "Invalid date/time format",
  "error": "Check date format (YYYY-MM-DD) and time format (HH:MM:SS)"
}
```

#### Recording Not Found (404)

```json
{
  "success": false,
  "message": "No recording found for camera 'nonexistent' at timestamp 1760964472.674734",
  "data": {
    "camera": "nonexistent",
    "timestamp": 1760964472.674734,
    "suggestions": [
      "Check if the camera name is correct",
      "Verify the timestamp is within recording range",
      "Try a different time window"
    ]
  },
  "error": "Recording not found"
}
```

#### Invalid Window Parameter (400)

```json
{
  "success": false,
  "message": "Window parameter must be a number between 1 and 60 seconds",
  "error": "Invalid window parameter"
}
```

## Video URL Format

The returned `video_url` uses HTML5 time fragments for automatic seeking:

```
http://10.0.20.6:8000/recordings/2025-10-20/12/employees_08/47.50.mp4#t=0.7,4.7
```

- **Base URL**: Points to the recording file
- **Time Fragment**: `#t=start,end` automatically seeks to the specified time range
- **Browser Compatible**: Works in all modern browsers
- **Direct Playback**: Click the URL to watch the video immediately

## Time Window Behavior

| Window Size | Total Duration | Use Case |
|-------------|----------------|----------|
| 1 second | 2 seconds | Quick preview |
| 2 seconds (default) | 4 seconds | Standard review |
| 5 seconds | 10 seconds | Detailed context |
| 10 seconds | 20 seconds | Extended context |

## Parameter Priority

When multiple time parameters are provided, the API follows this priority:

1. **`timestamp`** - Direct Unix timestamp or ISO date string (highest priority)
2. **`start_date` + `start_time`** - Date and time combination with timezone support
3. **`hours`** - Lookback from current time (lowest priority)

**Examples:**

```bash
# Priority 1: Uses timestamp (ignores hours if both provided)
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734&hours=24"

# Priority 2: Uses start_date + start_time
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&start_time=12:47:50"

# Priority 3: Uses hours lookback
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&hours=24"
```

## Timezone Support

The API supports timezone-aware date conversions using standard IANA timezone names:

**Common Timezones:**
- `UTC` - Coordinated Universal Time (default)
- `Asia/Karachi` - Pakistan Standard Time (UTC+5)
- `America/New_York` - Eastern Time (UTC-5/UTC-4)
- `Europe/London` - British Time (UTC+0/UTC+1)
- `Asia/Dubai` - Gulf Standard Time (UTC+4)

**Example with Timezone:**

```bash
# Convert Pakistan time to UTC automatically
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&start_time=17:47:50&timezone=Asia/Karachi"
```

## Database Query

The API uses the following PostgreSQL query to find recordings:

```sql
SELECT id, camera, path, start_time, end_time, duration
FROM recordings
WHERE camera = $1 
  AND start_time <= $2 
  AND end_time >= $2
LIMIT 1
```

## Implementation Details

### Service Function

Located in `src/services/frigate.service.js`:

```javascript
const getRecordingAtTimestamp = async (options = {}) => {
  const { camera, timestamp, window = 2 } = options;
  // Implementation details...
};
```

### Controller

Located in `src/controllers/media.controller.js`:

```javascript
const getRecordingAtTimestampController = async (req, res, next) => {
  // Parameter validation and error handling
};
```

### Route

Located in `src/routes/v1/media.route.js`:

```javascript
router.get('/api/recordings/at-time', getRecordingAtTimestampController);
```

## Testing Examples

### Test with Real Data (Unix Timestamps)

```bash
# Farhan Ali at desk_57 (employees_08)
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734"

# Arbaz at desk_11 (employees_02) 
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_02&timestamp=1760947508.370521"

# Bilal Soomro at admin office
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=admin_office&timestamp=1760953153.700047"
```

### Test with ISO Date Strings

```bash
# Using ISO date string
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=2025-10-20T12:47:50"

# With custom window
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=2025-10-20T12:47:50&window=5"
```

### Test with Date + Time Parameters

```bash
# Date and time with timezone
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&start_time=17:47:50&timezone=Asia/Karachi"

# Date only (defaults to midnight UTC)
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20"

# Date only with timezone
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=2025-10-20&timezone=Asia/Karachi"
```

### Test with Hours Lookback

```bash
# Last 24 hours
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&hours=24"

# Last hour with 5-second window
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&hours=1&window=5"
```

### Test Error Cases

```bash
# Missing camera parameter
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?timestamp=1760964472.674734"

# Missing all time parameters
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08"

# Non-existent camera
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=nonexistent&timestamp=1760964472.674734"

# Invalid window size
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734&window=100"

# Invalid date format
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&start_date=20-10-2025"

# Invalid hours parameter
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&hours=-5"
```

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

// Method 1: Using Unix timestamp
async function getVideoUrl(camera, timestamp, window = 2) {
  try {
    const response = await axios.get('http://10.100.6.2:5002/v1/api/recordings/at-time', {
      params: { camera, timestamp, window }
    });
    return response.data.data.video_url;
  } catch (error) {
    console.error('Error getting video URL:', error.response?.data);
    return null;
  }
}

// Method 2: Using date + time with timezone
async function getVideoUrlByDate(camera, date, time, timezone = 'UTC', window = 2) {
  try {
    const response = await axios.get('http://10.100.6.2:5002/v1/api/recordings/at-time', {
      params: { 
        camera, 
        start_date: date, 
        start_time: time, 
        timezone, 
        window 
      }
    });
    return response.data.data.video_url;
  } catch (error) {
    console.error('Error getting video URL:', error.response?.data);
    return null;
  }
}

// Method 3: Using hours lookback
async function getRecentVideo(camera, hours = 24, window = 2) {
  try {
    const response = await axios.get('http://10.100.6.2:5002/v1/api/recordings/at-time', {
      params: { camera, hours, window }
    });
    return response.data.data.video_url;
  } catch (error) {
    console.error('Error getting video URL:', error.response?.data);
    return null;
  }
}

// Usage Examples
const videoUrl1 = await getVideoUrl('employees_08', 1760964472.674734, 5);
console.log('Video URL (Unix):', videoUrl1);

const videoUrl2 = await getVideoUrlByDate('employees_08', '2025-10-20', '17:47:50', 'Asia/Karachi', 5);
console.log('Video URL (Date):', videoUrl2);

const videoUrl3 = await getRecentVideo('employees_08', 24, 3);
console.log('Video URL (Recent):', videoUrl3);
```

### Python

```python
import requests
from typing import Optional

# Method 1: Using Unix timestamp
def get_video_url(camera: str, timestamp: float, window: int = 2) -> Optional[str]:
    url = 'http://10.100.6.2:5002/v1/api/recordings/at-time'
    params = {'camera': camera, 'timestamp': timestamp, 'window': window}
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()['data']['video_url']
    except requests.exceptions.RequestException as e:
        print(f'Error getting video URL: {e}')
        return None

# Method 2: Using date + time with timezone
def get_video_url_by_date(camera: str, date: str, time: str, 
                          timezone: str = 'UTC', window: int = 2) -> Optional[str]:
    url = 'http://10.100.6.2:5002/v1/api/recordings/at-time'
    params = {
        'camera': camera,
        'start_date': date,
        'start_time': time,
        'timezone': timezone,
        'window': window
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()['data']['video_url']
    except requests.exceptions.RequestException as e:
        print(f'Error getting video URL: {e}')
        return None

# Method 3: Using hours lookback
def get_recent_video(camera: str, hours: int = 24, window: int = 2) -> Optional[str]:
    url = 'http://10.100.6.2:5002/v1/api/recordings/at-time'
    params = {'camera': camera, 'hours': hours, 'window': window}
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()['data']['video_url']
    except requests.exceptions.RequestException as e:
        print(f'Error getting video URL: {e}')
        return None

# Usage Examples
video_url1 = get_video_url('employees_08', 1760964472.674734, 5)
print(f'Video URL (Unix): {video_url1}')

video_url2 = get_video_url_by_date('employees_08', '2025-10-20', '17:47:50', 'Asia/Karachi', 5)
print(f'Video URL (Date): {video_url2}')

video_url3 = get_recent_video('employees_08', 24, 3)
print(f'Video URL (Recent): {video_url3}')
```

### cURL Examples

```bash
# Get video with 2-second window (default)
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734"

# Get video with 5-second window
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734&window=5"

# Get video with 1-second window (minimal)
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_08&timestamp=1760964472.674734&window=1"
```

## Performance Notes

- **Fast Response**: Typically responds in < 100ms
- **Database Optimized**: Uses indexed queries on camera and timestamp
- **Memory Efficient**: Returns only necessary recording metadata
- **Cached Results**: Video URLs are generated on-demand

## Security Considerations

- **Read-Only Access**: Only queries existing recordings
- **Parameter Validation**: All inputs are validated and sanitized
- **Error Handling**: No sensitive information exposed in error messages
- **Rate Limiting**: Inherits from existing API rate limiting

## Changelog

### Version 1.1.0 (2025-10-21)
- **Enhanced date/time support**: Multiple input formats
  - Unix timestamps (original)
  - ISO date strings (e.g., "2025-10-20T12:47:50")
  - Date + time combinations (`start_date`, `start_time`)
  - Hours lookback parameter
- **Timezone-aware conversions**: Support for IANA timezone names
- **Improved response metadata**: Added `timestamp_iso`, `timezone`, and `input_parameters`
- **Backward compatible**: All existing API calls continue to work
- **Enhanced documentation**: New examples and usage patterns
- **Parameter priority system**: Clear precedence when multiple time params provided

### Version 1.0.0 (2025-10-21)
- Initial implementation
- Support for ±2 second default window
- Customizable window sizes (1-60 seconds)
- Comprehensive error handling
- Swagger documentation included

## Support

For issues or questions regarding this API:

1. Check the error messages for specific guidance
2. Verify camera names and timestamps are correct
3. Ensure the timestamp falls within recording ranges
4. Try different window sizes if needed

## Related APIs

- `/v1/api/cameras` - List available cameras
- `/v1/api/recent-media/clips` - Get recent media clips
- `/v1/health` - Check API health status
