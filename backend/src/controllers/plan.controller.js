const { pool } = require('../config/db');

// Get all active plans (or all plans for admin)
async function getPlans(req, res, next) {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    const query = isAdmin
      ? 'SELECT id, plan_name, description, fixed_monthly_charge, per_meal_rate, is_active, created_at FROM mess_plans ORDER BY id ASC'
      : 'SELECT id, plan_name, description, fixed_monthly_charge, per_meal_rate, is_active, created_at FROM mess_plans WHERE is_active = TRUE ORDER BY id ASC';

    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

// Create new mess plan (Admin only)
async function createPlan(req, res, next) {
  try {
    const { plan_name, description, fixed_monthly_charge, per_meal_rate } = req.body;

    if (!plan_name || typeof plan_name !== 'string' || plan_name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Plan name is required', statusCode: 400 }
      });
    }

    const fixedCharge = Number(fixed_monthly_charge) || 0.00;
    const mealRate = Number(per_meal_rate) || 0.00;

    const [result] = await pool.query(
      `INSERT INTO mess_plans (plan_name, description, fixed_monthly_charge, per_meal_rate, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [plan_name.trim(), description || null, fixedCharge, mealRate]
    );

    res.status(201).json({
      success: true,
      message: 'Mess plan created successfully',
      data: {
        id: result.insertId,
        plan_name: plan_name.trim(),
        description: description || null,
        fixed_monthly_charge: fixedCharge,
        per_meal_rate: mealRate,
        is_active: true
      }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: { message: 'A plan with this name already exists', statusCode: 409 }
      });
    }
    next(error);
  }
}

// Update existing mess plan (Admin only)
async function updatePlan(req, res, next) {
  try {
    const planId = Number(req.params.id);
    const { plan_name, description, fixed_monthly_charge, per_meal_rate, is_active } = req.body;

    if (!plan_name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Plan name is required', statusCode: 400 }
      });
    }

    const [result] = await pool.query(
      `UPDATE mess_plans
       SET plan_name = ?, description = ?, fixed_monthly_charge = ?, per_meal_rate = ?, is_active = ?
       WHERE id = ?`,
      [
        plan_name.trim(),
        description || null,
        Number(fixed_monthly_charge) || 0.00,
        Number(per_meal_rate) || 0.00,
        is_active !== undefined ? Boolean(is_active) : true,
        planId
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Plan with ID ${planId} not found`, statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

// Soft delete plan (Admin only)
async function deletePlan(req, res, next) {
  try {
    const planId = Number(req.params.id);

    // Soft delete to avoid breaking historical student records
    const [result] = await pool.query(
      'UPDATE mess_plans SET is_active = FALSE WHERE id = ?',
      [planId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: { message: `Plan with ID ${planId} not found`, statusCode: 404 }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Plan deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan
};
