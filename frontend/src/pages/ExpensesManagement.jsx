import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { ShoppingBag, PlusCircle, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ExpensesManagement() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'groceries',
    amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    receipt_url: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async (month) => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, summaryRes] = await Promise.all([
        apiClient.get(`/expenses?month=${month}`),
        apiClient.get(`/expenses/summary?month=${month}`)
      ]);

      setExpenses(listRes.data.data.records || []);
      setTotal(listRes.data.data.totalExpense || 0);
      setSummary(summaryRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch mess expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedMonth);
  }, [selectedMonth]);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.post('/expenses', formData);
      setSuccessMsg('Expense logged successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        category: 'groceries',
        amount: '',
        expense_date: new Date().toISOString().slice(0, 10),
        receipt_url: '',
        notes: ''
      });
      fetchExpenses(selectedMonth);
    } catch (err) {
      setError(err.message || 'Error recording expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete expense "${title}"?`)) return;

    try {
      await apiClient.delete(`/expenses/${id}`);
      setSuccessMsg('Expense record deleted.');
      fetchExpenses(selectedMonth);
    } catch (err) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>Mess Expenses & Bazar Ledger</h2>
          <p className="page-sub">Track daily grocery purchases, vegetable bazar, gas, and hostel mess maintenance</p>
        </div>

        <div className="header-actions">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-input"
          />
          <button onClick={() => fetchExpenses(selectedMonth)} className="btn-secondary" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <PlusCircle size={16} /> Log Expense
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Expense Summary Grid */}
      <div className="metrics-row">
        <div className="metric-box">
          <span className="metric-label">Total Spent ({selectedMonth})</span>
          <span className="metric-number text-danger">₹{Number(total).toFixed(2)}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Purchases Logged</span>
          <span className="metric-number">{expenses.length}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Top Expense Category</span>
          <span className="metric-number">
            {summary?.categories?.[0]?.category?.toUpperCase() || '—'}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="card-header">
          <h3>Expense Log for {selectedMonth}</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={20} />
            <p>Loading expenses...</p>
          </div>
        ) : expenses.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title / Item</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Logged By</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td><strong>{exp.expense_date}</strong></td>
                    <td><strong>{exp.title}</strong></td>
                    <td>
                      <span className="badge-cat">{exp.category}</span>
                    </td>
                    <td><strong className="text-danger">₹{Number(exp.amount).toFixed(2)}</strong></td>
                    <td>{exp.recorded_by_name || 'Admin'}</td>
                    <td className="text-muted">{exp.notes || '—'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteExpense(exp.id, exp.title)}
                        className="btn-action-del"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No expenses logged for {selectedMonth}.</p>
        )}
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Log Mess Purchase / Expense</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleCreateExpense} className="modal-form">
              <div className="form-group">
                <label>Item / Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Vegetables Bazar / Milk 30 Litres"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="select-input"
                  >
                    <option value="groceries">Groceries (Rice, Dal, Oil)</option>
                    <option value="vegetables">Vegetables & Fruits</option>
                    <option value="dairy">Dairy (Milk, Paneer, Curd)</option>
                    <option value="gas_utility">Gas & Utilities</option>
                    <option value="maintenance">Kitchen Maintenance</option>
                    <option value="other">Other Miscellaneous</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 1450.00"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Receipt URL / Bill Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.receipt_url}
                    onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                    placeholder="Bill-8492"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Vendor Details</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Purchased from local mandi"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

