import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import { Utensils, Mail, Lock, User, Home, Phone, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    room_no: '',
    phone: '',
    plan_id: ''
  });
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load available mess plans for student selection
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await apiClient.get('/plans');
        setPlans(response.data.data || []);
      } catch (err) {
        console.warn('Could not pre-load plans:', err.message);
      }
    }
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        room_no: formData.role === 'student' ? formData.room_no : undefined,
        phone: formData.phone || undefined,
        plan_id: formData.role === 'student' && formData.plan_id ? Number(formData.plan_id) : undefined
      };

      const user = await register(payload);
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
    } catch (err) {
      if (err.data?.error?.details) {
        setError(err.data.error.details.join(', '));
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">
            <Utensils size={28} />
          </div>
          <h2>Create Account</h2>
          <p>Register as a student or mess administrator</p>
        </div>

        {error && (
          <div className="alert-banner alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Aman Sharma"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="aman@example.com"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password (min 6 characters) *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role">Role *</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="select-input"
              >
                <option value="student">Student / Member</option>
                <option value="admin">Mess Manager / Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="room_no">Hostel / Room No.</label>
                <div className="input-with-icon">
                  <Home size={18} className="input-icon" />
                  <input
                    id="room_no"
                    name="room_no"
                    type="text"
                    value={formData.room_no}
                    onChange={handleChange}
                    placeholder="e.g. B-204"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'student' && plans.length > 0 && (
            <div className="form-group">
              <label htmlFor="plan_id">Select Mess Subscription Plan</label>
              <select
                id="plan_id"
                name="plan_id"
                value={formData.plan_id}
                onChange={handleChange}
                className="select-input"
              >
                <option value="">-- Choose a Mess Plan (Optional) --</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan_name} (₹{p.fixed_monthly_charge}/mo + ₹{p.per_meal_rate}/meal)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary-full">
            {submitting ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
