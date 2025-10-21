# Employee Tracking API Documentation

## Overview

The Employee Tracking API provides comprehensive employee monitoring capabilities including arrival times, break tracking, work hours, and productivity metrics. All endpoints support timezone-aware date filtering.

## Server Information

**Server Details:**
- **Primary IP:** `10.100.6.2`
- **Public IP:** `222.155.243.10`
- **Port:** `5002` (Docker container)
- **Base URL:** `http://10.100.6.2:5002`

**Container Status:**
- ✅ **Node.js App:** Running (mexell-middle-node-app-1)
- ✅ **MongoDB:** Running (mexell-middle-mongodb-1)
- ✅ **Redis:** Connected and working (mexell-middle-redis-1)
- ✅ **API Routes:** Working on `/v1/api/` endpoints

## Base Configuration

```javascript
const API_BASE = "http://10.100.6.2:5002/v1/api";
const DEFAULT_TIMEZONE = "Asia/Karachi"; // PKT timezone
```

## Core Endpoints

### Employee Management

#### 1. Employee Work Hours
**Endpoint:** `GET /api/employees/work-hours`

#### 2. Employee Break Time Analysis  
**Endpoint:** `GET /api/employees/break-time`

#### 3. Employee Attendance
**Endpoint:** `GET /api/employees/attendance`

#### 4. Employee Activity Patterns
**Endpoint:** `GET /api/employees/activity-patterns`

### Zone Management

#### 5. Desk Occupancy Analysis
**Endpoint:** `GET /api/zones/desk-occupancy`

#### 6. Zone Utilization Analysis
**Endpoint:** `GET /api/zones/utilization`

#### 7. Employee Zone Preferences
**Endpoint:** `GET /api/zones/employee-preferences`

#### 8. Zone Activity Patterns
**Endpoint:** `GET /api/zones/activity-patterns`

### Analytics & Reporting

#### 9. Comprehensive Dashboard
**Endpoint:** `GET /api/analytics/dashboard`

#### 10. Trend Analysis
**Endpoint:** `GET /api/analytics/trends`

#### 11. Performance Metrics
**Endpoint:** `GET /api/analytics/performance`

#### 12. Predictive Analytics
**Endpoint:** `GET /api/analytics/predictive`

#### 13. Custom Reports
**Endpoint:** `GET /api/analytics/reports`

## Detailed Endpoint Documentation

### 1. Employee Work Hours

**Endpoint:** `GET /api/employees/work-hours`

**Description:** Get comprehensive work hours data for employees including arrival, departure, and total hours worked.

**Query Parameters:**
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string): End date in YYYY-MM-DD format  
- `hours` (number): Hours to look back (alternative to date range)
- `employee_name` (string): Filter by specific employee
- `camera` (string): Filter by camera location
- `timezone` (string): Timezone for date conversion (default: UTC)

**Example Request:**
```bash
GET http://10.100.6.2:5002/v1/api/employees/work-hours?start_date=2024-10-20&end_date=2024-10-20&timezone=Asia/Karachi&employee_name=John%20Doe
```

**Response:**
```json
{
  "success": true,
  "message": "Employee work hours retrieved successfully",
  "data": {
    "employees": [
      {
        "employee_name": "John Doe",
        "total_work_hours": 8.5,
        "total_activity": 45,
        "cameras": ["employees_01", "employees_02"],
        "zones": ["desk_05", "desk_12"],
        "sessions": [
          {
            "session_id": "sess_001",
            "first_seen": "2024-10-20T09:00:00+05:00",
            "last_seen": "2024-10-20T17:30:00+05:00",
            "duration_hours": 8.5,
            "camera": "employees_01",
            "zones": ["desk_05"]
          }
        ],
        "first_seen": "2024-10-20T09:00:00+05:00",
        "last_seen": "2024-10-20T17:30:00+05:00",
        "arrival_time": "2024-10-20T09:00:00+05:00",
        "departure_time": "2024-10-20T17:30:00+05:00"
      }
    ],
    "summary": {
      "total_employees": 1,
      "total_work_hours": 8.5,
      "average_work_hours": 8.5
    },
    "timezone_info": {
      "timezone": "Asia/Karachi",
      "offset": "+05:00",
      "current_time": "2024-10-20 15:30:00"
    }
  },
  "timestamp": "2024-10-20T10:30:00.000Z"
}
```

### 2. Employee Break Time Analysis

**Endpoint:** `GET /api/employees/break-time`

**Description:** Get detailed break time analysis for employees including break duration, frequency, and patterns.

**Query Parameters:** Same as work hours endpoint

**Example Request:**
```bash
GET http://10.100.6.2:5002/v1/api/employees/break-time?start_date=2024-10-20&end_date=2024-10-20&timezone=Asia/Karachi
```

**Response:**
```json
{
  "success": true,
  "data": {
    "break_sessions": [
      {
        "employee_name": "John Doe",
        "break_start": "2024-10-20T12:00:00+05:00",
        "break_end": "2024-10-20T13:00:00+05:00",
        "duration_minutes": 60,
        "break_type": "lunch",
        "camera": "employees_01",
        "zone": "break_room"
      }
    ],
    "summary": {
      "total_break_time": 60,
      "average_break_duration": 30,
      "break_frequency": 2
    }
  }
}
```

### 3. Employee Attendance

**Endpoint:** `GET /api/employees/attendance`

**Description:** Get attendance summary including who arrived, when, and attendance patterns.

**Query Parameters:** Same as work hours endpoint

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance_records": [
      {
        "employee_name": "John Doe",
        "arrival_time": "2024-10-20T09:00:00+05:00",
        "departure_time": "2024-10-20T17:30:00+05:00",
        "status": "present",
        "work_duration_hours": 8.5,
        "camera": "employees_01",
        "first_zone": "desk_05"
      }
    ],
    "summary": {
      "total_employees": 15,
      "present_count": 12,
      "absent_count": 3,
      "attendance_rate": 80.0
    }
  }
}
```

### 4. Desk Occupancy Analysis

**Endpoint:** `GET /api/zones/desk-occupancy`

**Description:** Get desk occupancy data showing which desks are occupied and by whom.

**Query Parameters:**
- `start_date`, `end_date`, `hours`, `timezone` (same as above)
- `camera` (string): Filter by camera
- `zone` (string): Filter by specific desk zone

**Response:**
```json
{
  "success": true,
  "data": {
    "desk_occupancy": [
      {
        "desk_number": 5,
        "zone": "desk_05",
        "camera": "employees_01",
        "is_occupied": true,
        "employee_name": "John Doe",
        "occupancy_start": "2024-10-20T09:00:00+05:00",
        "occupancy_duration_hours": 8.5,
        "confidence_score": 0.95
      }
    ],
    "summary": {
      "total_desks": 64,
      "occupied_desks": 12,
      "occupancy_rate": 18.75
    }
  }
}
```

## Frontend Integration Instructions

### 1. Setup and Configuration

```javascript
// config/api.js
const API_CONFIG = {
  baseURL: 'http://10.100.6.2:5002/v1/api',
  defaultTimezone: 'Asia/Karachi', // PKT timezone
  timeout: 30000
};

// utils/timezone.js
export const getTimezoneOffset = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatDateForAPI = (date, timezone = API_CONFIG.defaultTimezone) => {
  return moment(date).tz(timezone).format('YYYY-MM-DD');
};
```

### 2. Employee Dashboard Component

```jsx
// components/EmployeeDashboard.jsx
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getEmployeeWorkHours, getEmployeeBreakTime } from '../services/employeeService';

const EmployeeDashboard = () => {
  const [workHours, setWorkHours] = useState(null);
  const [breakTime, setBreakTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timezone] = useState('Asia/Karachi');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      try {
        const [workData, breakData] = await Promise.all([
          getEmployeeWorkHours({
            start_date: dateStr,
            end_date: dateStr,
            timezone
          }),
          getEmployeeBreakTime({
            start_date: dateStr,
            end_date: dateStr,
            timezone
          })
        ]);
        
        setWorkHours(workData);
        setBreakTime(breakData);
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }
    };

    fetchEmployeeData();
  }, [selectedDate, timezone]);

  return (
    <div className="employee-dashboard">
      <h2>Employee Tracking - {format(selectedDate, 'MMM dd, yyyy')}</h2>
      
      {/* Work Hours Table */}
      <div className="work-hours-section">
        <h3>Work Hours</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Arrival Time</th>
              <th>Departure Time</th>
              <th>Total Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {workHours?.employees?.map(employee => (
              <tr key={employee.employee_name}>
                <td>{employee.employee_name}</td>
                <td>{format(new Date(employee.arrival_time), 'HH:mm')}</td>
                <td>{format(new Date(employee.departure_time), 'HH:mm')}</td>
                <td>{employee.total_work_hours.toFixed(1)}h</td>
                <td>
                  <span className={`status ${employee.total_work_hours >= 8 ? 'present' : 'partial'}`}>
                    {employee.total_work_hours >= 8 ? 'Present' : 'Partial'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Break Time Section */}
      <div className="break-time-section">
        <h3>Break Time Analysis</h3>
        {breakTime?.break_sessions?.map(session => (
          <div key={session.break_start} className="break-session">
            <strong>{session.employee_name}</strong>
            <span>{format(new Date(session.break_start), 'HH:mm')} - {format(new Date(session.break_end), 'HH:mm')}</span>
            <span>{session.duration_minutes} minutes</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
```

### 3. API Service Functions

```javascript
// services/employeeService.js
import axios from 'axios';

const API_BASE = 'http://10.100.6.2:5002/v1/api';

export const getEmployeeWorkHours = async (params) => {
  const response = await axios.get(`${API_BASE}/employees/work-hours`, {
    params: {
      timezone: 'Asia/Karachi',
      ...params
    }
  });
  return response.data.data;
};

export const getEmployeeBreakTime = async (params) => {
  const response = await axios.get(`${API_BASE}/employees/break-time`, {
    params: {
      timezone: 'Asia/Karachi',
      ...params
    }
  });
  return response.data.data;
};

export const getEmployeeAttendance = async (params) => {
  const response = await axios.get(`${API_BASE}/employees/attendance`, {
    params: {
      timezone: 'Asia/Karachi',
      ...params
    }
  });
  return response.data.data;
};

export const getDeskOccupancy = async (params) => {
  const response = await axios.get(`${API_BASE}/zones/desk-occupancy`, {
    params: {
      timezone: 'Asia/Karachi',
      ...params
    }
  });
  return response.data.data;
};
```

### 4. Real-time Updates with WebSocket

```javascript
// hooks/useEmployeeTracking.js
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const useEmployeeTracking = () => {
  const [socket, setSocket] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const newSocket = io('http://10.0.20.6:5001');
    setSocket(newSocket);

    newSocket.on('employee_update', (data) => {
      setEmployees(prev => {
        const updated = [...prev];
        const index = updated.findIndex(emp => emp.employee_name === data.employee_name);
        if (index >= 0) {
          updated[index] = { ...updated[index], ...data };
        } else {
          updated.push(data);
        }
        return updated;
      });
    });

    return () => newSocket.close();
  }, []);

  return { employees, socket };
};
```

### 5. Date Range Picker Component

```jsx
// components/DateRangePicker.jsx
import React from 'react';
import { DatePicker } from 'antd';
import moment from 'moment-timezone';

const DateRangePicker = ({ value, onChange, timezone = 'Asia/Karachi' }) => {
  const handleChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      onChange({
        start_date: start.tz(timezone).format('YYYY-MM-DD'),
        end_date: end.tz(timezone).format('YYYY-MM-DD'),
        timezone
      });
    }
  };

  return (
    <DatePicker.RangePicker
      value={value}
      onChange={handleChange}
      format="YYYY-MM-DD"
      placeholder={['Start Date', 'End Date']}
    />
  );
};

export default DateRangePicker;
```

## Timezone Handling Best Practices

### 1. Always Specify Timezone

```javascript
// ✅ Good - Always specify timezone
const params = {
  start_date: '2024-10-20',
  end_date: '2024-10-20',
  timezone: 'Asia/Karachi'
};

// ❌ Bad - Will default to UTC
const params = {
  start_date: '2024-10-20',
  end_date: '2024-10-20'
};
```

### 2. Handle Timezone Conversion

```javascript
// Convert user's local time to API timezone
const convertToAPITimezone = (date, userTimezone, apiTimezone = 'Asia/Karachi') => {
  return moment.tz(date, userTimezone).tz(apiTimezone).format('YYYY-MM-DD');
};

// Example usage
const apiDate = convertToAPITimezone(new Date(), 'America/New_York', 'Asia/Karachi');
```

### 3. Display Times in User's Timezone

```javascript
// Convert API response times to user's timezone for display
const formatTimeForDisplay = (apiTime, userTimezone) => {
  return moment.tz(apiTime, 'Asia/Karachi').tz(userTimezone).format('HH:mm:ss');
};
```

## Error Handling

```javascript
// services/errorHandler.js
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return `Invalid request: ${data.message}`;
      case 404:
        return 'Employee data not found';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `API Error: ${data.message || 'Unknown error'}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return 'An unexpected error occurred.';
  }
};
```

## Testing Examples

### 1. Test Health Endpoint

```bash
# Test health endpoint
curl -X GET "http://10.100.6.2:5002/v1/health"
```

### 2. Test Employee Work Hours

```bash
# Test with PKT timezone
curl -X GET "http://10.100.6.2:5002/v1/api/employees/work-hours?start_date=2024-10-20&end_date=2024-10-20&timezone=Asia/Karachi"

# Test with UTC timezone
curl -X GET "http://10.100.6.2:5002/v1/api/employees/work-hours?start_date=2024-10-20&end_date=2024-10-20&timezone=UTC"
```

### 3. Test Break Time Analysis

```bash
curl -X GET "http://10.100.6.2:5002/v1/api/employees/break-time?start_date=2024-10-20&end_date=2024-10-20&timezone=Asia/Karachi&employee_name=John%20Doe"
```

## Performance Considerations

1. **Use date ranges efficiently** - Don't query more data than needed
2. **Cache frequently accessed data** - Employee lists, desk configurations
3. **Implement pagination** - For large employee datasets
4. **Use WebSocket for real-time updates** - Instead of polling
5. **Optimize timezone conversions** - Cache timezone calculations

## Security Notes

1. **Validate timezone parameters** - Prevent timezone injection attacks
2. **Sanitize employee names** - Prevent SQL injection
3. **Rate limit API calls** - Prevent abuse
4. **Use HTTPS in production** - Encrypt API communications
5. **Implement proper authentication** - Secure employee data access

This API provides comprehensive employee tracking capabilities with proper timezone support for accurate time-based filtering and reporting.
