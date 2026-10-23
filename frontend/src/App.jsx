import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StudentAttendance from './pages/StudentAttendance';
import AdminDashboard from './pages/AdminDashboard';
import AdminAttendance from './pages/AdminAttendance';
import PlansManagement from './pages/PlansManagement';
import PaymentsManagement from './pages/PaymentsManagement';
import ExpensesManagement from './pages/ExpensesManagement';
import StudentManagement from './pages/StudentManagement';

import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/plans" element={<PlansManagement />} />

              {/* Student Protected Routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/payments"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <PaymentsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <StudentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/attendance"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/expenses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ExpensesManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PaymentsManagement />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <p>MealMate &bull; Student Mess & Hostel Dining Management System &bull; React + Express + MySQL</p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
