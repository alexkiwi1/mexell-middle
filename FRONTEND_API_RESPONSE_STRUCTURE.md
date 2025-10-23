# Frontend API Response Structure Documentation

## Date: October 21, 2025

## Overview

This document provides detailed API response structures for all employee-related APIs. All APIs now include consistent attendance tracking with arrival/departure time information.

## Base URL

```
http://10.0.20.8:5002/v1/api/employees/
```

## 1. Work Hours API

### Endpoint
```
GET /api/employees/work-hours
```

### Parameters
- `start_date` (string): Date in YYYY-MM-DD format
- `end_date` (string): Date in YYYY-MM-DD format  
- `timezone` (string): Timezone (default: UTC)
- `employee_name` (string, optional): Filter by specific employee
- `camera` (string, optional): Filter by specific camera

### Response Structure

```typescript
interface WorkHoursResponse {
  data: {
    employees: EmployeeWorkHours[];
    total_employees: number;
    total_work_hours: number;
    average_work_hours: number;
    period: {
      start: string;        // ISO datetime
      end: string;          // ISO datetime
      duration_hours: number;
    };
    timezone_info: {
      timezone: string;
      offset: string;
      offsetMinutes: number;
      isDST: boolean;
      currentTime: string;
      abbreviation: string;
    };
  };
}
```

### Employee Object Structure

```typescript
interface EmployeeWorkHours {
  // Basic Information
  employee_name: string;
  date: string;                    // YYYY-MM-DD format
  
  // Time Tracking
  arrival_timestamp: number | null;     // Unix timestamp
  departure_timestamp: number | null;   // Unix timestamp
  arrival_time: string | null;          // ISO datetime with timezone
  departure_time: string | null;        // ISO datetime with timezone
  first_seen: string | null;            // ISO datetime with timezone
  last_seen: string | null;             // ISO datetime with timezone
  
  // Work Hours
  total_work_hours: number;              // Total hours worked
  total_time: number;                    // Total time at office (hours)
  total_break_time: number;              // Total break time (hours)
  office_time: number;                   // Office time (total_time - break_time)
  unaccounted_time: number;             // Unaccounted time (should be 0)
  
  // Arrival Detection Metadata
  arrival_method: string;                 // 'face_at_desk', 'person_at_desk', 'face_anywhere', 'none'
  arrival_confidence: string;              // 'high', 'medium', 'low', 'none'
  
  // Desk Assignment
  assigned_desk: string | null;           // Desk ID (e.g., 'desk_02')
  assigned_desk_camera: string | null;    // Camera that detected arrival
  
  // Activity Data
  total_activity: number;                 // Number of detections
  cameras: string[];                      // List of cameras used
  zones: string[];                        // List of zones detected in
  detections: Detection[];                // Raw detection data
  
  // Work Sessions
  sessions: WorkSession[];               // Continuous work periods
  
  // Calculated Metrics
  average_session_duration: number;       // Average session length
  productivity_score: number;             // Productivity score (0-100)
  attendance_status: string;              // 'present', 'absent', 'partial'
  work_efficiency: number;                // Work efficiency score
}
```

### Work Session Structure

```typescript
interface WorkSession {
  start_time: number;                     // Unix timestamp
  end_time: number;                       // Unix timestamp
  duration_hours: number;                 // Session duration
  cameras: string[];                      // Cameras used in session
  zones: string[];                        // Zones detected in session
  first_seen: string;                     // ISO datetime
  last_seen: string;                      // ISO datetime
}
```

### Detection Structure

```typescript
interface Detection {
  timestamp: number;                      // Unix timestamp
  camera: string;                         // Camera name
  zones: string[];                       // Detected zones
  confidence: number;                    // Detection confidence
  face_recognized_name: string | null;   // Face recognition result
  event_id: string;                      // Frigate event ID
  duration: number;                       // Detection duration
}
```

## 2. Break Time API

### Endpoint
```
GET /api/employees/break-time
```

### Response Structure

```typescript
interface BreakTimeResponse {
  data: {
    employees: EmployeeBreakTime[];
    total_employees: number;
    total_break_time: number;
    average_break_time: number;
    timezone_info: TimezoneInfo;
  };
}
```

### Employee Break Time Structure

```typescript
interface EmployeeBreakTime {
  employee_name: string;
  total_breaks: number;                  // Number of break sessions
  total_break_time: number;              // Total break time (hours)
  break_sessions: BreakSession[];        // Individual break periods
  average_break_duration: number;        // Average break length
  longest_break: number;                 // Longest break (hours)
  shortest_break: number;                // Shortest break (hours)
  break_frequency: number;               // Breaks per hour
  break_efficiency: number;              // Break efficiency score
  
  // Work Context (inherited from work-hours)
  work_hours: number;
  office_time: number;
  total_time: number;
  arrival_time: string | null;
  departure_time: string | null;
}
```

### Break Session Structure

```typescript
interface BreakSession {
  start_time: number;                     // Unix timestamp
  end_time: number;                       // Unix timestamp
  duration_hours: number;                 // Break duration
  break_type: string;                     // 'lunch', 'short_break', 'unknown'
  efficiency_score: number;               // Break efficiency
}
```

## 3. Attendance API

### Endpoint
```
GET /api/employees/attendance
```

### Response Structure

```typescript
interface AttendanceResponse {
  data: {
    employees: EmployeeAttendance[];
    total_employees: number;
    period_days: number;
    overall_attendance_rate: number;
    timezone_info: TimezoneInfo;
  };
}
```

### Employee Attendance Structure

```typescript
interface EmployeeAttendance {
  employee_name: string;
  total_days: number;                     // Days worked
  total_work_hours: number;              // Total hours worked
  attendance_records: AttendanceRecord[]; // Daily attendance records
  attendance_rate: number;               // Attendance rate (0-100)
  average_daily_hours: number;           // Average hours per day
  attendance_score: number;              // Attendance score
  consistency_rating: string;            // 'excellent', 'good', 'fair', 'poor'
  perfect_attendance: boolean;           // Perfect attendance flag
}
```

### Attendance Record Structure

```typescript
interface AttendanceRecord {
  date: string;                          // YYYY-MM-DD format
  first_seen: string | null;             // ISO datetime
  last_seen: string | null;              // ISO datetime
  work_hours: number;                    // Hours worked
  activity_count: number;                // Number of detections
  status: string;                        // 'present', 'absent', 'partial'
}
```

## 4. Activity Patterns API

### Endpoint
```
GET /api/employees/activity-patterns
```

### Response Structure

```typescript
interface ActivityPatternsResponse {
  data: {
    employees: EmployeeActivityPattern[];
    total_employees: number;
    insights: ActivityInsights;
    timezone_info: TimezoneInfo;
  };
}
```

### Employee Activity Pattern Structure

```typescript
interface EmployeeActivityPattern {
  employee_name: string;
  hourly_patterns: { [hour: string]: number };    // Activity by hour
  daily_patterns: { [day: string]: number };     // Activity by day
  zone_preferences: { [zone: string]: number };  // Zone usage
  camera_usage: { [camera: string]: number };    // Camera usage
  peak_hours: string[];                          // Most active hours
  most_active_day: string;                       // Most active day
  activity_consistency: number;                  // Consistency score
  productivity_trends: ProductivityTrend[];       // Productivity analysis
  work_style: string;                            // 'morning', 'evening', 'flexible'
  zone_diversity: number;                        // Number of zones used
  camera_diversity: number;                      // Number of cameras used
}
```

## Common Enums and Types

### Arrival Method Values
```typescript
type ArrivalMethod = 
  | 'face_at_desk'      // Face recognition at assigned desk (highest confidence)
  | 'person_at_desk'    // Person detection at assigned desk (medium confidence)
  | 'face_anywhere'     // Face recognition anywhere (low confidence)
  | 'none';             // No arrival detected
```

### Confidence Levels
```typescript
type ConfidenceLevel = 
  | 'high'              // Face recognition with continuous pattern
  | 'medium'            // Person detection with 5-minute threshold
  | 'low'               // Fallback detection
  | 'none';             // No detection
```

### Attendance Status
```typescript
type AttendanceStatus = 
  | 'present'           // Employee was present
  | 'absent'            // Employee was absent
  | 'partial';          // Employee was partially present
```

## Example API Calls

### Get Work Hours for October 20, 2025
```bash
curl "http://10.0.20.8:5002/v1/api/employees/work-hours?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"
```

### Get Break Time Analysis
```bash
curl "http://10.0.20.8:5002/v1/api/employees/break-time?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"
```

### Get Attendance Summary
```bash
curl "http://10.0.20.8:5002/v1/api/employees/attendance?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"
```

## Frontend Integration Notes

### 1. Date Handling
- All dates are in ISO format with timezone information
- Use `date` field for display (YYYY-MM-DD format)
- Use `arrival_time`/`departure_time` for detailed time display

### 2. Employee Status
- Check `arrival_time` for presence (null = absent)
- Use `arrival_method` and `arrival_confidence` for status indicators
- Use `attendance_status` for quick status display

### 3. Work Hours Display
- `total_work_hours`: Total productive time
- `office_time`: Time at office (work_hours - break_time)
- `total_break_time`: Total break time

### 4. Confidence Indicators
- **High Confidence**: Green indicator (face_at_desk)
- **Medium Confidence**: Yellow indicator (person_at_desk)
- **Low Confidence**: Orange indicator (face_anywhere)
- **No Detection**: Red indicator (none)

### 5. Desk Assignment
- `assigned_desk`: Employee's assigned desk
- `assigned_desk_camera`: Camera that detected arrival
- Use for desk-based filtering and display

## Error Handling

All APIs return standard HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `500`: Internal Server Error

Error response format:
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}
```

## Performance Notes

- All APIs include all employees (present and absent)
- Use `employee_name` parameter to filter specific employees
- Use `camera` parameter to filter by specific camera
- Consider pagination for large date ranges
