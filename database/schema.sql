-- ====================================================================
-- MealMate - Mess Management System Initial Normalized Schema
-- Database: mealmate_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS mealmate_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mealmate_db;

-- 1. Mess Plans Table
-- Stores subscription plans offered by the mess (e.g. Standard, Full Board, Lunch/Dinner only)
CREATE TABLE IF NOT EXISTS mess_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    fixed_monthly_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    per_meal_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
-- Supports roles: admin and student. Passwords stored as hashes.
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    room_no VARCHAR(20) NULL,
    phone VARCHAR(20) NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    plan_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES mess_plans(id) ON DELETE SET NULL,
    INDEX idx_user_role (role),
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 3. Daily Meal Attendance Table
-- Tracks daily attendance for breakfast, lunch, and dinner per student.
-- Enforces one attendance record per student per date.
CREATE TABLE IF NOT EXISTS meal_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    meal_date DATE NOT NULL,
    breakfast TINYINT(1) NOT NULL DEFAULT 0,
    lunch TINYINT(1) NOT NULL DEFAULT 1,
    dinner TINYINT(1) NOT NULL DEFAULT 1,
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_daily_meal (user_id, meal_date),
    INDEX idx_meal_date (meal_date)
) ENGINE=InnoDB;

-- 4. Payment Records Table
-- Tracks student payments/deposits against mess dues.
CREATE TABLE IF NOT EXISTS payment_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_mode ENUM('upi', 'cash', 'bank_transfer') NOT NULL DEFAULT 'upi',
    transaction_ref VARCHAR(100) NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    recorded_by INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_payments (user_id, payment_date)
) ENGINE=InnoDB;

-- 5. Mess Expenses Table
-- Tracks mess operating costs (daily bazar, groceries, gas, utilities).
CREATE TABLE IF NOT EXISTS mess_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category ENUM('groceries', 'vegetables', 'dairy', 'gas_utility', 'maintenance', 'other') NOT NULL DEFAULT 'groceries',
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url VARCHAR(255) NULL,
    recorded_by INT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB;
