import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Activity, Database, Server, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function HealthStatus() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/health');
      setHealth(response.data.data);
    } catch (err) {
      // If 503 was returned, err.data may contain degraded diagnostic info
      if (err.data && err.data.data) {
        setHealth(err.data.data);
      } else {
        setError(err.message || 'Unable to connect to backend server');
        setHealth(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const isDbConnected = health?.database?.status === 'connected';
  const isServerRunning = Boolean(health);

  return (
    <div className="health-card">
      <div className="health-card-header">
        <div className="health-title">
          <Activity className="icon-pulse" size={20} />
          <h3>System Connectivity Diagnostics</h3>
        </div>
        <button
          onClick={fetchHealth}
          disabled={loading}
          className="btn-refresh"
          title="Refresh connection status"
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Checking...' : 'Check Status'}</span>
        </button>
      </div>

      <div className="health-grid">
        {/* Backend Server Status */}
        <div className={`health-item ${isServerRunning ? 'status-ok' : 'status-err'}`}>
          <div className="item-icon">
            <Server size={22} />
          </div>
          <div className="item-details">
            <span className="item-label">Express Backend</span>
            <span className="item-val">
              {isServerRunning ? (
                <>
                  <CheckCircle2 size={14} className="icon-inline" /> Connected (Uptime: {health.uptimeSeconds}s)
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="icon-inline" /> Offline / Unreachable
                </>
              )}
            </span>
          </div>
        </div>

        {/* MySQL Database Status */}
        <div className={`health-item ${isDbConnected ? 'status-ok' : 'status-warn'}`}>
          <div className="item-icon">
            <Database size={22} />
          </div>
          <div className="item-details">
            <span className="item-label">MySQL Database</span>
            <span className="item-val">
              {isDbConnected ? (
                <>
                  <CheckCircle2 size={14} className="icon-inline" /> Connected
                </>
              ) : (
                <>
                  <AlertCircle size={14} className="icon-inline" />
                  {health ? ' Disconnected (Pending user configuration)' : ' Unknown (Backend unreachable)'}
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {health?.database?.details && !isDbConnected && (
        <div className="health-hint">
          <strong>Database Notice:</strong> {health.database.details}
          <br />
          <span>(Please ensure MySQL is running and credentials in <code>backend/.env</code> are correct)</span>
        </div>
      )}

      {error && !health && (
        <div className="health-hint hint-error">
          <strong>Connection Error:</strong> {error}
          <br />
          <span>(Make sure the backend server is running on <code>http://localhost:5000</code>)</span>
        </div>
      )}
    </div>
  );
}
