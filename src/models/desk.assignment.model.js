const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const deskAssignmentSchema = mongoose.Schema(
  {
    desk_number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 66,
      index: true,
    },
    employee_name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'vacant'],
      default: 'active',
    },
    camera: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add plugins
deskAssignmentSchema.plugin(toJSON);
deskAssignmentSchema.plugin(paginate);

/**
 * @typedef DeskAssignment
 */
const DeskAssignment = mongoose.model('DeskAssignment', deskAssignmentSchema);

module.exports = DeskAssignment;

