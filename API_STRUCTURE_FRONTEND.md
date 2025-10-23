# 🚀 Frigate Middleware API Structure for Frontend Dashboard

## **Base URL**
```
http://10.0.20.8:5002/v1
```

## **Authentication**
All API requests require the API key in the header:
```http
X-API-Key: frigate-api-key-2024
```

---

## **📊 Dashboard APIs**

### **1. Employee Work Hours**
```http
GET /api/employees/work-hours
```

**Parameters:**
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string): End date in YYYY-MM-DD format  
- `timezone` (string): Timezone (PKT, EST, UTC, etc.)
- `employee_name` (string, optional): Filter by specific employee
- `camera` (string, optional): Filter by camera
- `hours` (number, optional): Hours to look back from now

**Example:**
```bash
curl -H "X-API-Key: frigate-api-key-2024" \
"http://10.0.20.8:5002/v1/api/employees/work-hours?start_date=2025-10-20&end_date=2025-10-20&timezone=PKT"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_name": "Arbaz",
        "total_work_hours": 7.71,
        "arrival_time": "2025-10-20T09:50:31+05:00",
        "departure_time": "2025-10-20T22:01:26+05:00",
        "total_activity": 506,
        "productivity_score": 98,
        "attendance_status": "half_day",
        "work_efficiency": 79,
        "cameras": ["employees_05", "employees_06"],
        "zones": ["desk_42", "desk_38", "desk_43"],
        "sessions": [
          {
            "first_seen": "2025-10-20T09:50:31+05:00",
            "last_seen": "2025-10-20T10:01:26+05:00",
            "duration_hours": 0.18,
            "cameras": ["employees_05"],
            "zones": ["desk_42", "desk_38"]
          }
        ]
      }
    ],
    "total_employees": 56,
    "total_work_hours": 202.38,
    "average_work_hours": 3.61,
    "period": {
      "start": "2025-10-20T00:00:00+05:00",
      "end": "2025-10-20T23:59:59+05:00",
      "duration_hours": 24
    },
    "timezone_info": {
      "timezone": "Asia/Karachi",
      "offset": "+05:00",
      "abbreviation": "PKT"
    }
  }
}
```

---

### **2. Employee Break Time**
```http
GET /api/employees/break-time
```

**Parameters:** Same as work hours

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_name": "Arbaz",
        "work_hours": 7.71,
        "total_break_time": 4.47,
        "arrival_time": "2025-10-20T09:50:31+05:00",
        "departure_time": "2025-10-20T22:01:26+05:00",
        "total_breaks": 15,
        "average_break_duration": 0.30,
        "longest_break": 0.45,
        "shortest_break": 0.12,
        "break_frequency": 1.95,
        "break_efficiency": 80.5,
        "break_sessions": [
          {
            "break_start": "2025-10-20T10:15:30+05:00",
            "break_end": "2025-10-20T10:30:45+05:00",
            "duration_hours": 0.25,
            "previous_session": {
              "camera": "employees_05",
              "ended_at": "2025-10-20T10:15:30+05:00"
            },
            "next_session": {
              "camera": "employees_05", 
              "started_at": "2025-10-20T10:30:45+05:00"
            }
          }
        ]
      }
    ],
    "total_employees": 45,
    "total_break_time": 89.23,
    "average_break_time": 1.98,
    "timezone_info": {
      "timezone": "Asia/Karachi",
      "offset": "+05:00",
      "abbreviation": "PKT"
    }
  }
}
```

---

### **3. Employee Attendance**
```http
GET /api/employees/attendance
```

**Parameters:** Same as work hours

**Response:**
```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "employee_name": "Arbaz",
        "attendance_status": "half_day",
        "work_hours": 7.71,
        "arrival_time": "2025-10-20T09:50:31+05:00",
        "departure_time": "2025-10-20T22:01:26+05:00",
        "total_activity": 506,
        "productivity_score": 98,
        "cameras_used": ["employees_05", "employees_06"],
        "zones_visited": ["desk_42", "desk_38", "desk_43"],
        "attendance_notes": "Consistent high performance"
      }
    ],
    "summary": {
      "total_employees": 56,
      "present": 45,
      "absent": 11,
      "half_day": 12,
      "partial_day": 33,
      "attendance_rate": 80.36
    }
  }
}
```

---

### **4. Employee Activity Patterns**
```http
GET /api/employees/activity-patterns
```

**Parameters:** Same as work hours

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "employee_name": "Arbaz",
      "activity_patterns": {
        "peak_hours": [
          {"hour": 9, "activity_count": 45},
          {"hour": 14, "activity_count": 38},
          {"hour": 16, "activity_count": 42}
        ],
        "most_active_camera": "employees_05",
        "most_visited_zone": "desk_42",
        "activity_frequency": "high",
        "movement_pattern": "consistent",
        "productivity_trends": "increasing"
      },
      "work_efficiency": 79,
      "productivity_score": 98
    }
  ]
}
```

---

## **📹 Camera APIs**

### **5. Camera Summary**
```http
GET /api/cameras/summary
```

**Parameters:**
- `start_date`, `end_date`, `timezone` (same as above)
- `camera` (string, optional): Specific camera ID

**Response:**
```json
{
  "success": true,
  "data": {
    "summaries": [
      {
        "camera": "employees_01",
        "total_events": 1250,
        "active_employees": 12,
        "violations": 5,
        "last_activity": "2025-10-20T21:45:30+05:00",
        "status": "active",
        "zones": ["desk_01", "desk_02", "desk_03"],
        "activity_trend": "stable"
      }
    ],
    "total_cameras": 12,
    "active_cameras": 11,
    "offline_cameras": 1
  }
}
```

---

### **6. Camera Activity**
```http
GET /api/cameras/activity
```

**Parameters:** Same as camera summary

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "timestamp": "2025-10-20T21:45:30+05:00",
        "camera": "employees_01",
        "event_type": "person_detection",
        "employee_name": "Arbaz",
        "zone": "desk_42",
        "confidence": 0.95,
        "description": "Employee detected at desk"
      }
    ],
    "total_activities": 1250,
    "time_range": {
      "start": "2025-10-20T00:00:00+05:00",
      "end": "2025-10-20T23:59:59+05:00"
    }
  }
}
```

---

## **🚨 Violations APIs**

### **7. Cell Phone Violations**
```http
GET /api/violations/cell-phones
```

**Parameters:**
- `start_date`, `end_date`, `timezone` (same as above)
- `employee_name` (string, optional)
- `camera` (string, optional)
- `severity` (string, optional): "high", "medium", "low"
- `limit` (number, optional): Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "violations": [
      {
        "id": "violation_123",
        "timestamp": "2025-10-20T14:30:15+05:00",
        "camera": "employees_01",
        "employee_name": "Arbaz",
        "assigned_employee": "Arbaz",
        "confidence": "high",
        "zones": ["desk_42"],
        "media_urls": {
          "snapshot": "http://10.0.20.8:5002/media/snapshots/employees_01/2025-10-20/14:30:15.jpg",
          "thumbnail": "http://10.0.20.8:5002/media/thumbnails/employees_01/2025-10-20/14:30:15.jpg",
          "video": "http://10.0.20.8:5002/media/recordings/2025-10-20/14/employees_01/30.15.mp4"
        },
        "assignment_confidence": "high",
        "assignment_method": "face_recognition"
      }
    ],
    "total_violations": 25,
    "summary": {
      "by_employee": {
        "Arbaz": 5,
        "Ali Habib": 3
      },
      "by_camera": {
        "employees_01": 8,
        "employees_02": 6
      },
      "by_severity": {
        "high": 15,
        "medium": 7,
        "low": 3
      }
    }
  }
}
```

---

## **📈 Analytics APIs**

### **8. Dashboard Data**
```http
GET /api/analytics/dashboard
```

**Parameters:**
- `start_date`, `end_date`, `timezone` (same as above)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_employees": 56,
      "active_employees": 45,
      "total_violations": 25,
      "total_work_hours": 202.38,
      "average_productivity": 68.5
    },
    "trends": {
      "violations_trend": "decreasing",
      "productivity_trend": "increasing",
      "attendance_trend": "stable"
    },
    "top_performers": [
      {
        "employee_name": "Arbaz",
        "productivity_score": 98,
        "work_hours": 7.71,
        "violations": 0
      }
    ],
    "alerts": [
      {
        "type": "high_violations",
        "message": "Arbaz has 5 violations today",
        "severity": "medium",
        "timestamp": "2025-10-20T14:30:15+05:00"
      }
    ]
  }
}
```

---

### **9. Trend Analysis**
```http
GET /api/analytics/trends
```

**Parameters:**
- `start_date`, `end_date`, `timezone` (same as above)
- `metric` (string, optional): "productivity", "violations", "attendance"

**Response:**
```json
{
  "success": true,
  "data": {
    "productivity_trends": {
      "daily": [
        {"date": "2025-10-20", "average": 68.5, "employees": 45},
        {"date": "2025-10-19", "average": 65.2, "employees": 42}
      ],
      "hourly": [
        {"hour": 9, "average": 75.2},
        {"hour": 14, "average": 82.1}
      ]
    },
    "violation_trends": {
      "daily": [
        {"date": "2025-10-20", "count": 25, "severity_breakdown": {"high": 15, "medium": 7, "low": 3}}
      ]
    }
  }
}
```

---

## **🌐 Timezone APIs**

### **10. Available Timezones**
```http
GET /api/timezone/list
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timezones": [
      {
        "abbreviation": "PKT",
        "iana": "Asia/Karachi",
        "name": "Asia/Karachi",
        "offset": "+05:00",
        "currentTime": "2025-10-21 03:10:00"
      },
      {
        "abbreviation": "EST",
        "iana": "America/New_York", 
        "name": "America/New York",
        "offset": "-04:00",
        "currentTime": "2025-10-20 18:10:00"
      }
    ],
    "count": 15
  }
}
```

---

### **11. Timezone Info**
```http
GET /api/timezone/info/{timezone}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timezone": "Asia/Karachi",
    "offset": "+05:00",
    "offsetMinutes": 300,
    "isDST": false,
    "currentTime": "2025-10-21 03:10:00",
    "abbreviation": "PKT"
  }
}
```

---

## **📱 Mobile APIs**

### **12. Mobile Dashboard**
```http
GET /api/mobile/dashboard
```

**Parameters:**
- `hours` (number, optional): Hours to look back (default: 1)
- `timezone` (string, optional): Timezone (default: UTC)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "violations": 5,
      "active_employees": 12,
      "active_cameras": 8
    },
    "recent_activity": [
      {
        "timestamp": "2025-10-20T21:45:30+05:00",
        "camera": "employees_01",
        "label": "person",
        "employee_name": "Arbaz",
        "zones": ["desk_42"]
      }
    ]
  }
}
```

---

## **🔧 Utility APIs**

### **13. Health Check**
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "timestamp": "2025-10-20T21:45:30+05:00",
  "version": "1.0.0"
}
```

---

### **14. Camera List**
```http
GET /api/cameras
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cameras": [
      {
        "id": "employees_01",
        "name": "Employees Area 1",
        "status": "active",
        "ip": "172.16.5.242",
        "fps": 8,
        "resolution": [3840, 2160],
        "zones": ["desk_01", "desk_02", "desk_03"]
      }
    ],
    "total_cameras": 12
  }
}
```

---

## **📊 Frontend Dashboard Structure**

### **Main Dashboard Components:**

1. **Header**
   - Date range picker
   - Timezone selector
   - Refresh button

2. **Overview Cards**
   - Total employees
   - Active employees
   - Total violations
   - Average productivity

3. **Employee Table**
   - Name, work hours, arrival/departure
   - Productivity score, violations
   - Status indicators

4. **Charts & Graphs**
   - Productivity trends
   - Violation trends
   - Attendance patterns
   - Camera activity

5. **Real-time Updates**
   - WebSocket connection for live data
   - Auto-refresh every 30 seconds

### **Sample Frontend Code Structure:**

```javascript
// API Configuration
const API_BASE = 'http://10.0.20.8:5002/v1';
const API_KEY = 'frigate-api-key-2024';

// Headers
const headers = {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json'
};

// Example API calls
async function getEmployeeData(startDate, endDate, timezone = 'PKT') {
  const response = await fetch(
    `${API_BASE}/api/employees/work-hours?start_date=${startDate}&end_date=${endDate}&timezone=${timezone}`,
    { headers }
  );
  return await response.json();
}

async function getViolations(startDate, endDate, timezone = 'PKT') {
  const response = await fetch(
    `${API_BASE}/api/violations/cell-phones?start_date=${startDate}&end_date=${endDate}&timezone=${timezone}`,
    { headers }
  );
  return await response.json();
}

async function getDashboardData(startDate, endDate, timezone = 'PKT') {
  const response = await fetch(
    `${API_BASE}/api/analytics/dashboard?start_date=${startDate}&end_date=${endDate}&timezone=${timezone}`,
    { headers }
  );
  return await response.json();
}
```

---

## **🎯 Key Features for Frontend:**

1. **Date Range Selection** - Flexible date filtering
2. **Timezone Support** - Display times in local timezone
3. **Real-time Updates** - Live data refresh
4. **Responsive Design** - Mobile-friendly interface
5. **Export Functionality** - Download reports
6. **Search & Filter** - Find specific employees/events
7. **Charts & Visualizations** - Trend analysis
8. **Media Integration** - View snapshots/videos
9. **Alerts & Notifications** - Real-time alerts
10. **Performance Metrics** - System health monitoring

This API structure provides everything you need to build a comprehensive employee monitoring dashboard! 🚀

