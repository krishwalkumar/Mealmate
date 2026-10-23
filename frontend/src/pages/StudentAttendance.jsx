import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Calendar, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function StudentAttendance() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = async (month) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/meals/my-attendance?month=${month}`);
      setAttendanceData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load meal attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedMonth);
  }, [selectedMonth]);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>Meal Attendance Tracker</h2>
          <p className="page-sub">View and verify your monthly meal consumption log</p>
        </div>

        <div className="filter-group">
          <label htmlFor="month-select" className="filter-label">Select Month:</label>
          <input
            id="month-select"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="month-input"
          />
        </div>
      </div>

      {error && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="metrics-row">
        <div className="metric-box">
          <span className="metric-label">Total Meals Consumed</span>
          <span className="metric-number">{attendanceData?.summary?.totalMeals || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Breakfasts Eaten</span>
          <span className="metric-number">{attendanceData?.summary?.totalBreakfast || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Lunches Eaten</span>
          <span className="metric-number">{attendanceData?.summary?.totalLunch || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Dinners Eaten</span>
          <span className="metric-number">{attendanceData?.summary?.totalDinner || 0}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3>Daily Log for {selectedMonth}</h3>
          <button onClick={() => fetchAttendance(selectedMonth)} className="btn-secondary-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={20} />
            <p>Loading attendance log...</p>
          </div>
        ) : attendanceData?.records?.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Daily Count</th>
                  <th>Remarks / Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.records.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.meal_date}</strong></td>
                    <td>
                      {row.breakfast ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td>
                      {row.lunch ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td>
                      {row.dinner ? (
                        <span className="tag-ok"><CheckCircle2 size={13} /> Present</span>
                      ) : (
                        <span className="tag-off"><XCircle size={13} /> Off</span>
                      )}
                    </td>
                    <td><strong>{row.total_meals}</strong></td>
                    <td className="text-muted">{row.remarks || 'Standard Meal'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No attendance records logged for {selectedMonth}.</p>
        )}
      </div>
    </div>
  );
}
