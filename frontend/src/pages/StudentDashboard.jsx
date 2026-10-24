import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';
import {
  Utensils,
  Coffee,
  Sun,
  Moon,
  Calendar,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthSummary, setMonthSummary] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentMonthStr = todayStr.slice(0, 7);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [todayRes, monthRes, payRes] = await Promise.allSettled([
        apiClient.get('/meals/today'),
        apiClient.get(`/meals/my-attendance?month=${currentMonthStr}`),
        apiClient.get('/payments/my-payments')
      ]);

      if (todayRes.status === 'fulfilled') {
        setTodayAttendance(todayRes.value.data.data);
      } else {
        console.warn('Today meal fetch failed:', todayRes.reason.message);
      }

      if (monthRes.status === 'fulfilled') {
        setMonthSummary(monthRes.value.data.data);
      }

      if (payRes.status === 'fulfilled') {
        setPaymentData(payRes.value.data.data);
      }
    } catch (err) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleToggle = async (mealType) => {
    if (!todayAttendance) return;

    const currentStatus = todayAttendance[mealType];
    const newStatus = currentStatus === 1 ? 0 : 1;

    setToggling((prev) => ({ ...prev, [mealType]: true }));
    setNotice(null);

    try {
      const response = await apiClient.post('/meals/toggle', {
        meal_date: todayStr,
        meal_type: mealType,
        status: newStatus
      });

      setTodayAttendance(response.data.data);
      setNotice(`${mealType.toUpperCase()} attendance updated to ${newStatus ? 'ON (Eating)' : 'OFF (Skipping)'}`);

      // Refresh monthly counts in background
      apiClient.get(`/meals/my-attendance?month=${currentMonthStr}`)
        .then((res) => setMonthSummary(res.data.data))
        .catch(() => {});
    } catch (err) {
      setError(err.message || `Failed to toggle ${mealType}`);
    } finally {
      setToggling((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <RefreshCw className="spin" size={24} />
          <p>Loading your mess dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="dashboard-hero">
        <div>
          <h2>Hello, {user?.name} 👋</h2>
          <p className="hero-subtext">
            Room: <strong>{user?.room_no || 'Not Assigned'}</strong> &bull; Member Status:{' '}
            <span className="badge-active">{user?.status || 'Active'}</span>
          </p>
        </div>
        <button onClick={loadDashboardData} className="btn-secondary" title="Refresh Dashboard">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {notice && (
        <div className="alert-banner alert-success">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Top Grid: Plan & Today's Attendance Toggle */}
      <div className="dashboard-grid">
        {/* Today's Meal Status Card */}
        <div className="card meal-toggle-card">
          <div className="card-header">
            <div>
              <h3>Today's Meal Attendance</h3>
              <p className="card-sub">{todayStr}</p>
            </div>
            <span className="badge-pill">
              Total Today: {todayAttendance ? (todayAttendance.breakfast + todayAttendance.lunch + todayAttendance.dinner) : 0} Meals
            </span>
          </div>

          <p className="card-hint">
            Click any meal to toggle your attendance ON (Eating) or OFF (Not Eating).
          </p>

          <div className="meal-toggles-container">
            {/* Breakfast Toggle */}
            <div className={`meal-toggle-item ${todayAttendance?.breakfast ? 'is-active' : 'is-inactive'}`}>
              <div className="meal-info">
                <Coffee size={22} className="meal-icon" />
                <div>
                  <h4>Breakfast</h4>
                  <span className="meal-status-text">
                    {todayAttendance?.breakfast ? 'Taking Breakfast' : 'Skipping Breakfast'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('breakfast')}
                disabled={toggling.breakfast}
                className={`btn-toggle ${todayAttendance?.breakfast ? 'btn-toggle-on' : 'btn-toggle-off'}`}
              >
                {toggling.breakfast ? 'Updating...' : todayAttendance?.breakfast ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Lunch Toggle */}
            <div className={`meal-toggle-item ${todayAttendance?.lunch ? 'is-active' : 'is-inactive'}`}>
              <div className="meal-info">
                <Sun size={22} className="meal-icon" />
                <div>
                  <h4>Lunch</h4>
                  <span className="meal-status-text">
                    {todayAttendance?.lunch ? 'Taking Lunch' : 'Skipping Lunch'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('lunch')}
                disabled={toggling.lunch}
                className={`btn-toggle ${todayAttendance?.lunch ? 'btn-toggle-on' : 'btn-toggle-off'}`}
              >
                {toggling.lunch ? 'Updating...' : todayAttendance?.lunch ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Dinner Toggle */}
            <div className={`meal-toggle-item ${todayAttendance?.dinner ? 'is-active' : 'is-inactive'}`}>
              <div className="meal-info">
                <Moon size={22} className="meal-icon" />
                <div>
                  <h4>Dinner</h4>
                  <span className="meal-status-text">
                    {todayAttendance?.dinner ? 'Taking Dinner' : 'Skipping Dinner'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('dinner')}
                disabled={toggling.dinner}
                className={`btn-toggle ${todayAttendance?.dinner ? 'btn-toggle-on' : 'btn-toggle-off'}`}
              >
                {toggling.dinner ? 'Updating...' : todayAttendance?.dinner ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Mess Subscription Plan Card */}
        <div className="card plan-card">
          <div className="card-header">
            <h3>My Mess Subscription</h3>
            <Link to="/plans" className="card-link">View All Plans</Link>
          </div>
          <div className="plan-content">
            <div className="plan-title-row">
              <Utensils size={28} className="plan-icon" />
              <div>
                <h4>{user?.plan_name || 'Standard Hostel Plan'}</h4>
                <p className="card-sub">Active Subscription</p>
              </div>
            </div>

            <div className="plan-stats-grid">
              <div className="plan-stat-box">
                <span className="stat-label">Fixed Monthly Fee</span>
                <span className="stat-val">₹{user?.fixed_monthly_charge || '0.00'}</span>
              </div>
              <div className="plan-stat-box">
                <span className="stat-label">Per Meal Rate</span>
                <span className="stat-val">₹{user?.per_meal_rate || '0.00'}</span>
              </div>
            </div>

            <div className="plan-footer-note">
              <FileText size={16} />
              <span>Billed at the end of each month based on actual attended meals.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="metrics-row">
        <div className="metric-box">
          <div className="metric-icon-wrap bg-blue">
            <Calendar size={20} />
          </div>
          <div>
            <span className="metric-label">Meals Consumed ({currentMonthStr})</span>
            <span className="metric-number">{monthSummary?.summary?.totalMeals || 0}</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap bg-green">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="metric-label">Total Deposits Approved</span>
            <span className="metric-number">₹{paymentData?.totalPaid || '0.00'}</span>
          </div>
        </div>

        <div className="metric-box">
          <div className="metric-icon-wrap bg-amber">
            <Coffee size={20} />
          </div>
          <div>
            <span className="metric-label">Breakfast / Lunch / Dinner</span>
            <span className="metric-number">
              {monthSummary?.summary?.totalBreakfast || 0} / {monthSummary?.summary?.totalLunch || 0} / {monthSummary?.summary?.totalDinner || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance Log Table */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Attendance Records ({currentMonthStr})</h3>
          <Link to="/student/attendance" className="btn-secondary-sm">
            Full Attendance History
          </Link>
        </div>

        {monthSummary?.records?.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Total Meals</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {monthSummary.records.slice(-7).reverse().map((rec) => (
                  <tr key={rec.id}>
                    <td><strong>{rec.meal_date}</strong></td>
                    <td>
                      {rec.breakfast ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td>
                      {rec.lunch ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td>
                      {rec.dinner ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td><strong>{rec.total_meals}</strong></td>
                    <td className="text-muted">{rec.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No attendance records found for this month yet.</p>
        )}
      </div>
    </div>
  );
}

