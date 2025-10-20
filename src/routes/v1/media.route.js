const express = require('express');
const { getRecentClips, testMediaUrls } = require('../../controllers/media.controller');

const router = express.Router();

// Get recent clips
router.get('/api/recent-media/clips', getRecentClips);

// Test media URLs
router.get('/api/recent-media/test-media', testMediaUrls);

module.exports = router;

