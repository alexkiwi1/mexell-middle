/**
 * Insomnia Test Script for Frigate Middleware API
 * 
 * This script provides comprehensive testing for all API endpoints
 * with automated validation and performance monitoring.
 * 
 * Usage: Add this as a test script in Insomnia for each request
 */

// Test configuration
const TEST_CONFIG = {
  // Expected response times (in milliseconds)
  MAX_RESPONSE_TIME: 5000,
  MAX_DB_QUERY_TIME: 10000,
  
  // Required fields for different response types
  REQUIRED_FIELDS: {
    success: ['success', 'message', 'timestamp'],
    data: ['data'],
    error: ['success', 'message', 'error']
  },
  
  // Performance thresholds
  PERFORMANCE_THRESHOLDS: {
    excellent: 500,
    good: 1000,
    acceptable: 2000,
    slow: 5000
  }
};

/**
 * Main test function - call this in Insomnia test scripts
 */
function runTests() {
  console.log('🚀 Starting Frigate Middleware API Tests...');
  console.log('==========================================');
  
  // Basic response validation
  testBasicResponse();
  
  // Performance testing
  testPerformance();
  
  // Data validation
  testDataStructure();
  
  // Error handling
  testErrorHandling();
  
  // Security checks
  testSecurity();
  
  console.log('✅ All tests completed!');
}

/**
 * Test basic response structure and status
 */
function testBasicResponse() {
  console.log('\n📋 Testing Basic Response...');
  
  // Check if response exists
  if (!response) {
    console.error('❌ No response received');
    return false;
  }
  
  // Check status code
  const statusCode = response.getStatus();
  if (statusCode >= 200 && statusCode < 300) {
    console.log(`✅ Status Code: ${statusCode} (Success)`);
  } else if (statusCode >= 400 && statusCode < 500) {
    console.log(`⚠️  Status Code: ${statusCode} (Client Error)`);
  } else if (statusCode >= 500) {
    console.error(`❌ Status Code: ${statusCode} (Server Error)`);
    return false;
  }
  
  // Check response time
  const responseTime = response.getTime();
  if (responseTime <= TEST_CONFIG.MAX_RESPONSE_TIME) {
    console.log(`✅ Response Time: ${responseTime}ms`);
  } else {
    console.warn(`⚠️  Response Time: ${responseTime}ms (Slow)`);
  }
  
  // Check content type
  const contentType = response.getHeader('content-type');
  if (contentType && contentType.includes('application/json')) {
    console.log('✅ Content Type: JSON');
  } else {
    console.warn(`⚠️  Content Type: ${contentType}`);
  }
  
  return true;
}

/**
 * Test performance metrics
 */
function testPerformance() {
  console.log('\n⚡ Testing Performance...');
  
  const responseTime = response.getTime();
  const statusCode = response.getStatus();
  
  // Performance rating
  let rating = 'slow';
  if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.excellent) {
    rating = 'excellent';
  } else if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.good) {
    rating = 'good';
  } else if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.acceptable) {
    rating = 'acceptable';
  }
  
  console.log(`📊 Performance Rating: ${rating} (${responseTime}ms)`);
  
  // Memory usage check (if available)
  if (response.getHeader('x-memory-usage')) {
    const memoryUsage = response.getHeader('x-memory-usage');
    console.log(`💾 Memory Usage: ${memoryUsage}`);
  }
  
  // Cache headers check
  const cacheControl = response.getHeader('cache-control');
  if (cacheControl) {
    console.log(`🗄️  Cache Control: ${cacheControl}`);
  }
  
  return true;
}

/**
 * Test data structure and content
 */
function testDataStructure() {
  console.log('\n📊 Testing Data Structure...');
  
  try {
    const responseData = response.getBody();
    
    if (!responseData) {
      console.error('❌ No response body');
      return false;
    }
    
    // Parse JSON if it's a string
    let data;
    if (typeof responseData === 'string') {
      try {
        data = JSON.parse(responseData);
      } catch (e) {
        console.error('❌ Invalid JSON response');
        return false;
      }
    } else {
      data = responseData;
    }
    
    // Check for success field
    if (data.hasOwnProperty('success')) {
      if (data.success === true) {
        console.log('✅ Success: true');
      } else {
        console.warn('⚠️  Success: false');
      }
    }
    
    // Check for message field
    if (data.hasOwnProperty('message')) {
      console.log(`📝 Message: ${data.message}`);
    }
    
    // Check for timestamp field
    if (data.hasOwnProperty('timestamp')) {
      const timestamp = new Date(data.timestamp);
      if (!isNaN(timestamp.getTime())) {
        console.log(`⏰ Timestamp: ${data.timestamp}`);
      } else {
        console.warn('⚠️  Invalid timestamp format');
      }
    }
    
    // Check for data field
    if (data.hasOwnProperty('data')) {
      console.log('📦 Data field present');
      
      // Additional data validation based on endpoint
      const url = request.getUrl();
      if (url.includes('/mobile/')) {
        testMobileDataStructure(data.data);
      } else if (url.includes('/performance/')) {
        testPerformanceDataStructure(data.data);
      } else if (url.includes('/cameras/')) {
        testCameraDataStructure(data.data);
      } else if (url.includes('/employees/')) {
        testEmployeeDataStructure(data.data);
      }
    }
    
    // Check for error field
    if (data.hasOwnProperty('error')) {
      console.warn(`⚠️  Error: ${data.error}`);
    }
    
    return true;
    
  } catch (error) {
    console.error(`❌ Data structure test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test mobile API data structure
 */
function testMobileDataStructure(data) {
  console.log('📱 Testing Mobile API Data Structure...');
  
  if (Array.isArray(data)) {
    console.log(`📊 Array with ${data.length} items`);
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    console.log(`📊 Object with keys: ${keys.join(', ')}`);
    
    // Check for common mobile API fields
    if (data.hasOwnProperty('summary')) {
      console.log('✅ Summary field present');
    }
    if (data.hasOwnProperty('violations')) {
      console.log(`✅ Violations: ${data.violations.length || 0} items`);
    }
    if (data.hasOwnProperty('employees')) {
      console.log(`✅ Employees: ${data.employees.length || 0} items`);
    }
    if (data.hasOwnProperty('cameras')) {
      console.log(`✅ Cameras: ${data.cameras.length || 0} items`);
    }
  }
}

/**
 * Test performance API data structure
 */
function testPerformanceDataStructure(data) {
  console.log('⚡ Testing Performance API Data Structure...');
  
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    console.log(`📊 Object with keys: ${keys.join(', ')}`);
    
    // Check for performance metrics
    if (data.hasOwnProperty('requests')) {
      console.log('✅ Requests metrics present');
    }
    if (data.hasOwnProperty('database')) {
      console.log('✅ Database metrics present');
    }
    if (data.hasOwnProperty('cache')) {
      console.log('✅ Cache metrics present');
    }
    if (data.hasOwnProperty('memory')) {
      console.log('✅ Memory metrics present');
    }
    if (data.hasOwnProperty('status')) {
      console.log(`📊 Status: ${data.status}`);
    }
  }
}

/**
 * Test camera API data structure
 */
function testCameraDataStructure(data) {
  console.log('📹 Testing Camera API Data Structure...');
  
  if (Array.isArray(data)) {
    console.log(`📊 Array with ${data.length} cameras`);
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    console.log(`📊 Object with keys: ${keys.join(', ')}`);
    
    if (data.hasOwnProperty('summaries')) {
      console.log(`✅ Summaries: ${data.summaries.length || 0} items`);
    }
    if (data.hasOwnProperty('activity')) {
      console.log(`✅ Activity: ${data.activity.length || 0} items`);
    }
  }
}

/**
 * Test employee API data structure
 */
function testEmployeeDataStructure(data) {
  console.log('👥 Testing Employee API Data Structure...');
  
  if (Array.isArray(data)) {
    console.log(`📊 Array with ${data.length} employees`);
  } else if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    console.log(`📊 Object with keys: ${keys.join(', ')}`);
    
    if (data.hasOwnProperty('work_hours')) {
      console.log('✅ Work hours data present');
    }
    if (data.hasOwnProperty('break_time')) {
      console.log('✅ Break time data present');
    }
    if (data.hasOwnProperty('attendance')) {
      console.log('✅ Attendance data present');
    }
  }
}

/**
 * Test error handling
 */
function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  const statusCode = response.getStatus();
  
  if (statusCode >= 400) {
    console.log(`⚠️  Error Status: ${statusCode}`);
    
    try {
      const responseData = response.getBody();
      let data;
      
      if (typeof responseData === 'string') {
        data = JSON.parse(responseData);
      } else {
        data = responseData;
      }
      
      if (data.hasOwnProperty('error')) {
        console.log(`📝 Error Message: ${data.error}`);
      }
      
      if (data.hasOwnProperty('message')) {
        console.log(`📝 Error Description: ${data.message}`);
      }
      
    } catch (e) {
      console.warn('⚠️  Could not parse error response');
    }
  } else {
    console.log('✅ No errors detected');
  }
  
  return true;
}

/**
 * Test security headers and practices
 */
function testSecurity() {
  console.log('\n🔒 Testing Security...');
  
  // Check for security headers
  const securityHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security'
  ];
  
  let securityScore = 0;
  securityHeaders.forEach(header => {
    if (response.getHeader(header)) {
      console.log(`✅ ${header}: ${response.getHeader(header)}`);
      securityScore++;
    } else {
      console.log(`⚠️  Missing: ${header}`);
    }
  });
  
  console.log(`🔒 Security Score: ${securityScore}/${securityHeaders.length}`);
  
  // Check for CORS headers
  const corsHeaders = [
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers'
  ];
  
  corsHeaders.forEach(header => {
    if (response.getHeader(header)) {
      console.log(`🌐 CORS ${header}: ${response.getHeader(header)}`);
    }
  });
  
  return true;
}

/**
 * Generate test report
 */
function generateTestReport() {
  console.log('\n📊 Test Report Summary');
  console.log('=====================');
  
  const statusCode = response.getStatus();
  const responseTime = response.getTime();
  const url = request.getUrl();
  
  console.log(`🔗 URL: ${url}`);
  console.log(`📊 Status: ${statusCode}`);
  console.log(`⏱️  Response Time: ${responseTime}ms`);
  console.log(`📅 Test Time: ${new Date().toISOString()}`);
  
  // Performance rating
  let rating = 'slow';
  if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.excellent) {
    rating = 'excellent';
  } else if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.good) {
    rating = 'good';
  } else if (responseTime <= TEST_CONFIG.PERFORMANCE_THRESHOLDS.acceptable) {
    rating = 'acceptable';
  }
  
  console.log(`⭐ Performance Rating: ${rating}`);
  
  if (statusCode >= 200 && statusCode < 300) {
    console.log('✅ Overall Result: PASS');
  } else {
    console.log('❌ Overall Result: FAIL');
  }
}

// Run all tests
runTests();

// Generate final report
generateTestReport();
