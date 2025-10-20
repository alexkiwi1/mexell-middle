const { query } = require('../config/postgres');
const { unixToISO, unixToReadable, parseDateTimeRange } = require('./frigate.service');
const logger = require('../config/logger');

/**
 * Zones Service - Desk occupancy and zone analysis
 * 
 * Features:
 * - Desk occupancy tracking
 * - Zone utilization analysis
 * - Employee zone preferences
 * - Zone activity patterns
 * - Desk assignment optimization
 * - Zone efficiency metrics
 */

/**
 * Get desk occupancy analysis
 * @param {Object} filters - Query filters
 * @returns {Object} Desk occupancy data
 */
const getDeskOccupancy = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera, zone } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND class_type = 'entered_zone'
      AND label = 'person'
      AND data->'zones' IS NOT NULL
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    if (zone) {
      whereClause += ` AND $${paramIndex} = ANY(SELECT jsonb_array_elements_text(data->'zones'))`;
      params.push(zone);
      paramIndex++;
    }

    const sql = `
      SELECT
        camera,
        data->'zones' as zones,
        data->'sub_label'->>0 as employee_name,
        timestamp as entry_time,
        LEAD(timestamp) OVER (
          PARTITION BY data->'sub_label'->>0, camera 
          ORDER BY timestamp
        ) as exit_time,
        LAG(timestamp) OVER (
          PARTITION BY data->'sub_label'->>0, camera 
          ORDER BY timestamp
        ) as previous_entry
      FROM timeline
      ${whereClause}
      ORDER BY camera, timestamp
    `;

    const result = await query(sql, params);

    // Process desk occupancy data
    const occupancyData = {};
    const deskSessions = [];

    result.forEach(row => {
      const zones = row.zones || [];
      const employee = row.employee_name || 'Unknown';
      const camera = row.camera;

      // Process each zone for this entry
      zones.forEach(zoneName => {
        if (zoneName.startsWith('desk_')) {
          const deskKey = `${camera}_${zoneName}`;
          
          if (!occupancyData[deskKey]) {
            occupancyData[deskKey] = {
              camera,
              zone: zoneName,
              total_occupancy_time: 0,
              total_sessions: 0,
              unique_employees: new Set(),
              occupancy_sessions: [],
              utilization_rate: 0,
              average_session_duration: 0,
              most_frequent_employee: null,
              last_occupied: null
            };
          }

          // Calculate session duration
          let sessionDuration = 0;
          if (row.exit_time) {
            sessionDuration = (row.exit_time - row.entry_time) / 3600; // hours
          } else {
            // If no exit time, assume session until end of period
            sessionDuration = (endTime - row.entry_time) / 3600;
          }

          occupancyData[deskKey].total_occupancy_time += sessionDuration;
          occupancyData[deskKey].total_sessions++;
          occupancyData[deskKey].unique_employees.add(employee);
          occupancyData[deskKey].last_occupied = unixToISO(row.entry_time);

          occupancyData[deskKey].occupancy_sessions.push({
            employee,
            entry_time: unixToISO(row.entry_time),
            exit_time: row.exit_time ? unixToISO(row.exit_time) : null,
            duration_hours: sessionDuration,
            status: row.exit_time ? 'completed' : 'active'
          });

          deskSessions.push({
            camera,
            zone: zoneName,
            employee,
            entry_time: unixToISO(row.entry_time),
            exit_time: row.exit_time ? unixToISO(row.exit_time) : null,
            duration_hours: sessionDuration
          });
        }
      });
    });

    // Calculate utilization rates and other metrics
    const periodHours = (endTime - startTime) / 3600;
    const desks = Object.values(occupancyData).map(desk => {
      const utilizationRate = periodHours > 0 ? (desk.total_occupancy_time / periodHours) * 100 : 0;
      const averageSessionDuration = desk.total_sessions > 0 
        ? desk.total_occupancy_time / desk.total_sessions 
        : 0;

      // Find most frequent employee
      const employeeCounts = {};
      desk.occupancy_sessions.forEach(session => {
        employeeCounts[session.employee] = (employeeCounts[session.employee] || 0) + 1;
      });
      const mostFrequentEmployee = Object.entries(employeeCounts)
        .sort(([,a], [,b]) => b - a)[0];

      return {
        ...desk,
        unique_employees: Array.from(desk.unique_employees),
        utilization_rate: Math.round(utilizationRate * 100) / 100,
        average_session_duration: Math.round(averageSessionDuration * 100) / 100,
        most_frequent_employee: mostFrequentEmployee ? mostFrequentEmployee[0] : null,
        efficiency_score: calculateDeskEfficiency(desk, periodHours),
        occupancy_trend: analyzeOccupancyTrend(desk.occupancy_sessions)
      };
    });

    return {
      desks,
      total_desks: desks.length,
      total_occupancy_time: desks.reduce((sum, desk) => sum + desk.total_occupancy_time, 0),
      average_utilization: desks.length > 0 
        ? desks.reduce((sum, desk) => sum + desk.utilization_rate, 0) / desks.length 
        : 0,
      period_hours: periodHours,
      sessions: deskSessions,
      insights: generateOccupancyInsights(desks)
    };

  } catch (error) {
    logger.error('Error in getDeskOccupancy:', error);
    throw error;
  }
};

/**
 * Get zone utilization analysis
 * @param {Object} filters - Query filters
 * @returns {Object} Zone utilization data
 */
const getZoneUtilization = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND label = 'person'
      AND data->'zones' IS NOT NULL
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
        data->'zones' as zones,
        data->'sub_label'->>0 as employee_name,
        class_type,
        timestamp,
        COUNT(*) OVER (PARTITION BY data->'zones', camera) as zone_activity_count
      FROM timeline
      ${whereClause}
      ORDER BY camera, data->'zones', timestamp
    `;

    const result = await query(sql, params);

    // Process zone utilization data
    const zoneData = {};
    
    result.forEach(row => {
      const zones = row.zones || [];
      const employee = row.employee_name || 'Unknown';
      const camera = row.camera;
      const classType = row.class_type;

      zones.forEach(zoneName => {
        const zoneKey = `${camera}_${zoneName}`;
        
        if (!zoneData[zoneKey]) {
          zoneData[zoneKey] = {
            camera,
            zone: zoneName,
            total_entries: 0,
            total_exits: 0,
            unique_employees: new Set(),
            entry_times: [],
            exit_times: [],
            activity_count: parseInt(row.zone_activity_count) || 0,
            utilization_score: 0,
            popularity_rank: 0
          };
        }

        if (classType === 'entered_zone') {
          zoneData[zoneKey].total_entries++;
          zoneData[zoneKey].entry_times.push({
            employee,
            timestamp: unixToISO(row.timestamp),
            time_of_day: new Date(row.timestamp * 1000).getHours()
          });
        } else if (classType === 'left_zone') {
          zoneData[zoneKey].total_exits++;
          zoneData[zoneKey].exit_times.push({
            employee,
            timestamp: unixToISO(row.timestamp),
            time_of_day: new Date(row.timestamp * 1000).getHours()
          });
        }

        zoneData[zoneKey].unique_employees.add(employee);
      });
    });

    // Calculate utilization metrics
    const zones = Object.values(zoneData).map(zone => {
      const utilizationScore = calculateZoneUtilizationScore(zone);
      const peakHours = findZonePeakHours(zone.entry_times);
      const employeeDiversity = zone.unique_employees.size;
      
      return {
        ...zone,
        unique_employees: Array.from(zone.unique_employees),
        utilization_score: utilizationScore,
        peak_hours: peakHours,
        employee_diversity: employeeDiversity,
        activity_intensity: calculateActivityIntensity(zone),
        zone_type: categorizeZone(zone.zone),
        efficiency_rating: calculateZoneEfficiency(zone)
      };
    });

    // Sort by utilization score and assign popularity rank
    zones.sort((a, b) => b.utilization_score - a.utilization_score);
    zones.forEach((zone, index) => {
      zone.popularity_rank = index + 1;
    });

    return {
      zones,
      total_zones: zones.length,
      most_popular_zone: zones[0] || null,
      least_popular_zone: zones[zones.length - 1] || null,
      average_utilization: zones.length > 0 
        ? zones.reduce((sum, zone) => sum + zone.utilization_score, 0) / zones.length 
        : 0,
      insights: generateZoneInsights(zones)
    };

  } catch (error) {
    logger.error('Error in getZoneUtilization:', error);
    throw error;
  }
};

/**
 * Get employee zone preferences
 * @param {Object} filters - Query filters
 * @returns {Object} Employee zone preference data
 */
const getEmployeeZonePreferences = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, employee_name, camera } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND label = 'person'
      AND data->'zones' IS NOT NULL
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
        class_type,
        timestamp,
        COUNT(*) OVER (PARTITION BY data->'sub_label'->>0, data->'zones') as zone_visit_count
      FROM timeline
      ${whereClause}
      ORDER BY data->'sub_label'->>0, timestamp
    `;

    const result = await query(sql, params);

    // Process employee zone preferences
    const employeeData = {};
    
    result.forEach(row => {
      const employee = row.employee_name || 'Unknown';
      const zones = row.zones || [];
      const camera = row.camera;
      const classType = row.class_type;

      if (!employeeData[employee]) {
        employeeData[employee] = {
          employee_name: employee,
          zone_preferences: {},
          total_zone_visits: 0,
          preferred_zones: [],
          zone_diversity: 0,
          mobility_score: 0,
          zone_loyalty: 0
        };
      }

      zones.forEach(zoneName => {
        const zoneKey = `${camera}_${zoneName}`;
        
        if (!employeeData[employee].zone_preferences[zoneKey]) {
          employeeData[employee].zone_preferences[zoneKey] = {
            camera,
            zone: zoneName,
            visits: 0,
            total_time: 0,
            last_visit: null,
            first_visit: null,
            preference_score: 0
          };
        }

        if (classType === 'entered_zone') {
          employeeData[employee].zone_preferences[zoneKey].visits++;
          employeeData[employee].zone_preferences[zoneKey].last_visit = unixToISO(row.timestamp);
          if (!employeeData[employee].zone_preferences[zoneKey].first_visit) {
            employeeData[employee].zone_preferences[zoneKey].first_visit = unixToISO(row.timestamp);
          }
        }

        employeeData[employee].total_zone_visits++;
      });
    });

    // Calculate preferences and metrics
    const employees = Object.values(employeeData).map(emp => {
      const zoneCount = Object.keys(emp.zone_preferences).length;
      const zoneValues = Object.values(emp.zone_preferences);
      
      // Calculate preference scores
      zoneValues.forEach(zone => {
        zone.preference_score = calculateZonePreferenceScore(zone, emp.total_zone_visits);
      });

      // Sort zones by preference score
      const sortedZones = zoneValues.sort((a, b) => b.preference_score - a.preference_score);
      
      return {
        ...emp,
        preferred_zones: sortedZones.slice(0, 5).map(z => ({
          zone: z.zone,
          camera: z.camera,
          visits: z.visits,
          preference_score: z.preference_score,
          last_visit: z.last_visit
        })),
        zone_diversity: zoneCount,
        mobility_score: calculateMobilityScore(zoneValues),
        zone_loyalty: calculateZoneLoyalty(sortedZones),
        zone_consistency: calculateZoneConsistency(zoneValues)
      };
    });

    return {
      employees,
      total_employees: employees.length,
      average_zone_diversity: employees.length > 0 
        ? employees.reduce((sum, emp) => sum + emp.zone_diversity, 0) / employees.length 
        : 0,
      insights: generateZonePreferenceInsights(employees)
    };

  } catch (error) {
    logger.error('Error in getEmployeeZonePreferences:', error);
    throw error;
  }
};

/**
 * Get zone activity patterns
 * @param {Object} filters - Query filters
 * @returns {Object} Zone activity pattern data
 */
const getZoneActivityPatterns = async (filters = {}) => {
  try {
    const { start_date, end_date, hours, camera, zone } = filters;
    const { startTime, endTime } = parseDateTimeRange(start_date, end_date, hours);

    let whereClause = `
      WHERE timestamp >= $1 AND timestamp <= $2
      AND label = 'person'
      AND data->'zones' IS NOT NULL
    `;
    const params = [startTime, endTime];
    let paramIndex = 3;

    if (camera) {
      whereClause += ` AND camera = $${paramIndex}`;
      params.push(camera);
      paramIndex++;
    }

    if (zone) {
      whereClause += ` AND $${paramIndex} = ANY(SELECT jsonb_array_elements_text(data->'zones'))`;
      params.push(zone);
      paramIndex++;
    }

    const sql = `
      SELECT
        camera,
        data->'zones' as zones,
        EXTRACT(HOUR FROM FROM_UNIXTIME(timestamp)) as hour_of_day,
        EXTRACT(DOW FROM FROM_UNIXTIME(timestamp)) as day_of_week,
        COUNT(*) as activity_count
      FROM timeline
      ${whereClause}
      GROUP BY camera, data->'zones', 
               EXTRACT(HOUR FROM FROM_UNIXTIME(timestamp)), 
               EXTRACT(DOW FROM FROM_UNIXTIME(timestamp))
      ORDER BY camera, data->'zones', hour_of_day, day_of_week
    `;

    const result = await query(sql, params);

    // Process zone activity patterns
    const patternData = {};
    
    result.forEach(row => {
      const zones = row.zones || [];
      const camera = row.camera;
      const hour = parseInt(row.hour_of_day);
      const day = parseInt(row.day_of_week);
      const activityCount = parseInt(row.activity_count) || 0;

      zones.forEach(zoneName => {
        const zoneKey = `${camera}_${zoneName}`;
        
        if (!patternData[zoneKey]) {
          patternData[zoneKey] = {
            camera,
            zone: zoneName,
            hourly_patterns: {},
            daily_patterns: {},
            peak_hours: [],
            peak_days: [],
            activity_trends: {},
            utilization_patterns: {}
          };
        }

        // Hourly patterns
        if (!patternData[zoneKey].hourly_patterns[hour]) {
          patternData[zoneKey].hourly_patterns[hour] = 0;
        }
        patternData[zoneKey].hourly_patterns[hour] += activityCount;

        // Daily patterns
        if (!patternData[zoneKey].daily_patterns[day]) {
          patternData[zoneKey].daily_patterns[day] = 0;
        }
        patternData[zoneKey].daily_patterns[day] += activityCount;
      });
    });

    // Calculate patterns and insights
    const zones = Object.values(patternData).map(zone => {
      const hourlyValues = Object.values(zone.hourly_patterns);
      const dailyValues = Object.values(zone.daily_patterns);
      
      return {
        ...zone,
        peak_hours: findZonePeakHours(zone.hourly_patterns),
        peak_days: findZonePeakDays(zone.daily_patterns),
        activity_consistency: calculateActivityConsistency(hourlyValues),
        utilization_trends: analyzeUtilizationTrends(zone.hourly_patterns),
        zone_type: categorizeZone(zone.zone),
        efficiency_rating: calculateZoneEfficiency(zone)
      };
    });

    return {
      zones,
      total_zones: zones.length,
      insights: generateZonePatternInsights(zones)
    };

  } catch (error) {
    logger.error('Error in getZoneActivityPatterns:', error);
    throw error;
  }
};

// Helper functions

/**
 * Calculate desk efficiency
 */
const calculateDeskEfficiency = (desk, periodHours) => {
  const utilizationRate = periodHours > 0 ? (desk.total_occupancy_time / periodHours) * 100 : 0;
  const employeeDiversity = desk.unique_employees.size;
  const sessionEfficiency = desk.total_sessions > 0 ? desk.total_occupancy_time / desk.total_sessions : 0;
  
  const efficiency = (utilizationRate * 0.4) + (employeeDiversity * 10 * 0.3) + (Math.min(sessionEfficiency, 8) * 10 * 0.3);
  return Math.round(Math.min(efficiency, 100));
};

/**
 * Analyze occupancy trend
 */
const analyzeOccupancyTrend = (sessions) => {
  if (sessions.length < 2) return 'stable';
  
  const recentSessions = sessions.slice(-5);
  const olderSessions = sessions.slice(0, -5);
  
  if (recentSessions.length === 0 || olderSessions.length === 0) return 'stable';
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + s.duration_hours, 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum, s) => sum + s.duration_hours, 0) / olderSessions.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
};

/**
 * Calculate zone utilization score
 */
const calculateZoneUtilizationScore = (zone) => {
  const entryExitRatio = zone.total_exits > 0 ? zone.total_entries / zone.total_exits : zone.total_entries;
  const employeeDiversity = zone.unique_employees.size;
  const activityIntensity = zone.activity_count;
  
  const score = (entryExitRatio * 30) + (employeeDiversity * 20) + (Math.min(activityIntensity / 10, 50));
  return Math.round(Math.min(score, 100));
};

/**
 * Find zone peak hours
 */
const findZonePeakHours = (entryTimes) => {
  const hourlyCounts = {};
  entryTimes.forEach(entry => {
    hourlyCounts[entry.time_of_day] = (hourlyCounts[entry.time_of_day] || 0) + 1;
  });
  
  const sorted = Object.entries(hourlyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  return sorted.map(([hour, count]) => ({ hour: parseInt(hour), entries: count }));
};

/**
 * Calculate activity intensity
 */
const calculateActivityIntensity = (zone) => {
  const totalActivity = zone.total_entries + zone.total_exits;
  const timeSpan = zone.entry_times.length > 0 ? 
    (new Date(zone.entry_times[zone.entry_times.length - 1].timestamp).getTime() - 
     new Date(zone.entry_times[0].timestamp).getTime()) / (1000 * 60 * 60) : 1;
  
  return Math.round(totalActivity / timeSpan);
};

/**
 * Categorize zone type
 */
const categorizeZone = (zoneName) => {
  if (zoneName.startsWith('desk_')) return 'workstation';
  if (zoneName.includes('meeting')) return 'meeting_room';
  if (zoneName.includes('break')) return 'break_area';
  if (zoneName.includes('reception')) return 'reception';
  if (zoneName.includes('admin')) return 'admin_area';
  return 'general';
};

/**
 * Calculate zone efficiency
 */
const calculateZoneEfficiency = (zone) => {
  const utilizationScore = zone.utilization_score;
  const activityIntensity = zone.activity_intensity;
  const employeeDiversity = zone.employee_diversity;
  
  const efficiency = (utilizationScore * 0.5) + (Math.min(activityIntensity / 2, 25) * 0.3) + (employeeDiversity * 5 * 0.2);
  return Math.round(Math.min(efficiency, 100));
};

/**
 * Calculate zone preference score
 */
const calculateZonePreferenceScore = (zone, totalVisits) => {
  const visitFrequency = totalVisits > 0 ? (zone.visits / totalVisits) * 100 : 0;
  const recency = zone.last_visit ? 
    (Date.now() - new Date(zone.last_visit).getTime()) / (1000 * 60 * 60 * 24) : 365;
  const recencyScore = Math.max(0, 100 - (recency / 30) * 10);
  
  return Math.round((visitFrequency * 0.7) + (recencyScore * 0.3));
};

/**
 * Calculate mobility score
 */
const calculateMobilityScore = (zones) => {
  const totalZones = zones.length;
  const totalVisits = zones.reduce((sum, zone) => sum + zone.visits, 0);
  const averageVisitsPerZone = totalZones > 0 ? totalVisits / totalZones : 0;
  
  const mobility = (totalZones * 20) + (Math.min(averageVisitsPerZone, 10) * 5);
  return Math.round(Math.min(mobility, 100));
};

/**
 * Calculate zone loyalty
 */
const calculateZoneLoyalty = (sortedZones) => {
  if (sortedZones.length === 0) return 0;
  
  const topZone = sortedZones[0];
  const totalVisits = sortedZones.reduce((sum, zone) => sum + zone.visits, 0);
  const loyalty = totalVisits > 0 ? (topZone.visits / totalVisits) * 100 : 0;
  
  return Math.round(loyalty);
};

/**
 * Calculate zone consistency
 */
const calculateZoneConsistency = (zones) => {
  if (zones.length < 2) return 100;
  
  const visits = zones.map(z => z.visits);
  const mean = visits.reduce((a, b) => a + b, 0) / visits.length;
  const variance = visits.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / visits.length;
  const stdDev = Math.sqrt(variance);
  
  const consistency = Math.max(0, 100 - (stdDev / mean) * 100);
  return Math.round(consistency);
};

/**
 * Find zone peak days
 */
const findZonePeakDays = (dailyPatterns) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const sorted = Object.entries(dailyPatterns)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);
  
  return sorted.map(([day, count]) => ({ 
    day: days[parseInt(day)], 
    activity: count 
  }));
};

/**
 * Analyze utilization trends
 */
const analyzeUtilizationTrends = (hourlyPatterns) => {
  const morning = [6, 7, 8, 9, 10, 11].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const afternoon = [12, 13, 14, 15, 16, 17].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  const evening = [18, 19, 20, 21, 22, 23].reduce((sum, h) => sum + (hourlyPatterns[h] || 0), 0);
  
  const total = morning + afternoon + evening;
  if (total === 0) return 'unknown';
  
  if (morning > afternoon && morning > evening) return 'morning_peak';
  if (afternoon > morning && afternoon > evening) return 'afternoon_peak';
  if (evening > morning && evening > afternoon) return 'evening_peak';
  return 'balanced';
};

/**
 * Generate occupancy insights
 */
const generateOccupancyInsights = (desks) => {
  const totalDesks = desks.length;
  if (totalDesks === 0) return {};

  const highUtilization = desks.filter(d => d.utilization_rate > 80).length;
  const lowUtilization = desks.filter(d => d.utilization_rate < 20).length;
  const averageUtilization = desks.reduce((sum, d) => sum + d.utilization_rate, 0) / totalDesks;

  return {
    total_desks: totalDesks,
    utilization_distribution: {
      high: Math.round((highUtilization / totalDesks) * 100),
      medium: Math.round(((totalDesks - highUtilization - lowUtilization) / totalDesks) * 100),
      low: Math.round((lowUtilization / totalDesks) * 100)
    },
    average_utilization: Math.round(averageUtilization * 100) / 100,
    efficiency_insights: {
      most_efficient: desks.sort((a, b) => b.efficiency_score - a.efficiency_score)[0],
      least_efficient: desks.sort((a, b) => a.efficiency_score - b.efficiency_score)[0]
    }
  };
};

/**
 * Generate zone insights
 */
const generateZoneInsights = (zones) => {
  const totalZones = zones.length;
  if (totalZones === 0) return {};

  const zoneTypes = {};
  zones.forEach(zone => {
    zoneTypes[zone.zone_type] = (zoneTypes[zone.zone_type] || 0) + 1;
  });

  return {
    total_zones: totalZones,
    zone_type_distribution: zoneTypes,
    average_utilization: Math.round(
      zones.reduce((sum, z) => sum + z.utilization_score, 0) / totalZones * 100
    ) / 100,
    most_active_zone: zones[0] || null,
    least_active_zone: zones[zones.length - 1] || null
  };
};

/**
 * Generate zone preference insights
 */
const generateZonePreferenceInsights = (employees) => {
  const totalEmployees = employees.length;
  if (totalEmployees === 0) return {};

  const averageDiversity = employees.reduce((sum, emp) => sum + emp.zone_diversity, 0) / totalEmployees;
  const highMobility = employees.filter(emp => emp.mobility_score > 70).length;
  const highLoyalty = employees.filter(emp => emp.zone_loyalty > 80).length;

  return {
    total_employees: totalEmployees,
    average_zone_diversity: Math.round(averageDiversity * 100) / 100,
    mobility_distribution: {
      high: Math.round((highMobility / totalEmployees) * 100),
      medium: Math.round(((totalEmployees - highMobility) / totalEmployees) * 100)
    },
    loyalty_distribution: {
      high: Math.round((highLoyalty / totalEmployees) * 100),
      medium: Math.round(((totalEmployees - highLoyalty) / totalEmployees) * 100)
    }
  };
};

/**
 * Generate zone pattern insights
 */
const generateZonePatternInsights = (zones) => {
  const totalZones = zones.length;
  if (totalZones === 0) return {};

  const morningPeaks = zones.filter(z => z.utilization_trends === 'morning_peak').length;
  const afternoonPeaks = zones.filter(z => z.utilization_trends === 'afternoon_peak').length;
  const eveningPeaks = zones.filter(z => z.utilization_trends === 'evening_peak').length;

  return {
    total_zones: totalZones,
    peak_time_distribution: {
      morning: Math.round((morningPeaks / totalZones) * 100),
      afternoon: Math.round((afternoonPeaks / totalZones) * 100),
      evening: Math.round((eveningPeaks / totalZones) * 100),
      balanced: Math.round(((totalZones - morningPeaks - afternoonPeaks - eveningPeaks) / totalZones) * 100)
    },
    average_consistency: Math.round(
      zones.reduce((sum, z) => sum + z.activity_consistency, 0) / totalZones
    )
  };
};

module.exports = {
  getDeskOccupancy,
  getZoneUtilization,
  getEmployeeZonePreferences,
  getZoneActivityPatterns
};
