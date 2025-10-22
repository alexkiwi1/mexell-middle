# Frontend Quick Reference Guide

## Date: October 21, 2025

## API Endpoints

| Endpoint | Purpose | Key Fields |
|----------|---------|------------|
| `/api/employees/work-hours` | Work hours and attendance | `arrival_time`, `departure_time`, `total_work_hours` |
| `/api/employees/break-time` | Break analysis | `total_break_time`, `break_sessions` |
| `/api/employees/attendance` | Attendance summary | `attendance_rate`, `attendance_records` |
| `/api/employees/activity-patterns` | Activity analysis | `hourly_patterns`, `daily_patterns` |

## Employee Status Detection

```typescript
// Check if employee was present
const isPresent = employee.arrival_time !== null;

// Get arrival confidence
const confidence = employee.arrival_confidence; // 'high', 'medium', 'low', 'none'

// Get arrival method
const method = employee.arrival_method; // 'face_at_desk', 'person_at_desk', 'face_anywhere', 'none'
```

## Key Fields for Display

### Basic Information
- `employee_name`: Employee name
- `date`: Date in YYYY-MM-DD format
- `arrival_time`: Arrival time (ISO with timezone)
- `departure_time`: Departure time (ISO with timezone)

### Work Hours
- `total_work_hours`: Total productive time
- `office_time`: Time at office (work - breaks)
- `total_break_time`: Total break time

### Status Indicators
- `arrival_method`: How arrival was detected
- `arrival_confidence`: Confidence level
- `attendance_status`: 'present', 'absent', 'partial'

### Desk Information
- `assigned_desk`: Employee's assigned desk
- `assigned_desk_camera`: Camera that detected arrival

## Status Color Coding

| Status | Color | Description |
|--------|-------|-------------|
| `arrival_confidence: 'high'` | Green | Face recognition at assigned desk |
| `arrival_confidence: 'medium'` | Yellow | Person detection at assigned desk |
| `arrival_confidence: 'low'` | Orange | Face recognition anywhere |
| `arrival_confidence: 'none'` | Red | No detection (absent) |

## Sample API Calls

```bash
# Get work hours for specific date
curl "http://10.100.6.2:5002/v1/api/employees/work-hours?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"

# Get break time analysis
curl "http://10.100.6.2:5002/v1/api/employees/break-time?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"

# Get attendance summary
curl "http://10.100.6.2:5002/v1/api/employees/attendance?start_date=2025-10-20&end_date=2025-10-20&timezone=Asia/Karachi"
```

## Response Structure

```typescript
interface APIResponse {
  data: {
    employees: Employee[];
    total_employees: number;
    // ... other fields
  };
}
```

## Employee Object (Key Fields)

```typescript
interface Employee {
  employee_name: string;
  date: string;                    // YYYY-MM-DD
  arrival_time: string | null;     // ISO datetime
  departure_time: string | null;   // ISO datetime
  total_work_hours: number;
  arrival_method: string;          // Detection method
  arrival_confidence: string;      // Confidence level
  assigned_desk: string | null;    // Desk ID
  assigned_desk_camera: string | null; // Camera name
  attendance_status: string;       // 'present', 'absent', 'partial'
}
```

## Frontend Implementation Tips

1. **Date Display**: Use `date` field for date display
2. **Time Display**: Use `arrival_time`/`departure_time` for time display
3. **Status Check**: Check `arrival_time !== null` for presence
4. **Confidence Display**: Use `arrival_confidence` for status indicators
5. **Desk Filtering**: Use `assigned_desk` for desk-based filtering
6. **Camera Filtering**: Use `assigned_desk_camera` for camera-based filtering

## Common Patterns

```typescript
// Filter present employees
const presentEmployees = employees.filter(emp => emp.arrival_time !== null);

// Filter by confidence level
const highConfidenceEmployees = employees.filter(emp => emp.arrival_confidence === 'high');

// Filter by desk
const deskEmployees = employees.filter(emp => emp.assigned_desk === 'desk_02');

// Sort by arrival time
const sortedEmployees = employees.sort((a, b) => 
  new Date(a.arrival_time || 0) - new Date(b.arrival_time || 0)
);
```
