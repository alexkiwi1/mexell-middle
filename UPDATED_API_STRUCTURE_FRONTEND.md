# Updated API Structure - Frontend Status Logic

## Overview

The API now provides a clear `status` field that eliminates frontend logic confusion. The frontend should use this status field instead of trying to calculate status from arrival/departure times.

## New Status Field

### Status Values

| Status | Description | Frontend Display | Icon |
|--------|-------------|------------------|------|
| `absent` | No arrival detected | "Absent" | 🔴 |
| `present` | Arrival detected, no departure | "Present" | 🟢 |
| `departed` | Both arrival and departure detected | "Departed" | ✅ |

### Status Logic

```javascript
// Backend logic (already implemented)
if (!employee.arrival_timestamp) {
  employee.status = 'absent';
} else if (!employee.departure_timestamp) {
  employee.status = 'present';
} else {
  employee.status = 'departed';
}
```

## Frontend Implementation

### Correct Frontend Logic

```javascript
// ✅ CORRECT - Use status field
const getEmployeeStatus = (employee) => {
  switch (employee.status) {
    case 'absent':
      return { text: 'Absent', color: 'red', icon: '🔴' };
    case 'present':
      return { text: 'Present', color: 'green', icon: '🟢' };
    case 'departed':
      return { text: 'Departed', color: 'blue', icon: '✅' };
    default:
      return { text: 'Unknown', color: 'gray', icon: '❓' };
  }
};
```

### ❌ WRONG - Don't use this logic

```javascript
// ❌ WRONG - This causes "No arrival" + "Still at office" confusion
if (employee.departure_time === "no arrival") {
  return { text: 'Still at office', color: 'green' };
}
```

## API Response Structure

### Employee Object Fields

```json
{
  "employee_name": "Bhamar Lal",
  "arrival_time": "no arrival",
  "departure_time": "no arrival", 
  "status": "absent",
  "arrival_method": "no_desk_detection",
  "departure_method": "none",
  "total_time": 0,
  "office_time": 0,
  "total_break_time": 0
}
```

### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `employee_name` | string | Employee name | `"Bhamar Lal"` |
| `arrival_time` | string | Arrival timestamp or "no arrival" | `"2025-10-21T09:00:00+05:00"` |
| `departure_time` | string | Departure timestamp or "no arrival" | `"2025-10-21T17:00:00+05:00"` |
| `status` | string | **NEW**: Employee status | `"absent"`, `"present"`, `"departed"` |
| `arrival_method` | string | How arrival was detected | `"face_at_desk"`, `"person_at_desk"` |
| `departure_method` | string | How departure was detected | `"session_end"`, `"person_at_desk"` |
| `total_time` | number | Total work hours (arrival to departure) | `8.5` |
| `office_time` | number | Actual time at desk zone | `7.2` |
| `total_break_time` | number | Break time (total - office) | `1.3` |

## Frontend Component Examples

### React Component

```jsx
const EmployeeCard = ({ employee }) => {
  const getStatusDisplay = () => {
    switch (employee.status) {
      case 'absent':
        return { text: 'Absent', color: 'red', icon: '🔴' };
      case 'present':
        return { text: 'Present', color: 'green', icon: '🟢' };
      case 'departed':
        return { text: 'Departed', color: 'blue', icon: '✅' };
      default:
        return { text: 'Unknown', color: 'gray', icon: '❓' };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="employee-card">
      <h3>{employee.employee_name}</h3>
      <div className={`status ${statusDisplay.color}`}>
        <span>{statusDisplay.icon}</span>
        <span>{statusDisplay.text}</span>
      </div>
      <div className="times">
        <div>Total Time: {employee.total_time}h</div>
        <div>Office Time: {employee.office_time}h</div>
        <div>Break Time: {employee.total_break_time}h</div>
      </div>
    </div>
  );
};
```

### Vue Component

```vue
<template>
  <div class="employee-card">
    <h3>{{ employee.employee_name }}</h3>
    <div :class="['status', statusDisplay.color]">
      <span>{{ statusDisplay.icon }}</span>
      <span>{{ statusDisplay.text }}</span>
    </div>
    <div class="times">
      <div>Total Time: {{ employee.total_time }}h</div>
      <div>Office Time: {{ employee.office_time }}h</div>
      <div>Break Time: {{ employee.total_break_time }}h</div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['employee'],
  computed: {
    statusDisplay() {
      switch (this.employee.status) {
        case 'absent':
          return { text: 'Absent', color: 'red', icon: '🔴' };
        case 'present':
          return { text: 'Present', color: 'green', icon: '🟢' };
        case 'departed':
          return { text: 'Departed', color: 'blue', icon: '✅' };
        default:
          return { text: 'Unknown', color: 'gray', icon: '❓' };
      }
    }
  }
}
</script>
```

## Status Scenarios

### Scenario 1: Employee Never Arrived
```json
{
  "employee_name": "Bhamar Lal",
  "arrival_time": "no arrival",
  "departure_time": "no arrival",
  "status": "absent"
}
```
**Frontend Display**: 🔴 Absent

### Scenario 2: Employee Present (Still at Office)
```json
{
  "employee_name": "John Doe",
  "arrival_time": "2025-10-21T09:00:00+05:00",
  "departure_time": "no arrival",
  "status": "present"
}
```
**Frontend Display**: 🟢 Present

### Scenario 3: Employee Departed
```json
{
  "employee_name": "Jane Smith",
  "arrival_time": "2025-10-21T09:00:00+05:00",
  "departure_time": "2025-10-21T17:00:00+05:00",
  "status": "departed"
}
```
**Frontend Display**: ✅ Departed

## Migration Guide

### Before (Incorrect Logic)
```javascript
// ❌ OLD - Causes confusion
if (employee.arrival_time === "no arrival") {
  return "No arrival";
} else if (employee.departure_time === "no arrival") {
  return "Still at office";
} else {
  return "Departed";
}
```

### After (Correct Logic)
```javascript
// ✅ NEW - Use status field
switch (employee.status) {
  case 'absent': return "Absent";
  case 'present': return "Present";
  case 'departed': return "Departed";
}
```

## Benefits

1. **No More Confusion**: Clear status field eliminates logic errors
2. **Consistent Display**: Same status logic across all components
3. **Future Proof**: Easy to add new statuses (e.g., 'on_break', 'late')
4. **Better UX**: Users see clear, unambiguous status
5. **Maintainable**: Single source of truth for status logic

## API Endpoints

### Get Employee Work Hours
```bash
GET /v1/api/employees/work-hours?start_date=2025-10-21&end_date=2025-10-21&timezone=Asia/Karachi
```

### Response Structure
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_name": "Bhamar Lal",
        "arrival_time": "no arrival",
        "departure_time": "no arrival",
        "status": "absent",
        "arrival_method": "no_desk_detection",
        "departure_method": "none",
        "total_time": 0,
        "office_time": 0,
        "total_break_time": 0
      }
    ],
    "summary": {
      "total_employees": 1,
      "present": 0,
      "absent": 1,
      "departed": 0
    }
  }
}
```

## Testing

### Test Commands
```bash
# Test specific employee
curl -s "http://localhost:5002/v1/api/employees/work-hours?start_date=2025-10-21&end_date=2025-10-21&timezone=Asia/Karachi" | \
jq '.data.employees[] | select(.employee_name == "Bhamar Lal") | {name: .employee_name, status, arrival_time, departure_time}'

# Test all statuses
curl -s "http://localhost:5002/v1/api/employees/work-hours?start_date=2025-10-21&end_date=2025-10-21&timezone=Asia/Karachi" | \
jq '.data.employees[] | {name: .employee_name, status}' | head -10
```

### Expected Results
- ✅ No more "No arrival" + "Still at office" confusion
- ✅ Clear status indicators
- ✅ Consistent API responses
- ✅ Better user experience

