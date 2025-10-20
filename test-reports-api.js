const express = require('express');
const app = express();
const port = 5003;

// Simple test endpoint
app.get('/api/reports/types', (req, res) => {
  res.json({
    success: true,
    message: 'Report types retrieved successfully',
    data: {
      report_types: ['employee_summary', 'violation_report', 'attendance_report', 'productivity_report', 'comprehensive_dashboard'],
      report_formats: ['json', 'csv', 'pdf', 'xlsx'],
      descriptions: {
        employee_summary: 'Detailed employee work hours, productivity, and attendance report',
        violation_report: 'Cell phone violations with media URLs and analysis',
        attendance_report: 'Employee attendance patterns and statistics',
        productivity_report: 'Productivity metrics and performance analysis',
        comprehensive_dashboard: 'Complete dashboard with all metrics and insights'
      }
    }
  });
});

// Test employee report endpoint
app.get('/api/reports/employee', (req, res) => {
  const reportId = 'test-report-' + Date.now();
  const baseUrl = 'http://localhost:5003';
  
  res.json({
    success: true,
    message: 'Employee report generated successfully',
    data: {
      report: {
        report_id: reportId,
        report_type: 'employee_summary',
        generated_at: new Date().toISOString(),
        timezone: req.query.timezone || 'UTC',
        summary: {
          total_employees: 56,
          total_work_hours: 202.38,
          average_work_hours: 3.61,
          total_violations: 25,
          average_productivity: 68.5,
          attendance_rate: 80.36
        },
        employees: [
          {
            employee_name: 'Arbaz',
            total_work_hours: 7.71,
            arrival_time: '2025-10-20T09:50:31+05:00',
            departure_time: '2025-10-20T22:01:26+05:00',
            productivity_score: 98,
            attendance_status: 'half_day',
            media_urls: {
              profile_snapshot: `${baseUrl}/media/snapshots/employees_05/profile.jpg`,
              work_session_videos: [`${baseUrl}/media/recordings/2025-10-20/09/employees_05/session.mp4`],
              violation_media: []
            }
          }
        ],
        charts: {
          productivity_trend: [
            { employee: 'Arbaz', productivity: 98, work_hours: 7.71 }
          ]
        },
        insights: {
          productivity_insights: ['Overall productivity is within acceptable range'],
          violation_insights: ['Cell phone violations are decreasing trend'],
          attendance_insights: ['Attendance rate is above 80%']
        },
        recommendations: {
          immediate_actions: ['Address high-violation employees'],
          long_term_strategies: ['Employee training programs']
        }
      },
      download_urls: {
        json: `${baseUrl}/api/reports/download/${reportId}.json`,
        csv: `${baseUrl}/api/reports/download/${reportId}.csv`,
        pdf: `${baseUrl}/api/reports/download/${reportId}.pdf`,
        excel: `${baseUrl}/api/reports/download/${reportId}.xlsx`
      },
      report_metadata: {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        file_size: 1024,
        download_count: 0
      }
    }
  });
});

// Test violation report endpoint
app.get('/api/reports/violations', (req, res) => {
  const reportId = 'violation-report-' + Date.now();
  const baseUrl = 'http://localhost:5003';
  
  res.json({
    success: true,
    message: 'Violation report generated successfully',
    data: {
      report: {
        report_id: reportId,
        report_type: 'violation_report',
        generated_at: new Date().toISOString(),
        timezone: req.query.timezone || 'UTC',
        summary: {
          total_violations: 25,
          by_severity: { high: 15, medium: 7, low: 3 },
          by_employee: { 'Arbaz': 5, 'Ali Habib': 3 },
          by_camera: { 'employees_01': 8, 'employees_02': 6 },
          most_violated_employee: 'Arbaz',
          most_violated_camera: 'employees_01'
        },
        violations: [
          {
            id: 'violation_123',
            timestamp: '2025-10-20T14:30:15+05:00',
            camera: 'employees_01',
            employee_name: 'Arbaz',
            assigned_employee: 'Arbaz',
            confidence: 'high',
            zones: ['desk_42'],
            media_urls: {
              snapshot: `${baseUrl}/media/snapshots/employees_01/2025-10-20/14:30:15.jpg`,
              thumbnail: `${baseUrl}/media/thumbnails/employees_01/2025-10-20/14:30:15.jpg`,
              video: `${baseUrl}/media/recordings/2025-10-20/14/employees_01/30.15.mp4`
            },
            assignment_confidence: 'high',
            assignment_method: 'face_recognition'
          }
        ],
        trends: {
          daily_violations: [
            { date: '2025-10-20', count: 25, severity_breakdown: { high: 15, medium: 7, low: 3 } }
          ],
          hourly_violations: [
            { hour: 14, count: 8 },
            { hour: 16, count: 12 }
          ]
        },
        insights: [
          'Cell phone violations are decreasing trend',
          'Certain employees need additional training',
          'Peak violation times identified'
        ],
        recommendations: [
          'Implement additional training for high-violation employees',
          'Review break time policies',
          'Consider zone-specific monitoring'
        ]
      },
      download_urls: {
        json: `${baseUrl}/api/reports/download/${reportId}.json`,
        csv: `${baseUrl}/api/reports/download/${reportId}.csv`,
        pdf: `${baseUrl}/api/reports/download/${reportId}.pdf`,
        excel: `${baseUrl}/api/reports/download/${reportId}.xlsx`
      },
      report_metadata: {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        file_size: 2048,
        download_count: 0
      }
    }
  });
});

// Test comprehensive report endpoint
app.get('/api/reports/comprehensive', (req, res) => {
  const reportId = 'comprehensive-report-' + Date.now();
  const baseUrl = 'http://localhost:5003';
  
  res.json({
    success: true,
    message: 'Comprehensive report generated successfully',
    data: {
      report: {
        report_id: reportId,
        report_type: 'comprehensive_dashboard',
        generated_at: new Date().toISOString(),
        timezone: req.query.timezone || 'UTC',
        executive_summary: {
          total_employees: 56,
          total_work_hours: 202.38,
          average_productivity: 68.5,
          total_violations: 25,
          attendance_rate: 80.36,
          system_health: 'healthy'
        },
        employee_analytics: {
          work_hours: { total_employees: 56, total_work_hours: 202.38 },
          break_time: { total_employees: 45, total_break_time: 89.23 },
          top_performers: [
            { employee_name: 'Arbaz', productivity_score: 98, work_hours: 7.71, violations: 0 }
          ],
          underperformers: [
            { employee_name: 'Arsalan Khan', productivity_score: 32, work_hours: 0.49, violations: 2 }
          ]
        },
        violation_analytics: {
          total_violations: 25,
          trends: {
            daily: [{ date: '2025-10-20', count: 25 }],
            hourly: [{ hour: 14, count: 8 }]
          },
          hotspots: [
            { camera: 'employees_01', violations: 8, zone: 'desk_42' }
          ]
        },
        camera_analytics: {
          total_cameras: 11,
          active_cameras: 10,
          offline_cameras: 1,
          performance_metrics: {
            average_uptime: 99.5,
            total_events: 1250
          }
        },
        insights: {
          productivity_insights: ['Overall productivity is within acceptable range'],
          violation_insights: ['Cell phone violations are decreasing trend'],
          attendance_insights: ['Attendance rate is above 80%'],
          system_insights: ['System performance is optimal']
        },
        recommendations: {
          immediate_actions: ['Address high-violation employees'],
          long_term_strategies: ['Employee training programs'],
          system_improvements: ['Optimize camera positioning']
        },
        charts: {
          productivity_dashboard: { data: [] },
          violation_dashboard: { data: [] },
          attendance_dashboard: { data: [] },
          camera_dashboard: { data: [] }
        }
      },
      download_urls: {
        json: `${baseUrl}/api/reports/download/${reportId}.json`,
        csv: `${baseUrl}/api/reports/download/${reportId}.csv`,
        pdf: `${baseUrl}/api/reports/download/${reportId}.pdf`,
        excel: `${baseUrl}/api/reports/download/${reportId}.xlsx`
      },
      report_metadata: {
        report_id: reportId,
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        file_size: 4096,
        download_count: 0
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Test Reports API running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log('- GET /api/reports/types');
  console.log('- GET /api/reports/employee');
  console.log('- GET /api/reports/violations');
  console.log('- GET /api/reports/comprehensive');
});

