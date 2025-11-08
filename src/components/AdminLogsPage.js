import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

const AdminLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [sshTunnelCommand, setSshTunnelCommand] = useState(null);
  const [autoBookings, setAutoBookings] = useState([]);
  const [pushSubscriptions, setPushSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        if (activeTab === 'logs') {
          const { logs } = await api.getAdminLogs(token);
          setLogs(logs);
        } else if (activeTab === 'autoBookings') {
          const autoBookingsData = await api.getAdminAutoBookings(token);
          setAutoBookings(autoBookingsData);
        } else if (activeTab === 'pushSubscriptions') {
          const pushSubscriptionsData = await api.getAdminPushSubscriptions(token);
          setPushSubscriptions(pushSubscriptionsData);
        } else if (activeTab === 'users') {
          const usersData = await api.getAdminUsers(token);
          setUsers(usersData);
        } else if (activeTab === 'sessions') {
          const sessionsData = await api.getAdminSessions(token);
          setSessions(sessionsData);
        } else if (activeTab === 'status') {
          const statusData = await api.getAdminStatus(token);
          setStatus(statusData);
          setSshTunnelCommand(statusData.ssh_tunnel_command);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [token, activeTab]);

  const renderContent = () => {
    if (error) {
      return <div className="alert alert-danger">{error}</div>;
    }

    const getLevelClass = (level) => {
      switch (level) {
        case 'INFO':
          return 'text-info';
        case 'WARNING':
          return 'text-warning';
        case 'ERROR':
        case 'CRITICAL':
          return 'text-danger fw-bold';
        default:
          return 'text-muted';
      }
    };

    switch (activeTab) {
      case 'status':
        return status ? (
          <div>
            <p><strong>Status:</strong> {status.status}</p>
            <p><strong>Uptime:</strong> {status.uptime}</p>
            {sshTunnelCommand && <p><strong>SSH TUNNEL:</strong> {sshTunnelCommand}</p>}
          </div>
        ) : <p>Loading...</p>;
      case 'logs':
        return (
          <div>
            {logs ? logs.map((log, index) => (
              <div key={index} className="border-bottom mb-2 pb-2">
                <div className="d-flex justify-content-between">
                  <span className={`fw-bold ${getLevelClass(log.level)}`}>{log.level}</span>
                  <span className="text-muted small">{log.timestamp}</span>
                </div>
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.875em' }}>
                  {log.message}
                </pre>
              </div>
            )) : <p>Loading logs...</p>}
          </div>
        );
      case 'autoBookings':
        return (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Class Name</th>
                  <th>Time</th>
                  <th>Day</th>
                  <th>Instructor</th>
                  <th>Status</th>
                  <th>Last Booked</th>
                  <th>Created At</th>
                  <th>Last Attempt</th>
                  <th>Retries</th>
                  <th>Notif. Sent</th>
                </tr>
              </thead>
              <tbody>
                {autoBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.username}</td>
                    <td>{b.class_name}</td>
                    <td>{b.target_time}</td>
                    <td>{b.day_of_week}</td>
                    <td>{b.instructor}</td>
                    <td>{b.status}</td>
                    <td>{b.last_booked_date}</td>
                    <td>{new Date(b.created_at * 1000).toLocaleString()}</td>
                    <td>{b.last_attempt_at ? new Date(b.last_attempt_at * 1000).toLocaleString() : 'N/A'}</td>
                    <td>{b.retry_count}</td>
                    <td>{b.notification_sent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'pushSubscriptions':
        return (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Endpoint</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {pushSubscriptions.map(s => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.username}</td>
                    <td>{s.endpoint}</td>
                    <td>{new Date(s.created_at * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'users':
        return (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={index}>
                    <td>{user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'sessions':
        return (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Encrypted Password</th>
                  <th>Session Data</th>
                  <th>Updated At</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, index) => (
                  <tr key={index}>
                    <td>{session.username}</td>
                    <td>{session.encrypted_password}</td>
                    <td>{JSON.stringify(session.session_data)}</td>
                    <td>{new Date(session.updated_at * 1000).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Admin Logs</h2>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'status' ? 'active' : ''}`} onClick={() => setActiveTab('status')}>Status</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>Logs</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'autoBookings' ? 'active' : ''}`} onClick={() => setActiveTab('autoBookings')}>Auto Bookings</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'pushSubscriptions' ? 'active' : ''}`} onClick={() => setActiveTab('pushSubscriptions')}>Push Subscriptions</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>Sessions</button>
        </li>
      </ul>
      <div className="mt-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminLogsPage;
