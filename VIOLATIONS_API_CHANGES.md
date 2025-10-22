# Violations API Changes - Frontend Integration Guide

## Overview
The violations API has been updated to provide working media URLs and confidence data. The main API structure remains the same, but the `media` object content has been enhanced.

## API Endpoints (Unchanged)
- **GET** `/v1/api/cameras/{camera}/violations`
- **GET** `/v1/api/violations/summary`

## Request Parameters (Unchanged)
- `hours` - Number of hours to look back
- `limit` - Maximum number of violations to return
- `start_date` / `end_date` - Date range for violations

## Response Structure Changes

### Before (Old Media Object)
```json
{
  "media": {
    "thumbnail_url": "http://10.0.20.6:8000/recordings/...",
    "video_url": "http://10.0.20.6:8000/recordings/...",
    "snapshot_url": null,
    "note": "Media URLs from Frigate event table. Using recording timestamp API for video."
  }
}
```

### After (New Media Object)
```json
{
  "media": {
    "thumbnail_url": "http://10.0.20.6:5000/api/events/{event_id}/thumbnail.jpg",
    "snapshot_url": "http://10.0.20.6:5000/api/events/{event_id}/snapshot.jpg",
    "video_api_path": "/v1/api/recordings/at-time?camera={camera}&timestamp={timestamp}&window=2",
    "confidence": {
      "score": 0.85,
      "source": "frigate_score",
      "frigate_score": 0.85,
      "frigate_top_score": 0.92,
      "detector_type": "onnx",
      "model_hash": "89e9e5cb7e2d3e71669b55415fc7ee04",
      "note": "Using actual Frigate confidence score"
    },
    "note": "Using Frigate event API for thumbnails and snapshots. Video URL available via video_api_path.",
    "frigate_api_url": "http://10.0.20.6:5000",
    "video_server_url": "http://10.0.20.6:8000"
  }
}
```

## New Fields Added

### 1. `confidence` Object
- **`score`**: Best available confidence score (0.0-1.0)
- **`source`**: Source of the score (`frigate_score`, `frigate_top_score`, `default_estimate`)
- **`frigate_score`**: Raw Frigate confidence score (if available)
- **`frigate_top_score`**: Frigate's top score (if available)
- **`detector_type`**: Detector type used (e.g., "onnx")
- **`model_hash`**: Model hash for the detector
- **`note`**: Human-readable explanation

### 2. `video_api_path`
- **Purpose**: Path to get video URL (frontend should call this endpoint)
- **Format**: `/v1/api/recordings/at-time?camera={camera}&timestamp={timestamp}&window=2`
- **Usage**: Make GET request to get actual video URL

### 3. `frigate_api_url`
- **Purpose**: Base URL for Frigate API
- **Value**: `http://10.0.20.6:5000`

## Removed Fields

### 1. `video_url`
- **Replaced by**: `video_api_path`
- **Reason**: Video URLs are now generated on-demand for better performance

## Media URL Changes

### Thumbnail URLs
- **Before**: `http://10.0.20.6:8000/recordings/...` (often 404)
- **After**: `http://10.0.20.6:5000/api/events/{event_id}/thumbnail.jpg` (always works)
- **Format**: WebP image, 175x175 pixels
- **Status**: ✅ Always returns 200 OK

### Snapshot URLs
- **Before**: `null` (not available)
- **After**: `http://10.0.20.6:5000/api/events/{event_id}/snapshot.jpg` (always works)
- **Format**: JPEG image, 3840x2160 pixels
- **Status**: ✅ Always returns 200 OK

### Video URLs
- **Before**: Direct video URL (often 404)
- **After**: API path to get video URL on-demand
- **Usage**: Call `GET {video_api_path}` to get actual video URL

## Frontend Integration Changes

### 1. Display Confidence Scores
```javascript
// Display confidence score with source
const confidence = violation.media.confidence;
console.log(`Confidence: ${confidence.score} (${confidence.source})`);
console.log(`Detector: ${confidence.detector_type}`);
```

### 2. Get Video URLs On-Demand
```javascript
// Get video URL when needed
const getVideoUrl = async (violation) => {
  const response = await fetch(violation.media.video_api_path);
  const data = await response.json();
  return data.data.video_url;
};
```

### 3. Display Media with Fallbacks
```javascript
// Display thumbnail with fallback
const displayThumbnail = (violation) => {
  const thumbnailUrl = violation.media.thumbnail_url;
  const snapshotUrl = violation.media.snapshot_url;
  
  // Use thumbnail first, fallback to snapshot
  return thumbnailUrl || snapshotUrl;
};
```

### 4. Show Confidence Indicators
```javascript
// Show confidence level in UI
const getConfidenceLevel = (confidence) => {
  if (confidence.score >= 0.9) return 'high';
  if (confidence.score >= 0.7) return 'medium';
  return 'low';
};

const getConfidenceColor = (confidence) => {
  if (confidence.source === 'frigate_score') return 'green';
  if (confidence.source === 'frigate_top_score') return 'blue';
  return 'orange'; // default_estimate
};
```

## Testing Examples

### Test Thumbnail URL
```bash
curl -I "http://10.0.20.6:5000/api/events/{event_id}/thumbnail.jpg"
# Expected: HTTP/1.1 200 OK
```

### Test Snapshot URL
```bash
curl -I "http://10.0.20.6:5000/api/events/{event_id}/snapshot.jpg"
# Expected: HTTP/1.1 200 OK
```

### Test Video API Path
```bash
curl "http://10.100.6.2:5002/v1/api/recordings/at-time?camera=employees_01&timestamp=1761043055.341651&window=2"
# Expected: JSON with video_url field
```

## Migration Notes

### For Existing Frontend Code
1. **Update thumbnail display**: Use `media.thumbnail_url` (now always works)
2. **Add snapshot support**: Use `media.snapshot_url` for full-resolution images
3. **Update video handling**: Call `media.video_api_path` to get video URLs
4. **Add confidence display**: Show `media.confidence.score` and `media.confidence.source`
5. **Remove direct video_url usage**: Replace with video_api_path calls

### Backward Compatibility
- All existing API endpoints work the same
- Request parameters unchanged
- Main violation fields unchanged
- Only `media` object content changed

## Benefits

1. **✅ Working URLs**: All media URLs return actual content (no more 404s)
2. **✅ Confidence Data**: Full Frigate confidence information available
3. **✅ Better Performance**: No slow async calls during API response
4. **✅ On-Demand Video**: Video URLs generated only when needed
5. **✅ High-Quality Images**: Full-resolution snapshots available
6. **✅ Reliable Thumbnails**: Consistent thumbnail generation

## Example Complete Response

```json
{
  "data": {
    "violations": [
      {
        "timestamp": "2025-10-21T10:37:35.341Z",
        "camera": "employees_01",
        "assignedEmployee": "Kinza Amin",
        "zones": ["employee_area", "desk_02"],
        "objects": ["cell phone"],
        "confidence": 0.85,
        "media": {
          "thumbnail_url": "http://10.0.20.6:5000/api/events/1761043055.341651-r5gpx1/thumbnail.jpg",
          "snapshot_url": "http://10.0.20.6:5000/api/events/1761043055.341651-r5gpx1/snapshot.jpg",
          "video_api_path": "/v1/api/recordings/at-time?camera=employees_01&timestamp=1761043055.341651&window=2",
          "confidence": {
            "score": 0.85,
            "source": "frigate_score",
            "frigate_score": 0.85,
            "detector_type": "onnx",
            "note": "Using actual Frigate confidence score"
          }
        }
      }
    ]
  }
}
```
