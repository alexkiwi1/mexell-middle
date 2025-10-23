const Joi = require('joi');

const getDesks = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getDesk = {
  params: Joi.object().keys({
    deskNumber: Joi.number().integer().required(),
  }),
};

const createDesk = {
  body: Joi.object().keys({
    desk_number: Joi.number().integer().required().min(1).max(66),
    employee_name: Joi.string().required(),
    status: Joi.string().valid('active', 'vacant').default('active'),
    camera: Joi.string(),
    notes: Joi.string(),
  }),
};

const updateDesk = {
  params: Joi.object().keys({
    deskNumber: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      employee_name: Joi.string(),
      status: Joi.string().valid('active', 'vacant'),
      camera: Joi.string(),
      notes: Joi.string(),
    })
    .min(1),
};

const deleteDesk = {
  params: Joi.object().keys({
    deskNumber: Joi.number().integer().required(),
  }),
};

module.exports = {
  getDesks,
  getDesk,
  createDesk,
  updateDesk,
  deleteDesk,
};


