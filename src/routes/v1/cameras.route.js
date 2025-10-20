const express = require('express');
const camerasController = require('../../controllers/cameras.controller');

const router = express.Router();

// Phase 1 endpoints (basic camera listing)
router.get('/api/cameras/list', camerasController.listCameras);

// Phase 2 endpoints (camera monitoring)
router.get('/api/cameras/summary', camerasController.getCameraSummaryController);
router.get('/api/cameras/:camera_name/summary', camerasController.getCameraSummaryByIdController);
router.get('/api/cameras/:camera_name/activity', camerasController.getCameraActivityController);
router.get('/api/cameras/:camera_name/status', camerasController.getCameraStatusController);
router.get('/api/cameras/:camera_name/violations', camerasController.getCameraViolationsController);

// Employee violation endpoints
router.get('/api/violations/summary', camerasController.getViolationsSummaryByEmployeeController);
router.get('/api/violations/employee/:employee_name', camerasController.getViolationsByEmployeeController);

// Media endpoints
router.get('/api/violations/media/:violation_id/:camera/:timestamp', camerasController.getViolationMediaController);

router.delete('/api/cameras/cache', camerasController.clearCameraCacheController);

module.exports = router;