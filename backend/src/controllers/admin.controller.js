const { pool } = require('../config/db');

// Overall dashboard analytics and metrics
async function getStats(req, res, next) {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const currentMonth = today.slice(0, 7);

    // 1. Total Active Students
    const [studentCountRows] = await pool.query(
      `SELECT COUNT(*) AS total_students,
              SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active_students
       FROM users
       WHERE role = 'student'`
    );

    // 2. Today's Meal Attendance Counts
    const [attendanceRows] = await pool.query(
      `SELECT SUM(breakfast) AS today_breakfast,
              SUM(lunch) AS today_lunch,
              SUM(dinner) AS today_dinner
       FROM meal_attendance
       WHERE meal_date = ?`,
      [today]
    );

    // 3. Current Month Total Expenses
    const [expenseRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthly_expenses
       FROM mess_expenses
       WHERE expense_date LIKE ?`,
      [`${currentMonth}%`]
    );

    // 4. Current Month Total Payments Collected
    const [paymentRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthly_collections
       FROM payment_records
       WHERE status = 'approved' AND payment_date LIKE ?`,
      [`${currentMonth}%`]
    );

    res.status(200).json({
      success: true,
      data: {
        date: today,
        month: currentMonth,
        students: {
          total: studentCountRows[0].total_students || 0,
          active: studentCountRows[0].active_students || 0
        },
        mealsToday: {
          breakfast: Number(attendanceRows[0].today_breakfast) || 0,
          lunch: Number(attendanceRows[0].today_lunch) || 0,
          dinner: Number(attendanceRows[0].today_dinner) || 0
        },
        financeThisMonth: {
          totalExpenses: Number(Number(expenseRows[0].monthly_expenses).toFixed(2)),
          totalCollections: Number(Number(paymentRows[0].monthly_collections).toFixed(2))
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

// List all students with their room, phone, status, and assigned mess plan
async function getStudents(req, res, next) {
  try {
    const { status, plan_id, search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.room_no, u.phone, u.status, u.plan_id,
             p.plan_name, p.per_meal_rate, p.fixed_monthly_charge, u.created_at
      FROM users u
      LEFT JOIN mess_plans p ON u.plan_id = p.id
      WHERE u.role = 'student'
    `;
    const params = [];

    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }

    if (plan_id) {
      query += ' AND u.plan_id = ?';
      params.push(Number(plan_id));
    }

    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR u.room_no LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY u.room_no ASC, u.name ASC';

    const [rows] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

// Update student record (e.g. switch plan, toggle active status, update room/phone)
async function updateStudent(req, res, next) {
  try {
    const studentId = Number(req.params.id);
    const { plan_id, status, room_no, phone } = req.body;

    const fields = [];
    const params = [];

    if (plan_id !== undefined) {
      fields.push('plan_id = ?');
      params.push(plan_id ? Number(plan_id) : null);
    }

    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { message: 'status must be active or inactive', statusCode: 400 }
        });
      }
      fields.push('status = ?');
      params.push(status);
    }

    if (room_no !== undefined) {
      fields.push('room_no = ?');
      params.push(room_no || null);
    }

    if (phone !== undefined) {
      fields.push('phone = ?');
      params.push(phone || null);
    }

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No fields provided to update', statusCode: 400 }
      });
    }

    params.push(studentId);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ? AND role = 'student'`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Student with ID ${studentId} not found`, statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getStudents,
  updateStudent
};

