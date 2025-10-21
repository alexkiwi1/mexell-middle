const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'Employee Tracking API Documentation',
    description: 'Comprehensive employee monitoring and analytics API providing work hours tracking, break analysis, attendance management, zone utilization, and predictive analytics capabilities.',
    version,
    contact: {
      name: 'API Support',
      email: 'support@mexell.com'
    },
    license: {
      name: 'MIT',
      url: 'https://github.com/hagopj13/node-express-boilerplate/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `http://10.100.6.2:5002/v1`,
      description: 'Production Server'
    },
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development Server'
    },
  ],
};

module.exports = swaggerDef;
