const express = require('express');
const validate = require('../../middlewares/validate');
const deskAssignmentValidation = require('../../validations/desk.assignment.validation');
const deskAssignmentController = require('../../controllers/desk.assignment.controller');

const router = express.Router();

router
  .route('/')
  .get(validate(deskAssignmentValidation.getDesks), deskAssignmentController.getDesks)
  .post(validate(deskAssignmentValidation.createDesk), deskAssignmentController.createDesk);

router
  .route('/:deskNumber')
  .get(validate(deskAssignmentValidation.getDesk), deskAssignmentController.getDesk)
  .put(validate(deskAssignmentValidation.updateDesk), deskAssignmentController.updateDesk)
  .delete(validate(deskAssignmentValidation.deleteDesk), deskAssignmentController.deleteDesk);

module.exports = router;

