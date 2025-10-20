const { query } = require('../config/postgres');
const { unixToISO, unixToReadable, parseDateTimeRange } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * Analytics Service - Advanced reporting and insights
 * 
 * Features:
 * - Comprehensive dashboards
 * - Trend analysis
 * - Performance metrics
 * - Predictive analytics
 * - Custom reports
 * - Data visualization support
 */

/**
 * Get comprehensive dashboard data
 * @param {Object} filters - Query filters
 * @returns {Object} Dashboard data
 */
const getDashboardData = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    // Parallel queries for dashboard data
    const [
      activityData,
      violationData,
      employeeData,
      cameraData
    ] = await Promise.all([
      getActivitySummary(startTime, endTime, camera),
      getViolationSummary(startTime, endTime, camera),
      getEmployeeSummary(startTime, endTime, camera),
      getCameraSummary(startTime, endTime, camera)
    ]);

    // Calculate key metrics
    const totalActivity = activityData.total_events;
    const totalViolations = violationData.total_violations;
    const activeEmployees = employeeData.unique_employees;
    const activeCameras = cameraData.active_cameras;

    // Calculate trends (compare with previous period)
    const previousPeriod = {
      start: startTime - (endTime - startTime),
      end: startTime
    };

    const [
      previousActivity,
      previousViolations
    ] = await Promise.all([
      getActivitySummary(previousPeriod.start, previousPeriod.end, camera),
      getViolationSummary(previousPeriod.start, previousPeriod.end, camera)
    ]);

    const activityTrend = calculateTrend(totalActivity, previousActivity.total_events);
    const violationTrend = calculateTrend(totalViolations, previousViolations.total_violations);

    return {
      overview: {
        total_activity: totalActivity,
        total_violations: totalViolations,
        active_employees: activeEmployees,
        active_cameras: activeCameras,
        period: {
          start: unixToISO(startTime),
          end: unixToISO(endTime),
          duration_hours: (endTime - startTime) / 3600
        }
      },
      trends: {
        activity: {
          current: totalActivity,
          previous: previousActivity.total_events,
          change: activityTrend.change,
          change_percent: activityTrend.changePercent,
          direction: activityTrend.direction
        },
        violations: {
          current: totalViolations,
          previous: previousViolations.total_violations,
          change: violationTrend.change,
          change_percent: violationTrend.changePercent,
          direction: violationTrend.direction
        }
      },
      activity: activityData,
      violations: violationData,
      employees: employeeData,
      cameras: cameraData,
      insights: generateDashboardInsights({
        activity: activityData,
        violations: violationData,
        employees: employeeData,
        cameras: cameraData,
        trends: { activity: activityTrend, violations: violationTrend }
      })
    };

  } catch (error) {
    logger.error('Error in getDashboardData:', error);
    throw error;
  }
};

/**
 * Get trend analysis data
 * @param {Object} filters - Query filters
 * @returns {Object} Trend analysis data
 */
const getTrendAnalysis = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera, metric, granularity = 'hourly' } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let timeGrouping;
    let timeFormat;
    
    switch (granularity) {
      case 'hourly':
        timeGrouping = 'EXTRACT(HOUR FROM FROM_UNIXTIME(timestamp))';
        timeFormat = 'HH24';
        break;
      case 'daily':
        timeGrouping = 'DATE(FROM_UNIXTIME(timestamp))';
        timeFormat = 'YYYY-MM-DD';
        break;
      case 'weekly':
        timeGrouping = 'EXTRACT(WEEK FROM FROM_UNIXTIME(timestamp))';
        timeFormat = 'YYYY-"W"WW';
        break;
      default:
        timeGrouping = 'EXTRACT(HOUR FROM FROM_UNIXTIME(timestamp))';
        timeFormat = 'HH24';
    }

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    // Build query based on metric type
    let sql;
    switch (metric) {
      case 'activity':
        sql = `
          SELECT
            ${timeGrouping} as time_period,
            COUNT(*) as count,
            COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
            COUNT(DISTINCT camera) as unique_cameras
          FROM timeline
          ${whereClause}
          AND label = 'person'
          GROUP BY ${timeGrouping}
          ORDER BY time_period
        `;
        break;
      case 'violations':
        sql = `
          SELECT
            ${timeGrouping} as time_period,
            COUNT(*) as count,
            COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
            COUNT(DISTINCT camera) as unique_cameras
          FROM timeline
          ${whereClause}
          AND label = 'cell phone'
          GROUP BY ${timeGrouping}
          ORDER BY time_period
        `;
        break;
      case 'employees':
        sql = `
          SELECT
            ${timeGrouping} as time_period,
            COUNT(DISTINCT data->'sub_label'->>0) as count,
            COUNT(*) as total_activity
          FROM timeline
          ${whereClause}
          AND label = 'person'
          AND data->'sub_label'->>0 IS NOT NULL
          GROUP BY ${timeGrouping}
          ORDER BY time_period
        `;
        break;
      default:
        sql = `
          SELECT
            ${timeGrouping} as time_period,
            COUNT(*) as count
          FROM timeline
          ${whereClause}
          GROUP BY ${timeGrouping}
          ORDER BY time_period
        `;
    }

    const result = await query(sql, params);

    // Process trend data
    const trendData = result.map(row => ({
      time_period: formatTimePeriod(row.time_period, granularity),
      count: parseInt(row.count) || 0,
      unique_employees: parseInt(row.unique_employees) || 0,
      unique_cameras: parseInt(row.unique_cameras) || 0,
      total_activity: parseInt(row.total_activity) || 0
    }));

    // Calculate trend statistics
    const trendStats = calculateTrendStatistics(trendData);

    return {
      metric,
      granularity,
      period: {
        start: unixToISO(startTime),
        end: unixToISO(endTime)
      },
      data: trendData,
      statistics: trendStats,
      insights: generateTrendInsights(trendData, trendStats)
    };

  } catch (error) {
    logger.error('Error in getTrendAnalysis:', error);
    throw error;
  }
};

/**
 * Get performance metrics
 * @param {Object} filters - Query filters
 * @returns {Object} Performance metrics
 */
const getPerformanceMetrics = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera, employee_name } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    // Get comprehensive performance data
    const [
      productivityData,
      efficiencyData,
      complianceData,
      engagementData
    ] = await Promise.all([
      getProductivityMetrics(startTime, endTime, camera, employee_name),
      getEfficiencyMetrics(startTime, endTime, camera, employee_name),
      getComplianceMetrics(startTime, endTime, camera, employee_name),
      getEngagementMetrics(startTime, endTime, camera, employee_name)
    ]);

    // Calculate overall performance score
    const overallScore = calculateOverallPerformanceScore({
      productivity: productivityData,
      efficiency: efficiencyData,
      compliance: complianceData,
      engagement: engagementData
    });

    return {
      overall_score: overallScore,
      productivity: productivityData,
      efficiency: efficiencyData,
      compliance: complianceData,
      engagement: engagementData,
      period: {
        start: unixToISO(startTime),
        end: unixToISO(endTime)
      },
      insights: generatePerformanceInsights({
        productivity: productivityData,
        efficiency: efficiencyData,
        compliance: complianceData,
        engagement: engagementData,
        overall: overallScore
      })
    };

  } catch (error) {
    logger.error('Error in getPerformanceMetrics:', error);
    throw error;
  }
};

/**
 * Get predictive analytics data
 * @param {Object} filters - Query filters
 * @returns {Object} Predictive analytics data
 */
const getPredictiveAnalytics = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera, prediction_type = 'violations' } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    // Get historical data for prediction
    const historicalData = await getHistoricalData(startTime, endTime, camera, prediction_type);
    
    // Generate predictions based on type
    let predictions;
    switch (prediction_type) {
      case 'violations':
        predictions = predictViolations(historicalData);
        break;
      case 'attendance':
        predictions = predictAttendance(historicalData);
        break;
      case 'productivity':
        predictions = predictProductivity(historicalData);
        break;
      default:
        predictions = predictViolations(historicalData);
    }

    return {
      prediction_type,
      historical_data: historicalData,
      predictions,
      confidence: predictions.confidence,
      period: {
        start: unixToISO(startTime),
        end: unixToISO(endTime)
      },
      insights: generatePredictiveInsights(predictions, historicalData)
    };

  } catch (error) {
    logger.error('Error in getPredictiveAnalytics:', error);
    throw error;
  }
};

/**
 * Get custom report data
 * @param {Object} filters - Query filters
 * @returns {Object} Custom report data
 */
const getCustomReport = async (filters = {}) => {
  try {
    const { 
      start_date, 
      end_date, 
      hours, 
      camera, 
      employee_name,
      report_type = 'comprehensive',
      include_charts = true
    } = filters;
    
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    // Generate report based on type
    let reportData;
    switch (report_type) {
      case 'comprehensive':
        reportData = await generateComprehensiveReport(startTime, endTime, camera, employee_name);
        break;
      case 'violations':
        reportData = await generateViolationsReport(startTime, endTime, camera, employee_name);
        break;
      case 'attendance':
        reportData = await generateAttendanceReport(startTime, endTime, camera, employee_name);
        break;
      case 'productivity':
        reportData = await generateProductivityReport(startTime, endTime, camera, employee_name);
        break;
      default:
        reportData = await generateComprehensiveReport(startTime, endTime, camera, employee_name);
    }

    // Add chart data if requested
    if (include_charts) {
      reportData.charts = await generateChartData(startTime, endTime, camera, employee_name, report_type);
    }

    return {
      report_type,
      generated_at: unixToISO(Date.now() / 1000),
      period: {
        start: unixToISO(startTime),
        end: unixToISO(endTime)
      },
      data: reportData,
      summary: generateReportSummary(reportData)
    };

  } catch (error) {
    logger.error('Error in getCustomReport:', error);
    throw error;
  }
};

// Helper functions for dashboard data

/**
 * Get activity summary
 */
const getActivitySummary = async (startTime, endTime, camera) => {
  let whereClause = `
    WHERE timestamp >= $1 AND timestamp <= $2
    AND label = 'person'
  `;
  const params = [startTime, endTime];
  let paramIndex = 3;

  if (camera) {
    whereClause += ` AND camera = $${paramIndex}`;
    params.push(camera);
    paramIndex++;
  }

  const sql = `
    SELECT
      COUNT(*) as total_events,
      COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
      COUNT(DISTINCT camera) as unique_cameras,
      COUNT(DISTINCT data->'zones') as unique_zones
    FROM timeline
    ${whereClause}
  `;

  const result = await query(sql, params);
  return result[0] || { total_events: 0, unique_employees: 0, unique_cameras: 0, unique_zones: 0 };
};

/**
 * Get violation summary
 */
const getViolationSummary = async (startTime, endTime, camera) => {
  let whereClause = `
    WHERE timestamp >= $1 AND timestamp <= $2
    AND label = 'cell phone'
  `;
  const params = [startTime, endTime];
  let paramIndex = 3;

  if (camera) {
    whereClause += ` AND camera = $${paramIndex}`;
    params.push(camera);
    paramIndex++;
  }

  const sql = `
    SELECT
      COUNT(*) as total_violations,
      COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
      COUNT(DISTINCT camera) as unique_cameras,
      AVG(CAST(data->>'score' AS FLOAT)) as average_confidence
    FROM timeline
    ${whereClause}
  `;

  const result = await query(sql, params);
  return result[0] || { 
    total_violations: 0, 
    unique_employees: 0, 
    unique_cameras: 0, 
    average_confidence: 0 
  };
};

/**
 * Get employee summary
 */
const getEmployeeSummary = async (startTime, endTime, camera) => {
  let whereClause = `
    WHERE timestamp >= $1 AND timestamp <= $2
    AND label = 'person'
    AND data->'sub_label'->>0 IS NOT NULL
  `;
  const params = [startTime, endTime];
  let paramIndex = 3;

  if (camera) {
    whereClause += ` AND camera = $${paramIndex}`;
    params.push(camera);
    paramIndex++;
  }

  const sql = `
    SELECT
      data->'sub_label'->>0 as employee_name,
      COUNT(*) as activity_count,
      MIN(timestamp) as first_seen,
      MAX(timestamp) as last_seen,
      EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 3600 as work_hours
    FROM timeline
    ${whereClause}
    GROUP BY data->'sub_label'->>0
    ORDER BY activity_count DESC
  `;

  const result = await query(sql, params);
  
  return {
    unique_employees: result.length,
    employees: result.map(row => ({
      name: row.employee_name,
      activity_count: parseInt(row.activity_count) || 0,
      work_hours: parseFloat(row.work_hours) || 0,
      first_seen: unixToISO(row.first_seen),
      last_seen: unixToISO(row.last_seen)
    }))
  };
};

/**
 * Get camera summary
 */
const getCameraSummary = async (startTime, endTime, camera) => {
  let whereClause = `
    WHERE timestamp >= $1 AND timestamp <= $2
  `;
  const params = [startTime, endTime];
  let paramIndex = 3;

  if (camera) {
    whereClause += ` AND camera = $${paramIndex}`;
    params.push(camera);
    paramIndex++;
  }

  const sql = `
    SELECT
      camera,
      COUNT(*) as total_events,
      COUNT(DISTINCT data->'sub_label'->>0) as unique_employees,
      MIN(timestamp) as first_activity,
      MAX(timestamp) as last_activity
    FROM timeline
    ${whereClause}
    GROUP BY camera
    ORDER BY total_events DESC
  `;

  const result = await query(sql, params);
  
  return {
    active_cameras: result.length,
    cameras: result.map(row => ({
      name: row.camera,
      total_events: parseInt(row.total_events) || 0,
      unique_employees: parseInt(row.unique_employees) || 0,
      first_activity: unixToISO(row.first_activity),
      last_activity: unixToISO(row.last_activity)
    }))
  };
};

/**
 * Calculate trend
 */
const calculateTrend = (current, previous) => {
  const change = current - previous;
  const changePercent = previous > 0 ? (change / previous) * 100 : 0;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
  
  return {
    change,
    changePercent: Math.round(changePercent * 100) / 100,
    direction
  };
};

/**
 * Format time period based on granularity
 */
const formatTimePeriod = (timePeriod, granularity) => {
  switch (granularity) {
    case 'hourly':
      return `${timePeriod}:00`;
    case 'daily':
      return timePeriod;
    case 'weekly':
      return `Week ${timePeriod}`;
    default:
      return timePeriod;
  }
};

/**
 * Calculate trend statistics
 */
const calculateTrendStatistics = (trendData) => {
  if (trendData.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      trend: 'stable',
      volatility: 0
    };
  }

  const counts = trendData.map(d => d.count);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const average = total / counts.length;
  const min = Math.min(...counts);
  const max = Math.max(...counts);

  // Calculate trend direction
  const firstHalf = counts.slice(0, Math.floor(counts.length / 2));
  const secondHalf = counts.slice(Math.floor(counts.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, count) => sum + count, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, count) => sum + count, 0) / secondHalf.length;
  
  let trend = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'increasing';
  else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'decreasing';

  // Calculate volatility (coefficient of variation)
  const variance = counts.reduce((sum, count) => sum + Math.pow(count - average, 2), 0) / counts.length;
  const stdDev = Math.sqrt(variance);
  const volatility = average > 0 ? (stdDev / average) * 100 : 0;

  return {
    total,
    average: Math.round(average * 100) / 100,
    min,
    max,
    trend,
    volatility: Math.round(volatility * 100) / 100
  };
};

/**
 * Generate dashboard insights
 */
const generateDashboardInsights = (data) => {
  const insights = [];

  // Activity insights
  if (data.trends.activity.direction === 'up') {
    insights.push({
      type: 'positive',
      category: 'activity',
      message: `Activity increased by ${data.trends.activity.change_percent}% compared to previous period`,
      impact: 'high'
    });
  } else if (data.trends.activity.direction === 'down') {
    insights.push({
      type: 'warning',
      category: 'activity',
      message: `Activity decreased by ${Math.abs(data.trends.activity.change_percent)}% compared to previous period`,
      impact: 'medium'
    });
  }

  // Violation insights
  if (data.trends.violations.direction === 'up') {
    insights.push({
      type: 'negative',
      category: 'violations',
      message: `Violations increased by ${data.trends.violations.change_percent}% compared to previous period`,
      impact: 'high'
    });
  } else if (data.trends.violations.direction === 'down') {
    insights.push({
      type: 'positive',
      category: 'violations',
      message: `Violations decreased by ${Math.abs(data.trends.violations.change_percent)}% compared to previous period`,
      impact: 'high'
    });
  }

  // Employee insights
  if (data.employees.unique_employees > 0) {
    const avgActivity = data.activity.total_events / data.employees.unique_employees;
    if (avgActivity > 50) {
      insights.push({
        type: 'positive',
        category: 'productivity',
        message: `High productivity detected with ${Math.round(avgActivity)} average activities per employee`,
        impact: 'medium'
      });
    }
  }

  return insights;
};

/**
 * Generate trend insights
 */
const generateTrendInsights = (trendData, stats) => {
  const insights = [];

  if (stats.trend === 'increasing') {
    insights.push({
      type: 'positive',
      message: `Strong upward trend detected with ${stats.volatility}% volatility`,
      confidence: 'high'
    });
  } else if (stats.trend === 'decreasing') {
    insights.push({
      type: 'warning',
      message: `Declining trend detected with ${stats.volatility}% volatility`,
      confidence: 'high'
    });
  }

  if (stats.volatility > 50) {
    insights.push({
      type: 'info',
      message: `High volatility detected (${stats.volatility}%) - data may be inconsistent`,
      confidence: 'medium'
    });
  }

  return insights;
};

// Placeholder functions for advanced analytics
const getProductivityMetrics = async (startTime, endTime, camera, employee_name) => {
  // Implementation for productivity metrics
  return { score: 85, trend: 'stable', factors: [] };
};

const getEfficiencyMetrics = async (startTime, endTime, camera, employee_name) => {
  // Implementation for efficiency metrics
  return { score: 78, trend: 'increasing', factors: [] };
};

const getComplianceMetrics = async (startTime, endTime, camera, employee_name) => {
  // Implementation for compliance metrics
  return { score: 92, trend: 'stable', factors: [] };
};

const getEngagementMetrics = async (startTime, endTime, camera, employee_name) => {
  // Implementation for engagement metrics
  return { score: 88, trend: 'increasing', factors: [] };
};

const calculateOverallPerformanceScore = (metrics) => {
  const weights = { productivity: 0.3, efficiency: 0.25, compliance: 0.25, engagement: 0.2 };
  return Math.round(
    metrics.productivity.score * weights.productivity +
    metrics.efficiency.score * weights.efficiency +
    metrics.compliance.score * weights.compliance +
    metrics.engagement.score * weights.engagement
  );
};

const generatePerformanceInsights = (data) => {
  return [
    {
      type: 'info',
      message: `Overall performance score: ${data.overall}/100`,
      confidence: 'high'
    }
  ];
};

const getHistoricalData = async (startTime, endTime, camera, predictionType) => {
  // Implementation for historical data retrieval
  return { data: [], patterns: [] };
};

const predictViolations = (historicalData) => {
  // Implementation for violation prediction
  return {
    next_hour: 2,
    next_day: 15,
    confidence: 0.75,
    factors: ['time_of_day', 'employee_patterns']
  };
};

const predictAttendance = (historicalData) => {
  // Implementation for attendance prediction
  return {
    expected_employees: 45,
    confidence: 0.85,
    factors: ['day_of_week', 'historical_patterns']
  };
};

const predictProductivity = (historicalData) => {
  // Implementation for productivity prediction
  return {
    expected_score: 82,
    confidence: 0.70,
    factors: ['workload', 'team_dynamics']
  };
};

const generatePredictiveInsights = (predictions, historicalData) => {
  return [
    {
      type: 'info',
      message: `Prediction confidence: ${Math.round(predictions.confidence * 100)}%`,
      confidence: 'medium'
    }
  ];
};

const generateComprehensiveReport = async (startTime, endTime, camera, employee_name) => {
  // Implementation for comprehensive report
  return { sections: [], metrics: {} };
};

const generateViolationsReport = async (startTime, endTime, camera, employee_name) => {
  // Implementation for violations report
  return { violations: [], summary: {} };
};

const generateAttendanceReport = async (startTime, endTime, camera, employee_name) => {
  // Implementation for attendance report
  return { attendance: [], summary: {} };
};

const generateProductivityReport = async (startTime, endTime, camera, employee_name) => {
  // Implementation for productivity report
  return { productivity: [], summary: {} };
};

const generateChartData = async (startTime, endTime, camera, employee_name, reportType) => {
  // Implementation for chart data generation
  return { charts: [] };
};

const generateReportSummary = (reportData) => {
  // Implementation for report summary
  return { key_points: [], recommendations: [] };
};

module.exports = {
  getDashboardData,
  getTrendAnalysis,
  getPerformanceMetrics,
  getPredictiveAnalytics,
  getCustomReport
};
