const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();

// Create a simple working Swagger spec
const specs = {
  ...swaggerDefinition,
  paths: {
    '/health': {
      get: {
        summary: 'Health Check',
        description: 'Check API health and database connectivity',
        tags: ['Frigate Surveillance'],
        responses: {
          200: {
            description: 'API is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'All services healthy' },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'healthy' },
                        timestamp: { type: 'string', format: 'date-time' },
                        uptime: { type: 'number', example: 450.67 },
                        responseTime: { type: 'string', example: '1013ms' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cameras': {
      get: {
        summary: 'List All Cameras',
        description: 'Get list of all available cameras',
        tags: ['Frigate Surveillance'],
        responses: {
          200: {
            description: 'Cameras retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Cameras retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        cameras: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'employees_01' },
                              status: { type: 'string', example: 'active' },
                              resolution: { type: 'string', example: '3840x2160' },
                              fps: { type: 'number', example: 8 }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/cameras/summary': {
      get: {
        summary: 'Camera Summary (All)',
        description: 'Get summary of all cameras with activity metrics',
        tags: ['Frigate Surveillance'],
        parameters: [
          {
            in: 'query',
            name: 'start_date',
            schema: { type: 'string', format: 'date' },
            description: 'Start date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'end_date',
            schema: { type: 'string', format: 'date' },
            description: 'End date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'hours',
            schema: { type: 'integer', default: 24 },
            description: 'Hours to look back (fallback if no dates)',
            example: 24
          }
        ],
        responses: {
          200: {
            description: 'Camera summary retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Camera summary retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        cameras: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              name: { type: 'string', example: 'employees_01' },
                              status: { type: 'string', example: 'active' },
                              violations: { type: 'integer', example: 15 },
                              activity: { type: 'integer', example: 42 },
                              lastSeen: { type: 'string', format: 'date-time', example: '2025-10-02T16:31:49.907Z' }
                            }
                          }
                        },
                        totalCameras: { type: 'integer', example: 12 },
                        totalViolations: { type: 'integer', example: 156 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/employees/work-hours': {
      get: {
        summary: 'Get Employee Work Hours',
        description: 'Get work hours analysis for employees',
        tags: ['Employees'],
        parameters: [
          {
            in: 'query',
            name: 'start_date',
            schema: { type: 'string', format: 'date' },
            description: 'Start date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'end_date',
            schema: { type: 'string', format: 'date' },
            description: 'End date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'hours',
            schema: { type: 'integer', default: 24 },
            description: 'Hours to look back (fallback if no dates)',
            example: 24
          },
          {
            in: 'query',
            name: 'employee_name',
            schema: { type: 'string' },
            description: 'Filter by specific employee name',
            example: 'Muhammad Taha'
          },
          {
            in: 'query',
            name: 'camera',
            schema: { type: 'string' },
            description: 'Filter by specific camera',
            example: 'employees_01'
          }
        ],
        responses: {
          200: {
            description: 'Work hours data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Employee work hours retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        employees: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              employee_name: { type: 'string', example: 'Muhammad Taha' },
                              total_work_hours: { type: 'number', example: 8.5 },
                              productivity_score: { type: 'integer', example: 85 },
                              attendance_status: { type: 'string', example: 'full_day' }
                            }
                          }
                        },
                        total_employees: { type: 'integer', example: 45 },
                        total_work_hours: { type: 'number', example: 382.5 }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/analytics/dashboard': {
      get: {
        summary: 'Get Comprehensive Dashboard',
        description: 'Get comprehensive dashboard with overview, trends, and insights',
        tags: ['Analytics'],
        parameters: [
          {
            in: 'query',
            name: 'start_date',
            schema: { type: 'string', format: 'date' },
            description: 'Start date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'end_date',
            schema: { type: 'string', format: 'date' },
            description: 'End date (YYYY-MM-DD)',
            example: '2025-10-02'
          },
          {
            in: 'query',
            name: 'hours',
            schema: { type: 'integer', default: 24 },
            description: 'Hours to look back (fallback if no dates)',
            example: 24
          },
          {
            in: 'query',
            name: 'camera',
            schema: { type: 'string' },
            description: 'Filter by specific camera',
            example: 'employees_01'
          }
        ],
        responses: {
          200: {
            description: 'Dashboard data retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Dashboard data retrieved successfully' },
                    data: {
                      type: 'object',
                      properties: {
                        overview: {
                          type: 'object',
                          properties: {
                            total_activity: { type: 'integer', example: 1250 },
                            total_violations: { type: 'integer', example: 15 },
                            active_employees: { type: 'integer', example: 45 },
                            active_cameras: { type: 'integer', example: 12 }
                          }
                        },
                        trends: {
                          type: 'object',
                          properties: {
                            activity: {
                              type: 'object',
                              properties: {
                                current: { type: 'integer', example: 1250 },
                                previous: { type: 'integer', example: 1100 },
                                change_percent: { type: 'number', example: 13.64 },
                                direction: { type: 'string', example: 'up' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

console.log('Swagger specs generated with', Object.keys(specs.paths || {}).length, 'paths');

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

// Serve the JSON specification
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

module.exports = router;
