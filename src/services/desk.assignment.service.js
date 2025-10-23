const { DeskAssignment } = require('../models');
const logger = require('../config/logger');

/**
 * Seed initial desk assignments (all 66 desks)
 */
const seedDeskAssignments = async () => {
  try {
    const count = await DeskAssignment.countDocuments();
    if (count > 0) {
      logger.info(`Desk assignments already seeded (${count} desks found)`);
      return;
    }

    const initialAssignments = [
      { desk_number: 1, employee_name: 'Safia Imtiaz', status: 'active' },
      { desk_number: 2, employee_name: 'Kinza Amin', status: 'active' },
      { desk_number: 3, employee_name: 'Aiman Jawaid', status: 'active' },
      { desk_number: 4, employee_name: 'Nimra Ghulam Fareed', status: 'active' },
      { desk_number: 5, employee_name: 'Summaiya Khan', status: 'active' },
      { desk_number: 6, employee_name: 'Arifa Dhari', status: 'active' },
      { desk_number: 7, employee_name: 'Khalid Ahmed', status: 'active' },
      { desk_number: 8, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 9, employee_name: 'Muhammad Arsalan', status: 'active' },
      { desk_number: 10, employee_name: 'Saadullah Khoso', status: 'active' },
      { desk_number: 11, employee_name: 'Muhammad Taha', status: 'active' },
      { desk_number: 12, employee_name: 'Muhammad Awais', status: 'active' },
      { desk_number: 13, employee_name: 'Nabeel Bhatti', status: 'active' },
      { desk_number: 14, employee_name: 'Abdul Qayoom', status: 'active' },
      { desk_number: 15, employee_name: 'Sharjeel Abbas', status: 'active' },
      { desk_number: 16, employee_name: 'Saad Bin Salman', status: 'active' },
      { desk_number: 17, employee_name: 'Sufiyan Ahmed', status: 'active' },
      { desk_number: 18, employee_name: 'Muhammad Qasim', status: 'active' },
      { desk_number: 19, employee_name: 'Sameer Panhwar', status: 'active' },
      { desk_number: 20, employee_name: 'Bilal Soomro', status: 'active' },
      { desk_number: 21, employee_name: 'Saqlain Murtaza', status: 'active' },
      { desk_number: 22, employee_name: 'Syed Hussain Ali Kazi', status: 'active' },
      { desk_number: 23, employee_name: 'Saad Khan', status: 'active' },
      { desk_number: 24, employee_name: 'Kabeer Rajput', status: 'active' },
      { desk_number: 25, employee_name: 'Mehmood Memon', status: 'active' },
      { desk_number: 26, employee_name: 'Ali Habib', status: 'active' },
      { desk_number: 27, employee_name: 'Bhamar Lal', status: 'active' },
      { desk_number: 28, employee_name: 'Atban Bin Aslam', status: 'active' },
      { desk_number: 29, employee_name: 'Sadique Khowaja', status: 'active' },
      { desk_number: 30, employee_name: 'Syed Awwab', status: 'active' },
      { desk_number: 31, employee_name: 'Samad Siyal', status: 'active' },
      { desk_number: 32, employee_name: 'Wasi Khan', status: 'active' },
      { desk_number: 33, employee_name: 'Kashif Raza', status: 'active' },
      { desk_number: 34, employee_name: 'Wajahat Imam', status: 'active' },
      { desk_number: 35, employee_name: 'Bilal Ahmed', status: 'active' },
      { desk_number: 36, employee_name: 'Muhammad Usman', status: 'active' },
      { desk_number: 37, employee_name: 'Arsalan Khan', status: 'active' },
      { desk_number: 38, employee_name: 'Abdul Kabeer', status: 'active' },
      { desk_number: 39, employee_name: 'Gian Chand', status: 'active' },
      { desk_number: 40, employee_name: 'Ayan Arain', status: 'active' },
      { desk_number: 41, employee_name: 'Zaib Ali Mughal', status: 'active' },
      { desk_number: 42, employee_name: 'Abdul Wassay', status: 'active' },
      { desk_number: 43, employee_name: 'Aashir Ali', status: 'active' },
      { desk_number: 44, employee_name: 'Ali Raza', status: 'active' },
      { desk_number: 45, employee_name: 'Muhammad Tabish', status: 'active' },
      { desk_number: 46, employee_name: 'Farhan Ali', status: 'active' },
      { desk_number: 47, employee_name: 'Tahir Ahmed', status: 'active' },
      { desk_number: 48, employee_name: 'Zain Nawaz', status: 'active' },
      { desk_number: 49, employee_name: 'Ali Memon', status: 'active' },
      { desk_number: 50, employee_name: 'Muhammad Wasif Samoon', status: 'active' },
      { desk_number: 51, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 52, employee_name: 'Sumair Hussain', status: 'active' },
      { desk_number: 53, employee_name: 'Natasha Batool', status: 'active' },
      { desk_number: 54, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 55, employee_name: 'Preet Nuckrich', status: 'active' },
      { desk_number: 56, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 57, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 58, employee_name: 'Konain Mustafa', status: 'active' },
      { desk_number: 59, employee_name: 'Muhammad Uzair', status: 'active' },
      { desk_number: 60, employee_name: 'Vacant', status: 'vacant' },
      { desk_number: 61, employee_name: 'Hira Memon', status: 'active' },
      { desk_number: 62, employee_name: 'Muhammad Roshan', status: 'active' },
      { desk_number: 63, employee_name: 'Syed Safwan Ali Hashmi', status: 'active' },
      { desk_number: 64, employee_name: 'Arbaz', status: 'active' },
      { desk_number: 65, employee_name: 'Muhammad Shakir', status: 'active' },
      { desk_number: 66, employee_name: 'Muneeb Intern', status: 'active' },
    ];

    await DeskAssignment.insertMany(initialAssignments);
    logger.info(`Successfully seeded ${initialAssignments.length} desk assignments`);
  } catch (error) {
    logger.error('Error seeding desk assignments:', error);
    throw error;
  }
};

/**
 * Get desk assignment by desk number
 * @param {number} deskNumber
 * @returns {Promise<DeskAssignment>}
 */
const getDeskByNumber = async (deskNumber) => {
  return DeskAssignment.findOne({ desk_number: deskNumber });
};

/**
 * Get employee's assigned desk
 * @param {string} employeeName
 * @returns {Promise<DeskAssignment>}
 */
const getEmployeeDesk = async (employeeName) => {
  return DeskAssignment.findOne({ employee_name: employeeName });
};

/**
 * Get all desk assignments
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getAllDesks = async (filter = {}, options = {}) => {
  // If pagination is false, return all results
  if (options.pagination === false) {
    const results = await DeskAssignment.find(filter).sort({ desk_number: 1 });
    return { results, totalResults: results.length };
  }
  return DeskAssignment.paginate(filter, options);
};

/**
 * Create desk assignment
 * @param {Object} deskBody
 * @returns {Promise<DeskAssignment>}
 */
const createDesk = async (deskBody) => {
  return DeskAssignment.create(deskBody);
};

/**
 * Update desk assignment by desk number
 * @param {number} deskNumber
 * @param {Object} updateBody
 * @returns {Promise<DeskAssignment>}
 */
const updateDeskByNumber = async (deskNumber, updateBody) => {
  const desk = await getDeskByNumber(deskNumber);
  if (!desk) {
    throw new Error('Desk not found');
  }
  Object.assign(desk, updateBody);
  await desk.save();
  return desk;
};

/**
 * Delete desk assignment by desk number
 * @param {number} deskNumber
 * @returns {Promise<DeskAssignment>}
 */
const deleteDeskByNumber = async (deskNumber) => {
  const desk = await getDeskByNumber(deskNumber);
  if (!desk) {
    throw new Error('Desk not found');
  }
  await desk.remove();
  return desk;
};

module.exports = {
  seedDeskAssignments,
  getDeskByNumber,
  getEmployeeDesk,
  getAllDesks,
  createDesk,
  updateDeskByNumber,
  deleteDeskByNumber,
};


