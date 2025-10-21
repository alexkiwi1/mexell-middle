const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();

// Configure swagger-jsdoc to automatically discover JSDoc annotations
const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [
    './src/routes/v1/*.route.js',
    './src/docs/components.yml'
  ]
});

console.log('Swagger specs generated with', Object.keys(specs.paths || {}).length, 'paths');

router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Employee Tracking API Documentation'
  })
);

// Serve the JSON specification
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Serve simple HTML documentation
router.get('/simple', (req, res) => {
  res.sendFile('swagger-simple.html', { root: 'public' });
});

// Serve comprehensive static documentation
router.get('/complete', (req, res) => {
  res.sendFile('api-docs.html', { root: 'public' });
});

module.exports = router;
