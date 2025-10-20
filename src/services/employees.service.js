const { query } = require('../config/postgres');
const { unixToISO, unixToReadable, parseDateTimeRange } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * Employee Service - Comprehensive employee tracking and attendance management
 * 
 * Features:
 * - Work hours calculation
 * - Break time tracking
 * - Attendance monitoring
 * - Desk occupancy analysis
 * - Employee activity patterns
 * - Productivity metrics
 */

/**
 * Get employee work hours for a specific date range
 * @param {Object} filters - Query filters
 * @returns {Object} Employee work hours data
 */
const getEmployeeWorkHours = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, employee_name, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND class_type = 'entered_zone'
      AND data->>'label' = 'person'
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (employee_name) {
      whereClause += ` AND data->'sub_label'->>0 = $${paramIndex}`;
      params.push(employee_name);
      paramIndex++;
    }

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    const sql = `
      SELECT
        data->'sub_label'->>0 as employee_name,
        camera,
        data->'zones' as zones,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen,
        COUNT(*) as activity_count,
        (MAX(timestamp) - MIN(timestamp)) / 3600 as total_hours
      FROM timeline
      ${whereClause}
      GROUP BY data->'sub_label'->>0, camera, data->'zones'
      ORDER BY first_seen DESC
    `;

    const result = await query(sql, params);

    // Process and calculate work hours
    const employeeData = {};
    
    result.forEach(row => {
      const employee = row.employee_name || 'Unknown';
      if (!employeeData[employee]) {
        employeeData[employee] = {
          employee_name: employee,
          total_work_hours: 0,
          total_activity: 0,
          cameras: new Set(),
          zones: new Set(),
          sessions: [],
          first_seen: null,
          last_seen: null
        };
      }

      const workHours = parseFloat(row.total_hours) || 0;
      employeeData[employee].total_work_hours += workHours;
      employeeData[employee].total_activity += parseInt(row.activity_count) || 0;
      employeeData[employee].cameras.add(row.camera);
      
      if (row.zones) {
        row.zones.forEach(zone => employeeData[employee].zones.add(zone));
      }

      employeeData[employee].sessions.push({
        camera: row.camera,
        zones: row.zones || [],
        first_seen: unixToISO(row.first_seen),
        last_seen: unixToISO(row.last_seen),
        duration_hours: workHours,
        activity_count: parseInt(row.activity_count) || 0
      });

      if (!employeeData[employee].first_seen || row.first_seen < employeeData[employee].first_seen) {
        employeeData[employee].first_seen = unixToISO(row.first_seen);
      }
      if (!employeeData[employee].last_seen || row.last_seen > employeeData[employee].last_seen) {
        employeeData[employee].last_seen = unixToISO(row.last_seen);
      }
    });

    // Convert sets to arrays and add calculated fields
    const employees = Object.values(employeeData).map(emp => ({
      ...emp,
      cameras: Array.from(emp.cameras),
      zones: Array.from(emp.zones),
      average_session_duration: emp.sessions.length > 0 
        ? emp.total_work_hours / emp.sessions.length 
        : 0,
      productivity_score: calculateProductivityScore(emp),
      attendance_status: getAttendanceStatus(emp.total_work_hours),
      work_efficiency: calculateWorkEfficiency(emp)
    }));

    return {
      employees,
      total_employees: employees.length,
      total_work_hours: employees.reduce((sum, emp) => sum + emp.total_work_hours, 0),
      average_work_hours: employees.length > 0 
        ? employees.reduce((sum, emp) => sum + emp.total_work_hours, 0) / employees.length 
        : 0,
      period: {
        start: unixToISO(startTime),
        end: unixToISO(endTime),
        duration_hours: (endTime - startTime) / 3600
      }
    };

  } catch (error) {
    logger.error('Error in getEmployeeWorkHours:', error);
    throw error;
  }
};

/**
 * Get employee break time analysis
 * @param {Object} filters - Query filters
 * @returns {Object} Break time data
 */
const getEmployeeBreakTime = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, employee_name, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND class_type = 'left_zone'
      AND data->>'label' = 'person'
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (employee_name) {
      whereClause += ` AND data->'sub_label'->>0 = $${paramIndex}`;
      params.push(employee_name);
      paramIndex++;
    }

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    const sql = `
      SELECT
        data->'sub_label'->>0 as employee_name,
        camera,
        data->'zones' as zones,
        timestamp as break_time,
        LAG(timestamp) OVER (PARTITION BY data->'sub_label'->>0 ORDER BY timestamp) as previous_activity
      FROM timeline
      ${whereClause}
      ORDER BY data->'sub_label'->>0, timestamp
    `;

    const result = await query(sql, params);

    // Process break time data
    const breakData = {};
    
    result.forEach(row => {
      const employee = row.employee_name || 'Unknown';
      if (!breakData[employee]) {
        breakData[employee] = {
          employee_name: employee,
          total_breaks: 0,
          total_break_time: 0,
          break_sessions: [],
          average_break_duration: 0,
          longest_break: 0,
          shortest_break: Infinity
        };
      }

      if (row.previous_activity) {
        const breakDuration = (row.break_time - row.previous_activity) / 3600; // hours
        breakData[employee].total_breaks++;
        breakData[employee].total_break_time += breakDuration;
        breakData[employee].break_sessions.push({
          camera: row.camera,
          zones: row.zones || [],
          break_time: unixToISO(row.break_time),
          duration_hours: breakDuration,
          previous_activity: unixToISO(row.previous_activity)
        });

        if (breakDuration > breakData[employee].longest_break) {
          breakData[employee].longest_break = breakDuration;
        }
        if (breakDuration < breakData[employee].shortest_break) {
          breakData[employee].shortest_break = breakDuration;
        }
      }
    });

    // Calculate averages and convert to array
    const employees = Object.values(breakData).map(emp => ({
      ...emp,
      average_break_duration: emp.total_breaks > 0 ? emp.total_break_time / emp.total_breaks : 0,
      shortest_break: emp.shortest_break === Infinity ? 0 : emp.shortest_break,
      break_frequency: emp.total_breaks / ((endTime - startTime) / 3600), // breaks per hour
      break_efficiency: calculateBreakEfficiency(emp)
    }));

    return {
      employees,
      total_employees: employees.length,
      total_break_time: employees.reduce((sum, emp) => sum + emp.total_break_time, 0),
      average_break_time: employees.length > 0 
        ? employees.reduce((sum, emp) => sum + emp.total_break_time, 0) / employees.length 
        : 0
    };

  } catch (error) {
    logger.error('Error in getEmployeeBreakTime:', error);
    throw error;
  }
};

/**
 * Get employee attendance summary
 * @param {Object} filters - Query filters
 * @returns {Object} Attendance data
 */
const getEmployeeAttendance = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, employee_name } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND class_type = 'entered_zone'
      AND data->>'label' = 'person'
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (employee_name) {
      whereClause += ` AND data->'sub_label'->>0 = $${paramIndex}`;
      params.push(employee_name);
      paramIndex++;
    }

    const sql = `
      SELECT
        data->'sub_label'->>0 as employee_name,
        DATE(to_timestamp(timestamp)) as attendance_date,
        MIN(timestamp) as first_seen,
        MAX(timestamp) as last_seen,
        COUNT(*) as activity_count,
        (MAX(timestamp) - MIN(timestamp)) / 3600 as work_hours
      FROM timeline
      ${whereClause}
      GROUP BY data->'sub_label'->>0, DATE(to_timestamp(timestamp))
      ORDER BY attendance_date DESC, data->'sub_label'->>0
    `;

    const result = await query(sql, params);

    // Process attendance data
    const attendanceData = {};
    
    result.forEach(row => {
      const employee = row.employee_name || 'Unknown';
      if (!attendanceData[employee]) {
        attendanceData[employee] = {
          employee_name: employee,
          total_days: 0,
          total_work_hours: 0,
          attendance_records: [],
          attendance_rate: 0,
          average_daily_hours: 0,
          perfect_attendance: true
        };
      }

      const workHours = parseFloat(row.work_hours) || 0;
      attendanceData[employee].total_days++;
      attendanceData[employee].total_work_hours += workHours;
      attendanceData[employee].attendance_records.push({
        date: row.attendance_date,
        first_seen: unixToISO(row.first_seen),
        last_seen: unixToISO(row.last_seen),
        work_hours: workHours,
        activity_count: parseInt(row.activity_count) || 0,
        status: getDailyAttendanceStatus(workHours)
      });

      // Check for perfect attendance (assuming 8+ hours is full day)
      if (workHours < 8) {
        attendanceData[employee].perfect_attendance = false;
      }
    });

    // Calculate summary statistics
    const employees = Object.values(attendanceData).map(emp => {
      const totalDaysInPeriod = Math.ceil((endTime - startTime) / (24 * 3600));
      return {
        ...emp,
        attendance_rate: totalDaysInPeriod > 0 ? (emp.total_days / totalDaysInPeriod) * 100 : 0,
        average_daily_hours: emp.total_days > 0 ? emp.total_work_hours / emp.total_days : 0,
        attendance_score: calculateAttendanceScore(emp),
        consistency_rating: calculateConsistencyRating(emp.attendance_records)
      };
    });

    return {
      employees,
      total_employees: employees.length,
      period_days: Math.ceil((endTime - startTime) / (24 * 3600)),
      overall_attendance_rate: employees.length > 0 
        ? employees.reduce((sum, emp) => sum + emp.attendance_rate, 0) / employees.length 
        : 0
    };

  } catch (error) {
    logger.error('Error in getEmployeeAttendance:', error);
    throw error;
  }
};

/**
 * Get employee activity patterns
 * @param {Object} filters - Query filters
 * @returns {Object} Activity pattern data
 */
const getEmployeeActivityPatterns = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, employee_name, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND data->>'label' = 'person'
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (employee_name) {
      whereClause += ` AND data->'sub_label'->>0 = $${paramIndex}`;
      params.push(employee_name);
      paramIndex++;
    }

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    const sql = `
      SELECT
        data->'sub_label'->>0 as employee_name,
        camera,
        data->'zones' as zones,
        EXTRACT(HOUR FROM to_timestamp(timestamp)) as hour_of_day,
        EXTRACT(DOW FROM to_timestamp(timestamp)) as day_of_week,
        COUNT(*) as activity_count
      FROM timeline
      ${whereClause}
      GROUP BY data->'sub_label'->>0, camera, data->'zones', 
               EXTRACT(HOUR FROM to_timestamp(timestamp)), 
               EXTRACT(DOW FROM to_timestamp(timestamp))
      ORDER BY data->'sub_label'->>0, hour_of_day, day_of_week
    `;

    const result = await query(sql, params);

    // Process activity patterns
    const patternData = {};
    
    result.forEach(row => {
      const employee = row.employee_name || 'Unknown';
      if (!patternData[employee]) {
        patternData[employee] = {
          employee_name: employee,
          hourly_patterns: {},
          daily_patterns: {},
          zone_preferences: {},
          camera_usage: {},
          peak_hours: [],
          most_active_day: null,
          activity_consistency: 0
        };
      }

      const hour = parseInt(row.hour_of_day);
      const day = parseInt(row.day_of_week);
      const activityCount = parseInt(row.activity_count) || 0;

      // Hourly patterns
      if (!patternData[employee].hourly_patterns[hour]) {
        patternData[employee].hourly_patterns[hour] = 0;
      }
      patternData[employee].hourly_patterns[hour] += activityCount;

      // Daily patterns
      if (!patternData[employee].daily_patterns[day]) {
        patternData[employee].daily_patterns[day] = 0;
      }
      patternData[employee].daily_patterns[day] += activityCount;

      // Zone preferences
      if (row.zones) {
        row.zones.forEach(zone => {
          if (!patternData[employee].zone_preferences[zone]) {
            patternData[employee].zone_preferences[zone] = 0;
          }
          patternData[employee].zone_preferences[zone] += activityCount;
        });
      }

      // Camera usage
      if (!patternData[employee].camera_usage[row.camera]) {
        patternData[employee].camera_usage[row.camera] = 0;
      }
      patternData[employee].camera_usage[row.camera] += activityCount;
    });

    // Calculate patterns and insights
    const employees = Object.values(patternData).map(emp => {
      const hourlyValues = Object.values(emp.hourly_patterns);
      const dailyValues = Object.values(emp.daily_patterns);
      
      return {
        ...emp,
        peak_hours: findPeakHours(emp.hourly_patterns),
        most_active_day: findMostActiveDay(emp.daily_patterns),
        activity_consistency: calculateActivityConsistency(hourlyValues),
        productivity_trends: analyzeProductivityTrends(emp.hourly_patterns),
        work_style: determineWorkStyle(emp.hourly_patterns),
        zone_diversity: Object.keys(emp.zone_preferences).length,
        camera_diversity: Object.keys(emp.camera_usage).length
      };
    });

    return {
      employees,
      total_employees: employees.length,
      insights: generateActivityInsights(employees)
    };

  } catch (error) {
    logger.error('Error in getEmployeeActivityPatterns:', error);
    throw error;
  }
};

// Helper functions

/**
 * Calculate productivity score based on work hours and activity
 */
const calculateProductivityScore = (employee) => {
  const baseScore = Math.min(employee.total_work_hours / 8, 1) * 50; // 50 points for full day
  const activityScore = Math.min(employee.total_activity / 100, 1) * 30; // 30 points for activity
  const consistencyScore = employee.sessions.length > 0 ? 20 : 0; // 20 points for consistency
  
  return Math.round(baseScore + activityScore + consistencyScore);
};

/**
 * Get attendance status based on work hours
 */
const getAttendanceStatus = (workHours) => {
  if (workHours >= 8) return 'full_day';
  if (workHours >= 4) return 'half_day';
  if (workHours > 0) return 'partial_day';
  return 'absent';
};

/**
 * Calculate work efficiency
 */
const calculateWorkEfficiency = (employee) => {
  const expectedHours = 8; // Standard work day
  const actualHours = employee.total_work_hours;
  const efficiency = (actualHours / expectedHours) * 100;
  return Math.min(Math.round(efficiency), 100);
};

/**
 * Calculate break efficiency
 */
const calculateBreakEfficiency = (employee) => {
  const totalWorkTime = 8; // Assume 8 hour work day
  const breakTime = employee.total_break_time;
  const efficiency = ((totalWorkTime - breakTime) / totalWorkTime) * 100;
  return Math.max(Math.round(efficiency), 0);
};

/**
 * Get daily attendance status
 */
const getDailyAttendanceStatus = (workHours) => {
  if (workHours >= 8) return 'present';
  if (workHours >= 4) return 'partial';
  if (workHours > 0) return 'late';
  return 'absent';
};

/**
 * Calculate attendance score
 */
const calculateAttendanceScore = (employee) => {
  const baseScore = employee.attendance_rate;
  const consistencyBonus = employee.perfect_attendance ? 10 : 0;
  return Math.min(baseScore + consistencyBonus, 100);
};

/**
 * Calculate consistency rating
 */
const calculateConsistencyRating = (records) => {
  if (records.length < 2) return 100;
  
  const hours = records.map(r => r.work_hours);
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const variance = hours.reduce((sum, h) => sum + Math.pow(h - mean, 2), 0) / hours.length;
  const stdDev = Math.sqrt(variance);
  
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
  return Math.round(consistency);
};

/**
 * Find peak hours
 */
const findPeakHours = (hourlyPatterns) => {
  const sorted = Object.entries(hourlyPatterns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  return sorted.map(([hour, count]) => ({ hour: parseInt(hour), activity: count }));
};

/**
 * Find most active day
 */
const findMostActiveDay = (dailyPatterns) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sorted = Object.entries(dailyPatterns)
    .sort(([,a], [,b]) => b - a);
  return sorted.length > 0 ? {
    day: days[parseInt(sorted[0][0])],
    activity: sorted[0][1]
  } : null;
};

/**
 * Calculate activity consistency
 */
const calculateActivityConsistency = (values) => {
  if (values.length < 2) return 100;
  
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
  return Math.round(consistency);
};

/**
 * Analyze productivity trends
 */
const analyzeProductivityTrends = (hourlyPatterns) => {
  const morning = [6, 7, 8, 9, 10, 11].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const afternoon = [12, 13, 14, 15, 16, 17].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const evening = [18, 19, 20, 21, 22, 23].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  
  const total = morning + afternoon + evening;
  if (total === 0) return 'unknown';
  
  if (morning > afternoon && morning > evening) return 'morning_person';
  if (afternoon > morning && afternoon > evening) return 'afternoon_person';
  if (evening > morning && evening > afternoon) return 'evening_person';
  return 'balanced';
};

/**
 * Determine work style
 */
const determineWorkStyle = (hourlyPatterns) => {
  const earlyHours = [6, 7, 8].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const regularHours = [9, 10, 11, 12, 13, 14, 15, 16, 17].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const lateHours = [18, 19, 20, 21, 22, 23].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  
  const total = earlyHours + regularHours + lateHours;
  if (total === 0) return 'unknown';
  
  if (earlyHours > regularHours && earlyHours > lateHours) return 'early_bird';
  if (lateHours > earlyHours && lateHours > regularHours) return 'night_owl';
  return 'regular_schedule';
};

/**
 * Generate activity insights
 */
const generateActivityInsights = (employees) => {
  const totalEmployees = employees.length;
  if (totalEmployees === 0) return {};

  const morningPeople = employees.filter(e => e.productivity_trends === 'morning_person').length;
  const eveningPeople = employees.filter(e => e.productivity_trends === 'evening_person').length;
  const earlyBirds = employees.filter(e => e.work_style === 'early_bird').length;
  const nightOwls = employees.filter(e => e.work_style === 'night_owl').length;

  return {
    total_employees: totalEmployees,
    productivity_distribution: {
      morning_person: Math.round((morningPeople / totalEmployees) * 100),
      evening_person: Math.round((eveningPeople / totalEmployees) * 100),
      balanced: Math.round(((totalEmployees - morningPeople - eveningPeople) / totalEmployees) * 100)
    },
    work_style_distribution: {
      early_bird: Math.round((earlyBirds / totalEmployees) * 100),
      night_owl: Math.round((nightOwls / totalEmployees) * 100),
      regular_schedule: Math.round(((totalEmployees - earlyBirds - nightOwls) / totalEmployees) * 100)
    },
    average_consistency: Math.round(
      employees.reduce((sum, e) => sum + e.activity_consistency, 0) / totalEmployees
    )
  };
};

module.exports = {
  getEmployeeWorkHours,
  getEmployeeBreakTime,
  getEmployeeAttendance,
  getEmployeeActivityPatterns
};
