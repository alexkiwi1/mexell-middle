# Departure Time Problems Analysis

## Date: October 21, 2025

## Problem Summary

The current departure time logic has significant issues causing **inaccurate late departure times** for most employees.

## Current Logic (Line 565)

```javascript
employee.departure_timestamp = workSessions.length > 0 ? workSessions[workSessions.length - 1].end_time : null;
```

**What it does**: Uses the end time of the last work session (last detection)

## Identified Problems

### Problem 1: Spurious Late Detections

**Issue**: Single or very short detections late at night are being counted as departure time.

**Evidence - Syed Awwab**:
- **Reported Departure**: ~9:00 PM
- **System Shows**: 10:02 PM (22:02:48)
- **Last 3 Sessions**:
  1. 7:04 PM - 9:11 PM (2.1 hours, 14 zones) ← **This is likely his actual work session**
  2. 9:28 PM - 9:29 PM (0.1 minutes, 3 zones) ← **Spurious detection**
  3. 10:02 PM - 10:02 PM (0 minutes, 2 zones) ← **Spurious detection** (used as departure)

**Analysis**: The system is using the 10:02 PM detection as departure, but this appears to be a false positive or cleaner detection, not Syed's actual departure.

### Problem 2: Same Issue Across Multiple Employees

**Khalid Ahmed**:
- **System Shows**: 10:01 PM (22:01:21)
- **Last 2 Sessions**:
  1. 9:15 PM - 9:15 PM (0 minutes, 1 zone) ← **Spurious**
  2. 10:00 PM - 10:01 PM (1 minute, 2 zones) ← **Spurious** (used as departure)

**Abdul Qayoom**:
- **System Shows**: 8:24 PM (20:24:13)
- **Last 2 Sessions**:
  1. 7:31 PM - 7:32 PM (2 minutes, 5 zones)
  2. 8:24 PM - 8:24 PM (0 minutes, 2 zones) ← **Spurious** (used as departure)

**Ali Habib**:
- **System Shows**: 9:51 PM (21:51:28)
- **Last 2 Sessions**:
  1. 8:55 PM - 8:59 PM (4 minutes, 4 zones)
  2. 9:51 PM - 9:51 PM (0 minutes, 3 zones) ← **Spurious** (used as departure)

### Problem 3: No Validation Logic

**Current Issues**:
- ❌ No check for "departure gap" (significant time with no detections after)
- ❌ No validation that the last detection is at assigned desk
- ❌ No confidence tracking for departure
- ❌ No filtering of spurious/false positive detections
- ❌ No distinction between actual departure vs. late-night cleaners
- ❌ Single detection can set departure time (no continuous pattern required)

### Problem 4: Inconsistent with Arrival Logic

**Arrival logic** (recently implemented):
- ✅ Priority-based detection (face at desk → person at desk → face anywhere)
- ✅ Confidence tracking (high, medium, low, none)
- ✅ Coordinate validation
- ✅ Continuous pattern validation (2+ detections in 10 minutes)
- ✅ Time-based filtering (7 AM cutoff for cleaners)

**Departure logic** (current):
- ❌ No priority-based detection
- ❌ No confidence tracking
- ❌ No coordinate validation
- ❌ No continuous pattern validation
- ❌ No time-based filtering
- ❌ Simply uses last detection, regardless of quality

## Impact Assessment

### Accuracy Issues
- **Syed Awwab**: 1 hour late (shows 10:02 PM instead of ~9:00 PM)
- **Khalid Ahmed**: Potentially 1+ hour late (shows 10:01 PM)
- **Ali Habib**: Potentially 1+ hour late (shows 9:51 PM)
- **Abdul Qayoom**: Shows 8:24 PM (may or may not be accurate)

### Pattern Analysis
**Common Pattern**:
1. Employee has a long work session (actual work period)
2. Gap of 10+ minutes (employee leaves)
3. Single or very short detection late at night (0-2 minutes)
4. System uses this late detection as departure time

**This suggests**:
- Late detections are likely cleaners or false positives
- Actual departure is probably at the end of the last **substantial** work session
- Need to filter out detections that are:
  - Very short duration (< 5 minutes)
  - Isolated (no other detections nearby)
  - After a significant gap (30+ minutes)

## Proposed Solution Requirements

Based on the problems identified, the solution should:

1. **Identify Substantial Departure**
   - Look for the last **meaningful** work session (not isolated detections)
   - Filter out sessions shorter than 5 minutes
   - Validate departure with a "departure gap" (30+ minutes with no activity after)

2. **Priority-Based Detection**
   - Priority 1: Last face recognition at assigned desk
   - Priority 2: Last person detection at assigned desk
   - Priority 3: Last face recognition anywhere
   - Apply same validation logic as arrival

3. **Continuous Pattern Validation**
   - Require 2+ detections in 10 minutes before departure
   - Filter out single spurious detections
   - Ignore isolated late-night detections

4. **Confidence Tracking**
   - `departure_method`: How departure was detected
   - `departure_confidence`: Confidence level (high, medium, low)
   - Same structure as arrival for consistency

5. **Coordinate & Time Validation**
   - Apply coordinate validation for desk zones
   - Consider time-based filtering for late-night detections
   - Validate departure is at assigned desk (when possible)

## Expected Results After Fix

**Syed Awwab**:
- **Current**: 10:02 PM (22:02:48) ← Spurious
- **Expected**: ~9:11 PM (21:11:28) ← End of last substantial session
- **Improvement**: ~1 hour more accurate

**General Improvement**:
- Filter out spurious late detections
- More accurate departure times
- Consistent confidence tracking
- Better debugging with departure method logging

## Testing Checklist

After implementing the fix:
- [ ] Test Syed Awwab: Should show ~9:00-9:15 PM (not 10:02 PM)
- [ ] Test Khalid Ahmed: Should show earlier than 10:01 PM
- [ ] Test Ali Habib: Should show earlier than 9:51 PM
- [ ] Test Abdul Qayoom: Verify departure time is accurate
- [ ] Check 10+ other employees for accuracy
- [ ] Verify no false negatives (employees showing no departure when they did leave)
- [ ] Compare departure times with video footage timestamps
- [ ] Verify departure_method and departure_confidence are set correctly

