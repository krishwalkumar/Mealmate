import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Utensils, PlusCircle, Edit2, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function PlansManagement() {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    description: '',
    fixed_monthly_charge: '',
    per_meal_rate: '',
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/plans');
      setPlans(response.data.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load mess plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      plan_name: '',
      description: '',
      fixed_monthly_charge: '',
      per_meal_rate: '',
      is_active: true
    });
    setShowModal(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      description: plan.description || '',
      fixed_monthly_charge: plan.fixed_monthly_charge,
      per_meal_rate: plan.per_meal_rate,
      is_active: Boolean(plan.is_active)
    });
    setShowModal(true);
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingPlan) {
        await apiClient.put(`/plans/${editingPlan.id}`, formData);
        setSuccessMsg(`Plan "${formData.plan_name}" updated successfully!`);
      } else {
        await apiClient.post('/plans', formData);
        setSuccessMsg(`New plan "${formData.plan_name}" created successfully!`);
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Error saving mess plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId, planName) => {
    if (!window.confirm(`Are you sure you want to deactivate the plan "${planName}"?`)) return;

    try {
      await apiClient.delete(`/plans/${planId}`);
      setSuccessMsg(`Plan "${planName}" deactivated.`);
      fetchPlans();
    } catch (err) {
      setError(err.message || 'Failed to deactivate plan');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>Mess Subscription Plans</h2>
          <p className="page-sub">
            {isAdmin
              ? 'Manage subscription plans, fixed charges, and per-meal rates'
              : 'Browse available mess plans and billing structures'}
          </p>
        </div>

        <div className="header-actions">
          <button onClick={fetchPlans} className="btn-secondary" title="Refresh">
            <RefreshCw size={15} /> Refresh
          </button>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn-primary">
              <PlusCircle size={16} /> Create Plan
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

      {loading ? (
        <div className="loading-state">
          <RefreshCw className="spin" size={24} />
          <p>Loading mess plans...</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="plans-grid">
          {plans.map((p) => (
            <div key={p.id} className={`card plan-showcase-card ${!p.is_active ? 'plan-inactive' : ''}`}>
              <div className="plan-card-header">
                <div className="plan-icon-wrap">
                  <Utensils size={24} />
                </div>
                {!p.is_active && <span className="badge-off">Deactivated</span>}
              </div>

              <h3>{p.plan_name}</h3>
              <p className="plan-desc">{p.description || 'Standard student mess plan'}</p>

              <div className="plan-pricing-box">
                <div className="price-item">
                  <span className="price-label">Monthly Fixed Charge</span>
                  <span className="price-val">₹{p.fixed_monthly_charge}</span>
                </div>
                <div className="price-divider">/</div>
                <div className="price-item">
                  <span className="price-label">Per Meal Charge</span>
                  <span className="price-val">₹{p.per_meal_rate}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="card-actions-row">
                  <button onClick={() => openEditModal(p)} className="btn-secondary-sm">
                    <Edit2 size={14} /> Edit
                  </button>
                  {p.is_active && (
                    <button onClick={() => handleDeletePlan(p.id, p.plan_name)} className="btn-action-del-sm">
                      <Trash2 size={14} /> Deactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-card">
          <Utensils size={36} className="empty-icon" />
          <p>No mess plans created yet.</p>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn-primary mt-3">
              <PlusCircle size={16} /> Create First Plan
            </button>
          )}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{editingPlan ? 'Edit Mess Plan' : 'Create New Mess Plan'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-close">×</button>
            </div>

            <form onSubmit={handleSavePlan} className="modal-form">
              <div className="form-group">
                <label>Plan Name *</label>
                <input
                  type="text"
                  required
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  placeholder="e.g. Standard 3-Meals Plan"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Covers breakfast, lunch, and dinner with evening tea."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fixed Monthly Charge (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.fixed_monthly_charge}
                    onChange={(e) => setFormData({ ...formData, fixed_monthly_charge: e.target.value })}
                    placeholder="e.g. 500.00"
                  />
                </div>

                <div className="form-group">
                  <label>Per Meal Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.per_meal_rate}
                    onChange={(e) => setFormData({ ...formData, per_meal_rate: e.target.value })}
                    placeholder="e.g. 45.00"
                  />
                </div>
              </div>

              {editingPlan && (
                <div className="form-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    <span>Active Subscription Plan</span>
                  </label>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
