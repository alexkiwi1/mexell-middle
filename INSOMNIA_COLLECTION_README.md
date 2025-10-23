# Frigate Middleware API - Insomnia Collection

## 🚀 Complete API Testing Collection

This Insomnia collection provides comprehensive testing for the Frigate Middleware API with **54+ endpoints** across 8 different categories.

## 📋 Collection Overview

### **Environment Variables**
- `base_url`: `http://10.0.20.8:5002`
- `employee_name`: `Muhammad Arsalan` (example employee)
- `camera_name`: `employees_01` (example camera)
- `start_date`: `2025-10-20` (example start date)
- `end_date`: `2025-10-20` (example end date)
- `hours`: `24` (example time window)

## 📁 API Categories

### 1. **Health & Status** (2 endpoints)
- **Health Check** - System health and database connectivity
- **System Status** - Overall system status and metrics

### 2. **Camera Management** (8 endpoints)
- **Get Camera List** - List all available cameras
- **Get Camera Summary** - Summary of all cameras with activity data
- **Get Camera Activity** - Recent activity for all cameras
- **Get Camera Status** - Detailed status for all cameras
- **Get Camera Violations** - Violations summary for all cameras
- **Get Employee Violations** - Violations for specific employee
- **Camera Cache Management** - Cache operations for camera data
- **Individual Camera Details** - Specific camera information

### 3. **Employee Tracking** (4 endpoints)
- **Get Employee Work Hours** - Work hours analysis
- **Get Employee Break Time** - Break time analysis
- **Get Employee Attendance** - Attendance data
- **Get Employee Activity Patterns** - Activity pattern analysis

### 4. **Zone Management** (4 endpoints)
- **Get Desk Occupancy** - Desk occupancy data
- **Get Zone Utilization** - Zone utilization statistics
- **Get Employee Zone Preferences** - Employee zone preferences
- **Get Zone Activity Patterns** - Zone activity patterns

### 5. **Analytics & Reporting** (5 endpoints)
- **Get Analytics Dashboard** - Comprehensive dashboard data
- **Get Analytics Trends** - Trend analysis
- **Get Performance Metrics** - Performance analytics
- **Get Predictive Analytics** - Predictive insights
- **Get Custom Reports** - Custom report generation

### 6. **Mobile APIs** (7 endpoints)
- **Get Mobile Dashboard** - Mobile-optimized dashboard
- **Get Mobile Violations** - Mobile-optimized violations list
- **Get Mobile Employee Status** - Mobile employee status
- **Get Mobile Camera Status** - Mobile camera status
- **Get Mobile Notifications** - Mobile notifications
- **Get Mobile Sync Data** - Offline synchronization data
- **Get Mobile Settings** - Mobile app configuration

### 7. **Performance Monitoring** (9 endpoints)
- **Get Performance Metrics** - Detailed performance metrics
- **Get Performance Summary** - Performance summary with percentiles
- **Get System Health** - Overall system health status
- **Get Performance Recommendations** - Optimization recommendations
- **Get Cache Statistics** - Cache performance statistics
- **Get Cache Keys** - All cache keys
- **Clear Cache** - Clear all cache entries
- **Reset Performance Metrics** - Reset performance data
- **Cache Entry Management** - Individual cache entry operations

### 8. **WebSocket & Real-time** (5 endpoints)
- **Get WebSocket Stats** - WebSocket connection statistics
- **Get WebSocket Activity** - Real-time activity summary
- **Send WebSocket Test Event** - Send test event to clients
- **Send Custom Event** - Send custom event to clients
- **Broadcast Custom Event** - Broadcast event to all clients

### 9. **Media & Files** (3 endpoints)
- **Media Proxy Root** - Access media proxy root directory
- **Media Recordings Directory** - Access recordings directory
- **Media Clips Directory** - Access clips directory

### 10. **Documentation** (2 endpoints)
- **Swagger Documentation** - Interactive API documentation
- **Swagger JSON** - API specification in JSON format

## 🧪 Testing Features

### **Automated Test Scripts**
Each request includes comprehensive test scripts that validate:
- ✅ Response status codes
- ✅ Response times and performance
- ✅ Data structure validation
- ✅ Error handling
- ✅ Security headers
- ✅ Content type validation

### **Performance Monitoring**
- Response time tracking
- Memory usage monitoring
- Cache hit rate analysis
- Database query performance
- System health metrics

### **Data Validation**
- JSON structure validation
- Required field checking
- Type validation
- Format validation
- Business logic validation

## 🚀 Quick Start

### 1. **Import Collection**
```bash
# Import the collection file
File → Import Data → From File
Select: insomnia-complete-collection.json
```

### 2. **Set Environment**
- Select "Frigate Middleware Environment"
- Verify `base_url` is set to `http://10.0.20.8:5002`
- Update other variables as needed

### 3. **Run Tests**
- Start with "Health Check" to verify connectivity
- Test "Mobile Settings" for quick validation
- Run "Performance Health" for system status
- Execute other endpoints as needed

## 📊 Test Script Usage

### **Adding Test Scripts to Requests**

1. **Open any request in Insomnia**
2. **Go to "Tests" tab**
3. **Copy and paste the test script from `insomnia-test-script.js`**
4. **Run the request**
5. **Check the console for detailed test results**

### **Test Script Features**

```javascript
// Example test output
🚀 Starting Frigate Middleware API Tests...
==========================================

📋 Testing Basic Response...
✅ Status Code: 200 (Success)
✅ Response Time: 245ms
✅ Content Type: JSON

⚡ Testing Performance...
📊 Performance Rating: excellent (245ms)
💾 Memory Usage: 42MB
🗄️ Cache Control: public, max-age=3600

📊 Testing Data Structure...
✅ Success: true
📝 Message: Data retrieved successfully
⏰ Timestamp: 2025-10-20T04:25:00.000Z
📦 Data field present

🔒 Testing Security...
✅ x-content-type-options: nosniff
✅ x-frame-options: DENY
✅ x-xss-protection: 1; mode=block
🔒 Security Score: 3/4

📊 Test Report Summary
=====================
🔗 URL: http://10.0.20.8:5002/v1/api/mobile/settings
📊 Status: 200
⏱️ Response Time: 245ms
📅 Test Time: 2025-10-20T04:25:00.000Z
⭐ Performance Rating: excellent
✅ Overall Result: PASS
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://10.0.20.8:5002` |
| `employee_name` | Example employee name | `Muhammad Arsalan` |
| `camera_name` | Example camera name | `employees_01` |
| `start_date` | Start date for queries | `2025-10-20` |
| `end_date` | End date for queries | `2025-10-20` |
| `hours` | Hours to look back | `24` |

### **Request Parameters**

Most requests support these common parameters:
- `start_date` - Start date (YYYY-MM-DD format)
- `end_date` - End date (YYYY-MM-DD format)
- `hours` - Hours to look back (fallback if no dates)
- `limit` - Number of items to return
- `offset` - Number of items to skip

## 📈 Performance Benchmarks

### **Response Time Targets**
- **Excellent**: < 500ms
- **Good**: < 1000ms
- **Acceptable**: < 2000ms
- **Slow**: > 2000ms

### **Expected Performance**
- **Mobile APIs**: < 1000ms (optimized for mobile)
- **Performance APIs**: < 500ms (cached data)
- **Analytics APIs**: < 5000ms (complex queries)
- **Media APIs**: < 2000ms (file operations)

## 🚨 Error Handling

### **Common Error Codes**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (endpoint not found)
- `500` - Internal Server Error (database issues)
- `502` - Bad Gateway (media server unavailable)

### **Error Response Format**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "timestamp": "2025-10-20T04:25:00.000Z"
}
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Connection Refused**
   - Check if server is running on `10.0.20.8:5002`
   - Verify network connectivity

2. **Database Timeout**
   - Some queries may timeout with large datasets
   - Try smaller time windows (1 hour instead of 24 hours)
   - Check database connectivity

3. **Media Proxy Errors**
   - Verify video server is running on `10.0.20.6:8080`
   - Check media file accessibility

4. **Performance Issues**
   - Check system health endpoint
   - Monitor memory usage
   - Clear cache if needed

### **Debug Steps**

1. **Start with Health Check**
   ```bash
   GET /v1/health
   ```

2. **Test Mobile Settings** (no database required)
   ```bash
   GET /v1/api/mobile/settings
   ```

3. **Check Performance Health**
   ```bash
   GET /v1/api/performance/health
   ```

4. **Test with smaller time windows**
   ```bash
   GET /v1/api/mobile/dashboard?hours=1
   ```

## 📚 Additional Resources

### **API Documentation**
- **Swagger UI**: `http://10.0.20.8:5002/v1/docs`
- **Swagger JSON**: `http://10.0.20.8:5002/v1/docs/swagger.json`

### **WebSocket Testing**
- **Test Client**: `http://10.0.20.8:5002/websocket-test.html`
- **WebSocket URL**: `ws://10.0.20.8:5002/socket.io/`

### **Media Access**
- **Recordings**: `http://10.0.20.8:5002/v1/media/recordings/`
- **Clips**: `http://10.0.20.8:5002/v1/media/clips/`

## 🎯 Best Practices

### **Testing Workflow**
1. **Health Check** → Verify system status
2. **Mobile Settings** → Test basic connectivity
3. **Performance Health** → Check system performance
4. **Core APIs** → Test main functionality
5. **Advanced APIs** → Test complex features
6. **Error Scenarios** → Test error handling

### **Performance Testing**
1. **Baseline** → Record initial performance
2. **Load Testing** → Test with multiple requests
3. **Stress Testing** → Test with large datasets
4. **Monitoring** → Watch performance metrics

### **Data Validation**
1. **Structure** → Validate JSON structure
2. **Content** → Check data accuracy
3. **Types** → Validate data types
4. **Business Logic** → Verify business rules

---

## 🎉 Ready to Test!

This collection provides everything you need to thoroughly test the Frigate Middleware API. Start with the health check and work your way through the different categories to ensure all functionality is working correctly.

**Happy Testing!** 🚀

