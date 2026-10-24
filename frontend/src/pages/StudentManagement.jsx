import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Users, Search, Edit, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Edit student modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    room_no: '',
    phone: '',
    status: 'active',
    plan_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studRes, planRes] = await Promise.all([
        apiClient.get(`/admin/students?search=${encodeURIComponent(search)}`),
        apiClient.get('/plans')
      ]);
      setStudents(studRes.data.data || []);
      setPlans(planRes.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditForm({
      room_no: student.room_no || '',
      phone: student.phone || '',
      status: student.status || 'active',
      plan_id: student.plan_id || ''
    });
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await apiClient.put(`/admin/students/${selectedStudent.id}`, editForm);
      setSuccessMsg(`Student "${selectedStudent.name}" updated successfully!`);
      setSelectedStudent(null);
      fetchStudents();
    } catch (err) {
      setError(err.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>Student Management Directory</h2>
          <p className="page-sub">Assign mess plans, track hostel room allotments, and manage student active status</p>
        </div>

        <div className="header-actions">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, room, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button onClick={fetchStudents} className="btn-secondary" title="Refresh">
            <RefreshCw size={15} />
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

      <div className="card">
        <div className="card-header">
          <h3>Registered Students ({students.length})</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={20} />
            <p>Loading student directory...</p>
          </div>
        ) : students.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Room No</th>
                  <th>Phone</th>
                  <th>Assigned Plan</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong></td>
                    <td className="text-muted">{s.email}</td>
                    <td>{s.room_no || '—'}</td>
                    <td>{s.phone || '—'}</td>
                    <td>
                      <span className="badge-plan">{s.plan_name || 'Standard'}</span>
                    </td>
                    <td>
                      {s.status === 'active' ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Active</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Inactive</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => openEditModal(s)} className="btn-secondary-sm">
                        <Edit size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No students match your search criteria.</p>
        )}
      </div>

      {/* Edit Student Modal */}
      {selectedStudent && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Student: {selectedStudent.name}</h3>
              <button onClick={() => setSelectedStudent(null)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleUpdateStudent} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={editForm.room_no}
                    onChange={(e) => setEditForm({ ...editForm, room_no: e.target.value })}
                    placeholder="e.g. B-204"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Assigned Mess Plan</label>
                  <select
                    value={editForm.plan_id}
                    onChange={(e) => setEditForm({ ...editForm, plan_id: e.target.value })}
                    className="select-input"
                  >
                    <option value="">-- No Plan / Default --</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.plan_name} (₹{p.fixed_monthly_charge}/mo + ₹{p.per_meal_rate}/meal)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="select-input"
                  >
                    <option value="active">Active Member</option>
                    <option value="inactive">Inactive / Checked Out</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedStudent(null)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

