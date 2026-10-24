import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Utensils,
  LogOut,
  User,
  Shield,
  CalendarCheck,
  CreditCard,
  ShoppingBag,
  Users,
  Menu,
  X,
  FileText
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="brand-logo">
            <Utensils size={22} />
          </div>
          <span className="brand-title">MealMate</span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Nav Links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              {isStudent && (
                <>
                  <NavLink to="/student" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/student/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <CalendarCheck size={16} /> Meal Tracker
                  </NavLink>
                  <NavLink to="/student/payments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <CreditCard size={16} /> Payments
                  </NavLink>
                  <NavLink to="/plans" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <FileText size={16} /> Mess Plans
                  </NavLink>
                </>
              )}

              {isAdmin && (
                <>
                  <NavLink to="/admin" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/admin/students" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <Users size={16} /> Students
                  </NavLink>
                  <NavLink to="/admin/attendance" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <CalendarCheck size={16} /> Daily Headcount
                  </NavLink>
                  <NavLink to="/plans" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <FileText size={16} /> Plans
                  </NavLink>
                  <NavLink to="/admin/expenses" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <ShoppingBag size={16} /> Expenses
                  </NavLink>
                  <NavLink to="/admin/payments" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                    <CreditCard size={16} /> Payments
                  </NavLink>
                </>
              )}

              {/* User badge and Logout */}
              <div className="nav-user-meta">
                <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-student'}`}>
                  {isAdmin ? <Shield size={13} /> : <User size={13} />}
                  {user?.name} {user?.room_no ? `(${user.room_no})` : ''}
                </span>
                <button onClick={handleLogout} className="btn-logout" title="Log out">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-auth-buttons">
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} onClick={closeMenu}>
                Login
              </NavLink>
              <NavLink to="/register" className="btn-nav-primary" onClick={closeMenu}>
                Register Student
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

