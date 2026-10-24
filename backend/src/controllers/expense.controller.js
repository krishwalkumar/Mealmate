const { pool } = require('../config/db');

// Get all mess expenses with optional category and date filtering (Admin only)
async function getExpenses(req, res, next) {
  try {
    const { category, month } = req.query;
    let query = `
      SELECT me.id, me.title, me.category, me.amount,
             DATE_FORMAT(me.expense_date, '%Y-%m-%d') AS expense_date,
             me.receipt_url, me.recorded_by, u.name AS recorded_by_name,
             me.notes, me.created_at
      FROM mess_expenses me
      LEFT JOIN users u ON me.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += ' AND me.category = ?';
      params.push(category);
    }

    if (month) {
      query += ' AND me.expense_date LIKE ?';
      params.push(`${month}%`);
    }

    query += ' ORDER BY me.expense_date DESC, me.id DESC';

    const [rows] = await pool.query(query, params);

    const totalExpense = rows.reduce((sum, e) => sum + Number(e.amount), 0);

    res.status(200).json({
      success: true,
      data: {
        totalExpense: Number(totalExpense.toFixed(2)),
        count: rows.length,
        records: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

// Log a new mess expense (Admin only)
async function createExpense(req, res, next) {
  try {
    const { title, category, amount, expense_date, receipt_url, notes } = req.body;
    const adminId = req.user.id;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Expense title is required', statusCode: 400 }
      });
    }

    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid expense amount greater than 0 is required', statusCode: 400 }
      });
    }

    const validCategories = ['groceries', 'vegetables', 'dairy', 'gas_utility', 'maintenance', 'other'];
    const cat = validCategories.includes(category) ? category : 'groceries';
    const date = expense_date || new Date().toISOString().slice(0, 10);

    const [result] = await pool.query(
      `INSERT INTO mess_expenses (title, category, amount, expense_date, receipt_url, recorded_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        cat,
        numAmount,
        date,
        receipt_url || null,
        adminId,
        notes || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Mess expense recorded successfully',
      data: {
        id: result.insertId,
        title: title.trim(),
        category: cat,
        amount: numAmount,
        expense_date: date
      }
    });
  } catch (error) {
    next(error);
  }
}

// Delete an expense record (Admin only)
async function deleteExpense(req, res, next) {
  try {
    const expenseId = Number(req.params.id);

    const [result] = await pool.query('DELETE FROM mess_expenses WHERE id = ?', [expenseId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Expense with ID ${expenseId} not found`, statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

// Monthly category breakdown summary (Admin only)
async function getExpenseSummary(req, res, next) {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);

    const [rows] = await pool.query(
      `SELECT category, SUM(amount) AS total_amount, COUNT(*) AS items_count
       FROM mess_expenses
       WHERE expense_date LIKE ?
       GROUP BY category
       ORDER BY total_amount DESC`,
      [`${month}%`]
    );

    const overallTotal = rows.reduce((acc, curr) => acc + Number(curr.total_amount), 0);

    res.status(200).json({
      success: true,
      data: {
        month,
        overallTotal: Number(overallTotal.toFixed(2)),
        categories: rows
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary
};

