import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthStatus from '../components/HealthStatus';
import {
  Utensils,
  Users,
  CalendarCheck,
  CreditCard,
  ShoppingBag,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-badge">
          <ShieldCheck size={16} />
          <span>Campus Mess Management Made Simple</span>
        </div>
        <h1 className="hero-title">
          Smart Dining & Meal Tracking with <span className="highlight">MealMate</span>
        </h1>
        <p className="hero-description">
          A full-stack hostel mess platform for automated meal attendance toggling, transparent monthly billing, grocery expense tracking, and kitchen headcount forecasting.
        </p>

        <div className="hero-cta-group">
          {isAuthenticated ? (
            <Link to={isAdmin ? '/admin' : '/student'} className="btn-hero-primary">
              Go to My Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-hero-primary">
                Student & Admin Login <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-hero-secondary">
                Register Student
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Live System Diagnostics */}
      <section className="home-section">
        <HealthStatus />
      </section>

      {/* Feature Showcase Grid */}
      <section className="home-section">
        <div className="section-title">
          <h2>Core System Capabilities</h2>
          <p>Designed for student hostels, college messes, and dining halls</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <CalendarCheck size={28} className="feature-icon" />
            <h4>Daily Attendance Toggles</h4>
            <p>Students can toggle breakfast, lunch, and dinner attendance with zero duplicate records.</p>
          </div>

          <div className="feature-card">
            <Utensils size={28} className="feature-icon" />
            <h4>Mess Subscription Plans</h4>
            <p>Flexible billing with configurable fixed monthly charges and per-meal consumption rates.</p>
          </div>

          <div className="feature-card">
            <CreditCard size={28} className="feature-icon" />
            <h4>Fee Deposits & Ledgers</h4>
            <p>Track student payments via UPI, cash, and bank transfers with instant digital receipts.</p>
          </div>

          <div className="feature-card">
            <ShoppingBag size={28} className="feature-icon" />
            <h4>Bazar & Expense Audits</h4>
            <p>Log vegetables, dairy, groceries, and utility bills for accurate meal cost calculations.</p>
          </div>

          <div className="feature-card">
            <Users size={28} className="feature-icon" />
            <h4>Kitchen Headcount Forecasting</h4>
            <p>Cooks and mess managers view real-time plate counts before meal preparation starts.</p>
          </div>

          <div className="feature-card">
            <ShieldCheck size={28} className="feature-icon" />
            <h4>Role-Based Access Control</h4>
            <p>Strict JWT and bcrypt protected boundaries separating admin managers and students.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

