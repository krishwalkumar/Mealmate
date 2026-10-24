const { pool } = require('../config/db');

// Get payment history for authenticated student
async function getMyPayments(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT id, user_id, amount,
              DATE_FORMAT(payment_date, '%Y-%m-%d') AS payment_date,
              payment_mode, transaction_ref, status, notes, created_at
       FROM payment_records
       WHERE user_id = ?
       ORDER BY payment_date DESC, id DESC`,
      [userId]
    );

    const totalPaid = rows
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        totalPaid: Number(totalPaid.toFixed(2)),
        records: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

// Get all payments (Admin only)
async function getAllPayments(req, res, next) {
  try {
    const { status, user_id } = req.query;
    let query = `
      SELECT pr.id, pr.user_id, u.name AS student_name, u.room_no, u.email AS student_email,
             pr.amount, DATE_FORMAT(pr.payment_date, '%Y-%m-%d') AS payment_date,
             pr.payment_mode, pr.transaction_ref, pr.status, pr.notes, pr.created_at,
             admin.name AS recorded_by_name
      FROM payment_records pr
      JOIN users u ON pr.user_id = u.id
      LEFT JOIN users admin ON pr.recorded_by = admin.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND pr.status = ?';
      params.push(status);
    }

    if (user_id) {
      query += ' AND pr.user_id = ?';
      params.push(Number(user_id));
    }

    query += ' ORDER BY pr.payment_date DESC, pr.id DESC';

    const [rows] = await pool.query(query, params);

    const totalCollected = rows
      .filter((p) => p.status === 'approved')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        totalCollected: Number(totalCollected.toFixed(2)),
        count: rows.length,
        records: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

// Record a new student payment (Admin only)
async function recordPayment(req, res, next) {
  try {
    const { user_id, amount, payment_date, payment_mode, transaction_ref, status, notes } = req.body;
    const adminId = req.user.id;

    if (!user_id || isNaN(Number(user_id))) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid student user_id is required', statusCode: 400 }
      });
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid payment amount greater than 0 is required', statusCode: 400 }
      });
    }

    const allowedModes = ['upi', 'cash', 'bank_transfer'];
    const mode = allowedModes.includes(payment_mode) ? payment_mode : 'upi';
    const payStatus = ['pending', 'approved', 'rejected'].includes(status) ? status : 'approved';
    const payDate = payment_date || new Date().toISOString().slice(0, 10);

    // Verify student exists
    const [userRows] = await pool.query('SELECT id, name FROM users WHERE id = ?', [Number(user_id)]);
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Student with ID ${user_id} not found`, statusCode: 404 }
      });
    }

    const [result] = await pool.query(
      `INSERT INTO payment_records (user_id, amount, payment_date, payment_mode, transaction_ref, status, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(user_id),
        numAmount,
        payDate,
        mode,
        transaction_ref || null,
        payStatus,
        adminId,
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        id: result.insertId,
        user_id: Number(user_id),
        student_name: userRows[0].name,
        amount: numAmount,
        payment_date: payDate,
        payment_mode: mode,
        status: payStatus
      }
    });
  } catch (error) {
    next(error);
  }
}

// Update payment status (e.g. approve/reject) (Admin only)
async function updatePaymentStatus(req, res, next) {
  try {
    const paymentId = Number(req.params.id);
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { message: 'status must be pending, approved, or rejected', statusCode: 400 }
      });
    }

    const [result] = await pool.query(
      'UPDATE payment_records SET status = ? WHERE id = ?',
      [status, paymentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Payment record with ID ${paymentId} not found`, statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${status}`
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyPayments,
  getAllPayments,
  recordPayment,
  updatePaymentStatus
};

