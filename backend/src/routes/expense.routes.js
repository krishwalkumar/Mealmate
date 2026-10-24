const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  deleteExpense,
  getExpenseSummary
} = require('../controllers/expense.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

// All expense routes require admin privileges
router.use(verifyToken, requireRole('admin'));

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);
router.get('/summary', getExpenseSummary);

module.exports = router;

