# Face Recognition Arrival Detection System

## Overview

The Face Recognition Arrival Detection System is designed to accurately identify employee arrivals while eliminating false positives from cleaners, visitors, and other non-employees who may spend time at employee desks.

## Problem Solved

**Issue**: Cleaners working at desks in the morning trigger false arrivals because they spend 2+ minutes at desks, but they are not the employees assigned to those desks.

**Solution**: Implement a dual-condition system that requires both cumulative desk time AND face recognition validation within a 30-minute window.

## How It Works

### 1. Cumulative Desk Time Calculation

The system tracks cumulative time spent at any desk zone (`desk_01`, `desk_02`, etc.) with the following logic:

- **Threshold**: 2 minutes (120 seconds) cumulative desk time
- **Gap Tolerance**: 60 seconds between detections (allows for brief interruptions)
- **Cumulative**: Time is accumulated across multiple desk visits, not required to be continuous

```javascript
// Example: Employee visits desk_05 for 1 minute, leaves for 30 seconds, returns for 1.5 minutes
// Total cumulative time: 2.5 minutes ✅ (exceeds 2-minute threshold)
```

### 2. Face Recognition Validation

Once the 2-minute desk time threshold is reached, the system looks ahead for face recognition:

- **Window**: 30 minutes after reaching the threshold
- **Matching**: Case-insensitive comparison of `face_recognized_name` with `employee_name`
- **Source**: Face recognition data comes from Frigate's object tracking with face recognition

### 3. Dual-Condition Logic

**Both conditions must be met for arrival qualification:**

1. ✅ **2+ minutes cumulative desk time**
2. ✅ **Face recognition within 30 minutes of threshold**

## Implementation Details

### Database Structure

The system uses the `timeline` table with the following key fields:

```sql
SELECT 
  timestamp,
  camera,
  source,
  data->'sub_label'->>0 as employee_name,  -- Face recognition name
  data->'zones' as zones,                   -- Desk zones (desk_01, desk_02, etc.)
  data->>'score' as confidence
FROM timeline
WHERE data->'sub_label'->>0 IS NOT NULL   -- Only face-recognized detections
```

### Detection Storage

Each detection object includes face recognition data:

```javascript
{
  timestamp: 1761025794.679133,
  camera: "employees_01",
  zones: ["desk_05", "desk_06"],
  confidence: 0.85,
  face_recognized_name: "John Doe"  // Added for validation
}
```

### Algorithm Flow

```javascript
const calculateCumulativeDeskTime = (detections, thresholdMinutes = 2, employeeName = null) => {
  const THRESHOLD_SECONDS = thresholdMinutes * 60;
  const FACE_RECOGNITION_WINDOW = 30 * 60; // 30 minutes
  
  // 1. Calculate cumulative desk time
  for (detection of detections) {
    if (hasDeskZone(detection)) {
      cumulativeSeconds += timeAtDesk(detection);
      
      // 2. Check if threshold reached
      if (cumulativeSeconds >= THRESHOLD_SECONDS) {
        
        // 3. Look ahead 30 minutes for face recognition
        for (futureDetection in next30Minutes) {
          if (faceMatches(futureDetection, employeeName)) {
            return { qualifies: true, arrivalTimestamp: detection.timestamp };
          }
        }
        
        // 4. No face recognition found
        return { qualifies: false, reason: "No face recognition within 30 minutes" };
      }
    }
  }
  
  return { qualifies: false, reason: "Insufficient desk time" };
};
```

## Scenarios and Outcomes

### Scenario 1: Real Employee ✅

**Timeline:**
- 08:00:00 - Employee reaches desk, starts working
- 08:02:15 - Reaches 2-minute cumulative desk time threshold
- 08:02:20 - Face recognition occurs (5 seconds later)

**Result:** ✅ **Arrival Qualified**
- Message: "Cumulative 2.1 minutes at desk + face recognized after 0.1 minutes"

### Scenario 2: Cleaner ❌

**Timeline:**
- 07:00:00 - Cleaner starts cleaning desk
- 07:02:30 - Reaches 2-minute cumulative desk time threshold
- 07:30:00 - No face recognition within 30 minutes

**Result:** ❌ **No Arrival**
- Message: "2.5 minutes at desk BUT no face recognition within 30 minutes (likely cleaner/visitor)"

### Scenario 3: Employee with Late Recognition ❌

**Timeline:**
- 08:00:00 - Employee reaches desk
- 08:02:00 - Reaches 2-minute threshold
- 08:35:00 - Face recognition occurs (33 minutes later - outside 30-minute window)

**Result:** ❌ **No Arrival**
- Message: "2.0 minutes at desk BUT no face recognition within 30 minutes"

### Scenario 4: Insufficient Desk Time ❌

**Timeline:**
- 08:00:00 - Employee at desk
- 08:01:30 - Only 1.5 minutes cumulative desk time
- 08:01:30 - Face recognition occurs

**Result:** ❌ **No Arrival**
- Message: "Only 1.5 minutes at desk (need 2)"

## Configuration Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `MIN_CUMULATIVE_MINUTES` | 2 | Required cumulative desk time |
| `FACE_RECOGNITION_WINDOW` | 30 minutes | Time window for face recognition |
| `GAP_TOLERANCE` | 60 seconds | Maximum gap between desk detections |
| `THRESHOLD_SECONDS` | 120 | 2 minutes in seconds |

## Debug Logging

The system provides detailed logging for troubleshooting:

### Successful Qualification
```
info: Employee John Doe: Arrival qualified - Cumulative 2.1 minutes at desk + face recognized after 0.0 minutes
```

### Failed Qualification - No Face Recognition
```
warn: Employee Jane Smith: No qualifying arrival - 2.5 minutes at desk BUT no face recognition within 30 minutes (likely cleaner/visitor)
```

### Failed Qualification - Insufficient Time
```
warn: Employee Bob Wilson: No qualifying arrival - Only 1.2 minutes at desk (need 2)
```

## Benefits

### ✅ Eliminates False Positives
- **Cleaners**: No face recognition = no arrival qualification
- **Visitors**: Temporary desk usage won't trigger arrivals
- **Maintenance**: System maintenance won't create false arrivals

### ✅ Maintains Accuracy
- **Real Employees**: Must have both desk time AND face recognition
- **High Confidence**: Dual validation ensures legitimate arrivals
- **Grace Period**: 30-minute window accommodates various work patterns

### ✅ Flexible and Robust
- **Cumulative Time**: Accounts for employees who move between desks
- **Gap Tolerance**: Handles brief interruptions (bathroom, coffee, etc.)
- **Face Matching**: Case-insensitive matching handles name variations

## API Response Format

### Successful Arrival
```json
{
  "employee_name": "John Doe",
  "arrival_time": "2025-10-21T08:02:15.000+00:00",
  "departure_time": "2025-10-21T17:30:45.000+00:00",
  "total_work_hours": 8.5,
  "arrival_qualification": {
    "qualifies": true,
    "arrivalTimestamp": 1761025335,
    "totalDeskTime": 135,
    "thresholdReached": "Cumulative 2.3 minutes at desk + face recognized after 0.1 minutes"
  }
}
```

### No Arrival (Cleaner/Visitor)
```json
{
  "employee_name": "Unknown Person",
  "arrival_time": null,
  "departure_time": null,
  "total_work_hours": 0,
  "arrival_qualification": {
    "qualifies": false,
    "arrivalTimestamp": null,
    "totalDeskTime": 150,
    "reason": "2.5 minutes at desk BUT no face recognition within 30 minutes (likely cleaner/visitor)"
  }
}
```

## Technical Implementation

### File Structure
```
src/services/employees.service.js
├── calculateCumulativeDeskTime()     # Main algorithm
├── getEmployeeWorkHours()             # Orchestrates the logic
└── Detection storage with face data   # Enhanced detection objects
```

### Key Functions

1. **`calculateCumulativeDeskTime(detections, thresholdMinutes, employeeName)`**
   - Calculates cumulative desk time
   - Validates face recognition within window
   - Returns qualification result

2. **Enhanced Detection Storage**
   - Stores `face_recognized_name` in each detection
   - Enables face recognition validation
   - Maintains backward compatibility

3. **Debug Logging**
   - Shows qualification reasons
   - Tracks face recognition timing
   - Helps troubleshoot issues

## Backup and Rollback

### Backup Files
- `employees.service.js.backup-2min` - 2-minute cumulative without face recognition
- `employees.service.js.backup-1min` - 1-minute cumulative without face recognition
- `employees.service.js.backup` - Original implementation

### Rollback Procedure
```bash
# Rollback to 2-minute without face recognition
cp employees.service.js.backup-2min employees.service.js
docker cp employees.service.js container:/path/
docker restart container
```

## Monitoring and Maintenance

### Health Checks
- Monitor arrival qualification rates
- Track face recognition success rates
- Alert on unusual patterns

### Performance Metrics
- Average face recognition delay
- Cumulative desk time distribution
- False positive elimination rate

### Troubleshooting
1. Check face recognition data availability
2. Verify desk zone detection accuracy
3. Monitor 30-minute window effectiveness
4. Review qualification messages in logs

## Future Enhancements

### Potential Improvements
- **Adaptive Thresholds**: Adjust based on employee patterns
- **Machine Learning**: Predict arrival likelihood
- **Multi-Factor**: Include additional validation methods
- **Real-time Alerts**: Notify of unusual patterns

### Configuration Options
- Adjustable time windows
- Custom face recognition confidence thresholds
- Department-specific rules
- Time-of-day adjustments

---

**Last Updated**: October 21, 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅


