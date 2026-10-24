import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { CreditCard, PlusCircle, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function PaymentsManagement() {
  const { isAdmin } = useAuth();
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Admin record payment form state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_mode: 'upi',
    transaction_ref: '',
    status: 'approved',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = isAdmin ? '/payments' : '/payments/my-payments';
      const response = await apiClient.get(endpoint);
      setPayments(response.data.data.records || []);
      setTotal(response.data.data.totalCollected || response.data.data.totalPaid || 0);

      // If admin, also load student list for the record payment dropdown
      if (isAdmin) {
        const studentRes = await apiClient.get('/admin/students');
        setStudents(studentRes.data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch payment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [isAdmin]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.post('/payments', formData);
      setSuccessMsg('Payment successfully recorded into the ledger!');
      setShowModal(false);
      setFormData({
        user_id: '',
        amount: '',
        payment_date: new Date().toISOString().slice(0, 10),
        payment_mode: 'upi',
        transaction_ref: '',
        status: 'approved',
        notes: ''
      });
      fetchPayments();
    } catch (err) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      await apiClient.put(`/payments/${paymentId}/status`, { status: newStatus });
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      setError(err.message || 'Could not update payment status');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>{isAdmin ? 'Payment Management Ledger' : 'My Payment History'}</h2>
          <p className="page-sub">
            {isAdmin
              ? 'Record, verify, and reconcile student mess fee deposits'
              : 'Track your fee payments and receipts'}
          </p>
        </div>

        <div className="header-actions">
          <button onClick={fetchPayments} className="btn-secondary" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary">
              <PlusCircle size={16} /> Record Payment
            </button>
          )}
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

      {/* Summary Card */}
      <div className="metrics-row">
        <div className="metric-box">
          <span className="metric-label">
            {isAdmin ? 'Total Approved Collections' : 'My Total Approved Deposits'}
          </span>
          <span className="metric-number">₹{Number(total).toFixed(2)}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Transactions Recorded</span>
          <span className="metric-number">{payments.length}</span>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="card">
        <div className="card-header">
          <h3>Transaction Records</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={20} />
            <p>Loading transactions...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {isAdmin && <th>Student (Room)</th>}
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Reference / Txn ID</th>
                  <th>Status</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>{p.payment_date}</strong></td>
                    {isAdmin && (
                      <td>
                        {p.student_name} {p.room_no ? `(${p.room_no})` : ''}
                      </td>
                    )}
                    <td><strong className="text-primary">₹{Number(p.amount).toFixed(2)}</strong></td>
                    <td>
                      <span className="badge-mode">{p.payment_mode.toUpperCase()}</span>
                    </td>
                    <td className="text-muted">{p.transaction_ref || '—'}</td>
                    <td>
                      {p.status === 'approved' && (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Approved</span>
                      )}
                      {p.status === 'pending' && (
                        <span className="tag-warn"><Clock size={13} /> Pending</span>
                      )}
                      {p.status === 'rejected' && (
                        <span className="tag-off"><XCircle size={13} /> Rejected</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        {p.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'approved')}
                            className="btn-action-ok"
                            title="Approve Payment"
                          >
                            Approve
                          </button>
                        )}
                        {p.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(p.id, 'rejected')}
                            className="btn-action-del"
                            title="Reject Payment"
                          >
                            Reject
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No payment records found.</p>
        )}
      </div>

      {/* Admin Record Payment Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Record Student Payment</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleRecordPayment} className="modal-form">
              <div className="form-group">
                <label>Select Student *</label>
                <select
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                  className="select-input"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.room_no ? `(Room: ${s.room_no})` : ''} - {s.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g. 3500"
                  />
                </div>

                <div className="form-group">
                  <label>Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Mode</label>
                  <select
                    value={formData.payment_mode}
                    onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                    className="select-input"
                  >
                    <option value="upi">UPI / GPay / PhonePe</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer / IMPS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Transaction / UTR Reference</label>
                  <input
                    type="text"
                    value={formData.transaction_ref}
                    onChange={(e) => setFormData({ ...formData, transaction_ref: e.target.value })}
                    placeholder="UPI-12345678"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes / Remarks</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Monthly mess fee deposit"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Recording...' : 'Save Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

