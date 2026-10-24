import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import {
  Users,
  Utensils,
  ShoppingBag,
  CreditCard,
  CalendarCheck,
  Coffee,
  Sun,
  Moon,
  RefreshCw,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/admin/stats');
      setStats(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <RefreshCw className="spin" size={24} />
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="dashboard-hero">
        <div>
          <h2>Mess Administration Dashboard 🛡️</h2>
          <p className="hero-subtext">
            Date: <strong>{stats?.date || new Date().toISOString().slice(0, 10)}</strong> &bull; Total Registered Students:{' '}
            <strong>{stats?.students?.total || 0}</strong>
          </p>
        </div>
        <button onClick={fetchStats} className="btn-secondary" title="Refresh">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="admin-stats-grid">
        <div className="card stat-card">
          <div className="stat-icon-wrap bg-blue">
            <Users size={24} />
          </div>
          <div>
            <span className="stat-label">Active Students</span>
            <span className="stat-main">{stats?.students?.active || 0}</span>
            <span className="stat-sub">Out of {stats?.students?.total || 0} total enrolled</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap bg-green">
            <CreditCard size={24} />
          </div>
          <div>
            <span className="stat-label">Deposits Collected ({stats?.month})</span>
            <span className="stat-main">₹{stats?.financeThisMonth?.totalCollections || '0.00'}</span>
            <span className="stat-sub">Approved student fee payments</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap bg-amber">
            <ShoppingBag size={24} />
          </div>
          <div>
            <span className="stat-label">Mess Expenses ({stats?.month})</span>
            <span className="stat-main">₹{stats?.financeThisMonth?.totalExpenses || '0.00'}</span>
            <span className="stat-sub">Groceries, gas & supplies</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrap bg-purple">
            <Utensils size={24} />
          </div>
          <div>
            <span className="stat-label">Expected Meals Today</span>
            <span className="stat-main">
              {(stats?.mealsToday?.breakfast || 0) + (stats?.mealsToday?.lunch || 0) + (stats?.mealsToday?.dinner || 0)}
            </span>
            <span className="stat-sub">Total plates across 3 meals</span>
          </div>
        </div>
      </div>

      {/* Cook Headcount Summary Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3>Today's Kitchen Headcount (Meal Attendance)</h3>
            <p className="card-sub">Accurate count for food preparation today</p>
          </div>
          <Link to="/admin/attendance" className="card-link">
            Manage Attendance Roster <ArrowRight size={15} />
          </Link>
        </div>

        <div className="headcount-grid">
          <div className="headcount-box">
            <Coffee size={24} className="text-amber" />
            <div className="headcount-info">
              <span className="headcount-val">{stats?.mealsToday?.breakfast || 0}</span>
              <span className="headcount-name">Breakfast Plates</span>
            </div>
          </div>

          <div className="headcount-box">
            <Sun size={24} className="text-blue" />
            <div className="headcount-info">
              <span className="headcount-val">{stats?.mealsToday?.lunch || 0}</span>
              <span className="headcount-name">Lunch Plates</span>
            </div>
          </div>

          <div className="headcount-box">
            <Moon size={24} className="text-purple" />
            <div className="headcount-info">
              <span className="headcount-val">{stats?.mealsToday?.dinner || 0}</span>
              <span className="headcount-name">Dinner Plates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="quick-actions-grid">
        <Link to="/admin/students" className="card quick-action-card">
          <Users size={24} className="action-icon" />
          <h4>Student Directory</h4>
          <p>View student list, room numbers, and assigned mess subscription plans.</p>
        </Link>

        <Link to="/admin/attendance" className="card quick-action-card">
          <CalendarCheck size={24} className="action-icon" />
          <h4>Daily Attendance Roster</h4>
          <p>Inspect or toggle meal presence for any student date-by-date.</p>
        </Link>

        <Link to="/admin/expenses" className="card quick-action-card">
          <ShoppingBag size={24} className="action-icon" />
          <h4>Mess Expenses & Bazar</h4>
          <p>Log vegetable, dairy, utility, and maintenance spending with receipts.</p>
        </Link>

        <Link to="/admin/payments" className="card quick-action-card">
          <CreditCard size={24} className="action-icon" />
          <h4>Fee Deposits & Ledgers</h4>
          <p>Record manual payments, approve online transfers, and review student dues.</p>
        </Link>
      </div>
    </div>
  );
}

