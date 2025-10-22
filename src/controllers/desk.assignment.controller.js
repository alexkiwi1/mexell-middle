const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { deskAssignmentService } = require('../services');

const getDesks = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: req.query.sortBy || 'desk_number:asc',
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 100,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
  };
  const result = await deskAssignmentService.getAllDesks(filter, options);
  res.send(result);
});

const getDesk = catchAsync(async (req, res) => {
  const desk = await deskAssignmentService.getDeskByNumber(parseInt(req.params.deskNumber, 10));
  if (!desk) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Desk not found');
  }
  res.send(desk);
});

const createDesk = catchAsync(async (req, res) => {
  const desk = await deskAssignmentService.createDesk(req.body);
  res.status(httpStatus.CREATED).send(desk);
});

const updateDesk = catchAsync(async (req, res) => {
  const desk = await deskAssignmentService.updateDeskByNumber(parseInt(req.params.deskNumber, 10), req.body);
  res.send(desk);
});

const deleteDesk = catchAsync(async (req, res) => {
  await deskAssignmentService.deleteDeskByNumber(parseInt(req.params.deskNumber, 10));
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  getDesks,
  getDesk,
  createDesk,
  updateDesk,
  deleteDesk,
};

