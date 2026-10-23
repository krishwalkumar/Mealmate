import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { CalendarCheck, Coffee, Sun, Moon, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminAttendance() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchAttendance = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/meals/daily?date=${date}`);
      setAttendanceData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load daily attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const handleToggle = async (studentId, studentName, mealType, currentVal) => {
    const key = `${studentId}-${mealType}`;
    const newVal = currentVal === 1 ? 0 : 1;

    setToggling((prev) => ({ ...prev, [key]: true }));
    setNotice(null);

    try {
      await apiClient.post('/meals/toggle', {
        meal_date: selectedDate,
        meal_type: mealType,
        status: newVal,
        user_id: studentId
      });

      setNotice(`Updated ${studentName}'s ${mealType} to ${newVal ? 'Present' : 'Off'}`);
      fetchAttendance(selectedDate);
    } catch (err) {
      setError(err.message || 'Failed to update attendance');
    } finally {
      setToggling((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h2>Daily Student Meal Attendance</h2>
          <p className="page-sub">View and override meal attendance for all registered hostel students</p>
        </div>

        <div className="filter-group">
          <label htmlFor="date-input" className="filter-label">Select Date:</label>
          <input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <button onClick={() => fetchAttendance(selectedDate)} className="btn-secondary-sm" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
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

      {/* Daily Kitchen Headcount Totals */}
      <div className="metrics-row">
        <div className="metric-box">
          <span className="metric-label">Enrolled Students</span>
          <span className="metric-number">{attendanceData?.aggregates?.totalStudents || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Breakfast Plates Expected</span>
          <span className="metric-number text-amber">{attendanceData?.aggregates?.expectedBreakfast || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Lunch Plates Expected</span>
          <span className="metric-number text-blue">{attendanceData?.aggregates?.expectedLunch || 0}</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Dinner Plates Expected</span>
          <span className="metric-number text-purple">{attendanceData?.aggregates?.expectedDinner || 0}</span>
        </div>
      </div>

      {/* Student Attendance Roster Table */}
      <div className="card">
        <div className="card-header">
          <h3>Student Roster for {selectedDate}</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spin" size={20} />
            <p>Loading student attendance...</p>
          </div>
        ) : attendanceData?.students?.length > 0 ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Room No</th>
                  <th>Breakfast</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Total Meals</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.students.map((s) => (
                  <tr key={s.user_id}>
                    <td><strong>{s.name}</strong></td>
                    <td>{s.room_no || '—'}</td>
                    <td>
                      <button
                        onClick={() => handleToggle(s.user_id, s.name, 'breakfast', s.breakfast)}
                        disabled={toggling[`${s.user_id}-breakfast`]}
                        className={`btn-table-toggle ${s.breakfast ? 'btn-active' : 'btn-off'}`}
                      >
                        {s.breakfast ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{s.breakfast ? 'Present' : 'Off'}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(s.user_id, s.name, 'lunch', s.lunch)}
                        disabled={toggling[`${s.user_id}-lunch`]}
                        className={`btn-table-toggle ${s.lunch ? 'btn-active' : 'btn-off'}`}
                      >
                        {s.lunch ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{s.lunch ? 'Present' : 'Off'}</span>
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggle(s.user_id, s.name, 'dinner', s.dinner)}
                        disabled={toggling[`${s.user_id}-dinner`]}
                        className={`btn-table-toggle ${s.dinner ? 'btn-active' : 'btn-off'}`}
                      >
                        {s.dinner ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        <span>{s.dinner ? 'Present' : 'Off'}</span>
                      </button>
                    </td>
                    <td>
                      <strong>{s.total_meals}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No active students registered in the system.</p>
        )}
      </div>
    </div>
  );
}
