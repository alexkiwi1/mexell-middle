# Date/Time Parameters - Quick Reference

## 🎯 **Available Parameters**

| Parameter | Type | Format | Description | Example |
|-----------|------|--------|-------------|---------|
| `start_date` | string | ISO or YYYY-MM-DD | Start of date range | `2025-10-01` or `2025-10-01T08:00:00.000Z` |
| `end_date` | string | ISO or YYYY-MM-DD | End of date range | `2025-10-01` or `2025-10-01T17:00:00.000Z` |
| `hours` | number | integer | Hours to look back (fallback) | `24` |
| `limit` | number | integer | Maximum results | `10` |

## 🚀 **Quick Examples**

### **Specific Date (Full Day)**
```bash
# Get all activity for October 1st, 2025
curl "http://10.100.6.2:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01"

# Get violations for specific camera on specific date
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01&end_date=2025-10-01&limit=5"
```

### **Time Range (Specific Hours)**
```bash
# Work hours analysis (8 AM - 5 PM)
curl "http://10.100.6.2:5002/v1/api/cameras/summary?start_date=2025-10-01T08:00:00.000Z&end_date=2025-10-01T17:00:00.000Z"

# Morning violations (10 AM - 12 PM)
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=3"

# Afternoon activity (2 PM - 4 PM)
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/activity?start_date=2025-10-01T14:00:00.000Z&end_date=2025-10-01T16:00:00.000Z&limit=5"
```

### **Backward Compatibility**
```bash
# Still works with hours parameter
curl "http://10.100.6.2:5002/v1/api/cameras/summary?hours=24"
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/violations?hours=12&limit=10"
```

## 📊 **Affected Endpoints**

| Endpoint | Date/Time Support | Parameters |
|----------|------------------|------------|
| `GET /v1/api/cameras/summary` | ✅ | `start_date`, `end_date`, `hours` |
| `GET /v1/api/cameras/{camera}/summary` | ✅ | `start_date`, `end_date`, `hours` |
| `GET /v1/api/cameras/{camera}/activity` | ✅ | `start_date`, `end_date`, `hours`, `limit` |
| `GET /v1/api/cameras/{camera}/violations` | ✅ | `start_date`, `end_date`, `hours`, `limit` |
| `GET /v1/api/cameras/{camera}/status` | ✅ | `start_date`, `end_date`, `hours` |

## 🔧 **Date Format Examples**

### **YYYY-MM-DD Format**
- `2025-10-01` → 2025-10-01 00:00:00 UTC to 2025-10-01 23:59:59 UTC
- `2025-12-25` → 2025-12-25 00:00:00 UTC to 2025-12-25 23:59:59 UTC

### **ISO 8601 Format**
- `2025-10-01T08:00:00.000Z` → 2025-10-01 08:00:00 UTC
- `2025-10-01T17:00:00.000Z` → 2025-10-01 17:00:00 UTC
- `2025-10-01T10:30:00.000Z` → 2025-10-01 10:30:00 UTC

## ⚡ **Common Use Cases**

### **Daily Reports**
```bash
# Get yesterday's summary
curl "http://10.100.6.2:5002/v1/api/cameras/summary?start_date=2025-10-01&end_date=2025-10-01"
```

### **Shift Analysis**
```bash
# Morning shift (6 AM - 2 PM)
curl "http://10.100.6.2:5002/v1/api/cameras/summary?start_date=2025-10-01T06:00:00.000Z&end_date=2025-10-01T14:00:00.000Z"

# Evening shift (2 PM - 10 PM)
curl "http://10.100.6.2:5002/v1/api/cameras/summary?start_date=2025-10-01T14:00:00.000Z&end_date=2025-10-01T22:00:00.000Z"
```

### **Violation Investigation**
```bash
# Check specific time period for violations
curl "http://10.100.6.2:5002/v1/api/cameras/employees_01/violations?start_date=2025-10-01T10:00:00.000Z&end_date=2025-10-01T12:00:00.000Z&limit=10"
```

### **Multi-Camera Analysis**
```bash
# Compare all cameras for specific date
for camera in employees_01 employees_02 employees_03; do
  echo "=== $camera ==="
  curl -s "http://10.100.6.2:5002/v1/api/cameras/$camera/violations?start_date=2025-10-01&end_date=2025-10-01&limit=3"
done
```

## 🎯 **Response Format**

All endpoints return the applied filters in the response:

```json
{
  "success": true,
  "data": {
    "filters": {
      "start_date": "2025-10-01",
      "end_date": "2025-10-01",
      "limit": 10
    }
  }
}
```

## ⚠️ **Notes**

- **Timezone**: All dates are treated as UTC
- **Performance**: Large date ranges may impact performance
- **Fallback**: If no date parameters provided, defaults to 24 hours
- **Validation**: Invalid dates will return error responses
- **Limits**: Use `limit` parameter for large datasets
