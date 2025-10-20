const express = require('express');
const { healthCheck, root, apiInfo } = require('../../controllers/health.controller');

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Root endpoint
router.get('/', root);

// API info endpoint
router.get('/api/info', apiInfo);

module.exports = router;
