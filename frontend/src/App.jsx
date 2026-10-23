import React from 'react';
import HealthStatus from './components/HealthStatus';
import { Utensils, Users, CalendarCheck, CreditCard, ShoppingBag, ShieldCheck } from 'lucide-react';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-logo">
            <Utensils size={24} />
          </div>
          <div>
            <h1 className="brand-title">MealMate</h1>
            <p className="brand-subtitle">Mess & Hostel Meal Management System</p>
          </div>
        </div>
        <div className="nav-pill">
          <ShieldCheck size={16} />
          <span>Phase 1: Foundation Ready</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Welcome Section */}
        <section className="hero-section">
          <h2>Welcome to MealMate</h2>
          <p>
            Project foundation has been initialized with React + Vite, Express, and a normalized MySQL schema.
          </p>
        </section>

        {/* Live Diagnostics Component */}
        <section className="diagnostics-section">
          <HealthStatus />
        </section>

        {/* Architectural Scope Overview */}
        <section className="features-preview">
          <h3>Architectural Modules (Schema Ready)</h3>
          <div className="features-grid">
            <div className="feature-card">
              <Users size={24} className="feature-icon" />
              <h4>User & Role Management</h4>
              <p>Admins and Students with hashed passwords and profile records.</p>
            </div>
            <div className="feature-card">
              <Utensils size={24} className="feature-icon" />
              <h4>Mess Subscription Plans</h4>
              <p>Configurable fixed monthly charges and per-meal rate plans.</p>
            </div>
            <div className="feature-card">
              <CalendarCheck size={24} className="feature-icon" />
              <h4>Daily Meal Attendance</h4>
              <p>Breakfast, lunch, and dinner attendance tracking with date uniqueness.</p>
            </div>
            <div className="feature-card">
              <CreditCard size={24} className="feature-icon" />
              <h4>Payment Records</h4>
              <p>Tracking UPI, cash, and bank payments linked to student ledgers.</p>
            </div>
            <div className="feature-card">
              <ShoppingBag size={24} className="feature-icon" />
              <h4>Mess Operating Expenses</h4>
              <p>Grocery, vegetables, and utility bills logging for accurate meal rates.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>MealMate Mess Management System &bull; Windows Environment &bull; Node.js + Express + React</p>
      </footer>
    </div>
  );
}
