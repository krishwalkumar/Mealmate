const { pool } = require('../config/db');

// Helper to get today's date string in YYYY-MM-DD
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Toggle breakfast, lunch, or dinner for a user on a given date
async function toggleMeal(req, res, next) {
  try {
    const { meal_date, meal_type, status, user_id, remarks } = req.body;
    const mealType = meal_type.toLowerCase();
    const statusVal = (status === 1 || status === true) ? 1 : 0;

    // Student can only toggle their own attendance; Admin can toggle for any user
    let targetUserId = req.user.id;
    if (req.user.role === 'admin' && user_id) {
      targetUserId = Number(user_id);
    }

    // Verify target user exists and is a student
    const [userRows] = await pool.query(
      'SELECT id, name, status FROM users WHERE id = ? LIMIT 1',
      [targetUserId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          message: `User with ID ${targetUserId} not found`,
          statusCode: 404
        }
      });
    }

    if (userRows[0].status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot toggle meals for an inactive user',
          statusCode: 400
        }
      });
    }

    // Default values for initial record creation
    const initBreakfast = mealType === 'breakfast' ? statusVal : 0;
    const initLunch = mealType === 'lunch' ? statusVal : 1;
    const initDinner = mealType === 'dinner' ? statusVal : 1;

    // Parameterized atomic UPSERT: prevents duplicate attendance rows on (user_id, meal_date)
    await pool.query(
      `INSERT INTO meal_attendance (user_id, meal_date, breakfast, lunch, dinner, remarks)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         breakfast = IF(? = 'breakfast', ?, breakfast),
         lunch     = IF(? = 'lunch',     ?, lunch),
         dinner    = IF(? = 'dinner',    ?, dinner),
         remarks   = COALESCE(?, remarks),
         updated_at = CURRENT_TIMESTAMP`,
      [
        targetUserId, meal_date, initBreakfast, initLunch, initDinner, remarks || null,
        mealType, statusVal,
        mealType, statusVal,
        mealType, statusVal,
        remarks || null
      ]
    );

    // Fetch the updated attendance record to return to client
    const [updatedRows] = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(meal_date, '%Y-%m-%d') AS meal_date,
              breakfast, lunch, dinner,
              (breakfast + lunch + dinner) AS total_meals,
              remarks, updated_at
       FROM meal_attendance
       WHERE user_id = ? AND meal_date = ?
       LIMIT 1`,
      [targetUserId, meal_date]
    );

    res.status(200).json({
      success: true,
      message: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} attendance toggled to ${statusVal ? 'ON' : 'OFF'}`,
      data: updatedRows[0]
    });
  } catch (error) {
    next(error);
  }
}

// Get attendance history for the logged-in student
async function getMyAttendance(req, res, next) {
  try {
    const userId = req.user.id;
    const month = req.query.month || getTodayDateString().slice(0, 7); // Default: current month 'YYYY-MM'

    const [rows] = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(meal_date, '%Y-%m-%d') AS meal_date,
              breakfast, lunch, dinner,
              (breakfast + lunch + dinner) AS total_meals,
              remarks, updated_at
       FROM meal_attendance
       WHERE user_id = ? AND meal_date LIKE ?
       ORDER BY meal_date ASC`,
      [userId, `${month}%`]
    );

    // Compute month aggregate counts
    const summary = rows.reduce(
      (acc, curr) => {
        acc.totalBreakfast += curr.breakfast;
        acc.totalLunch += curr.lunch;
        acc.totalDinner += curr.dinner;
        acc.totalMeals += curr.total_meals;
        return acc;
      },
      { totalBreakfast: 0, totalLunch: 0, totalDinner: 0, totalMeals: 0, daysLogged: rows.length }
    );

    res.status(200).json({
      success: true,
      data: {
        month,
        summary,
        records: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get today's meal status for the logged-in user
async function getTodayStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const today = getTodayDateString();

    const [rows] = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(meal_date, '%Y-%m-%d') AS meal_date,
              breakfast, lunch, dinner,
              (breakfast + lunch + dinner) AS total_meals,
              remarks, updated_at
       FROM meal_attendance
       WHERE user_id = ? AND meal_date = ?
       LIMIT 1`,
      [userId, today]
    );

    // If no record exists yet, return default expected attendance
    const attendanceData = rows.length > 0 ? rows[0] : {
      id: null,
      user_id: userId,
      meal_date: today,
      breakfast: 0,
      lunch: 1,
      dinner: 1,
      total_meals: 2,
      remarks: null,
      isDefault: true
    };

    res.status(200).json({
      success: true,
      data: attendanceData
    });
  } catch (error) {
    next(error);
  }
}

// Admin Endpoint: Get attendance overview for all students on a given date
async function getDailyAttendance(req, res, next) {
  try {
    const date = req.query.date || getTodayDateString();

    const [rows] = await pool.query(
      `SELECT u.id AS user_id, u.name, u.room_no, u.phone,
              COALESCE(ma.id, NULL) AS attendance_id,
              DATE_FORMAT(COALESCE(ma.meal_date, ?), '%Y-%m-%d') AS meal_date,
              COALESCE(ma.breakfast, 0) AS breakfast,
              COALESCE(ma.lunch, 1) AS lunch,
              COALESCE(ma.dinner, 1) AS dinner,
              (COALESCE(ma.breakfast, 0) + COALESCE(ma.lunch, 1) + COALESCE(ma.dinner, 1)) AS total_meals,
              ma.remarks
       FROM users u
       LEFT JOIN meal_attendance ma ON u.id = ma.user_id AND ma.meal_date = ?
       WHERE u.role = 'student' AND u.status = 'active'
       ORDER BY u.room_no ASC, u.name ASC`,
      [date, date]
    );

    // Calculate aggregated headcount for the mess cook/manager
    const aggregates = rows.reduce(
      (acc, student) => {
        acc.totalStudents += 1;
        acc.expectedBreakfast += student.breakfast;
        acc.expectedLunch += student.lunch;
        acc.expectedDinner += student.dinner;
        return acc;
      },
      { totalStudents: 0, expectedBreakfast: 0, expectedLunch: 0, expectedDinner: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        date,
        aggregates,
        students: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  toggleMeal,
  getMyAttendance,
  getTodayStatus,
  getDailyAttendance
};

