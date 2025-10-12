import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

const AdminLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState([]);
  const [autoBookings, setAutoBookings] = useState([]);
  const [pushSubscriptions, setPushSubscriptions] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        if (activeTab === 'logs') {
          const logsData = await api.getAdminLogs(token);
          setLogs(logsData);
        } else if (activeTab === 'autoBookings') {
          const autoBookingsData = await api.getAdminAutoBookings(token);
          setAutoBookings(autoBookingsData);
        } else if (activeTab === 'pushSubscriptions') {
          const pushSubscriptionsData = await api.getAdminPushSubscriptions(token);
          setPushSubscriptions(pushSubscriptionsData);
        } else if (activeTab === 'status') {
          const statusData = await api.getAdminStatus(token);
          setStatus(statusData);
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

    switch (activeTab) {
      case 'status':
        return status ? (
          <div>
            <p><strong>Status:</strong> {status.status}</p>
            <p><strong>Uptime:</strong> {status.uptime}</p>
            <p><strong>Scraper Cache Size:</strong> {status.scraper_cache_size}</p>
          </div>
        ) : <p>Loading...</p>;
      case 'logs':
        return (
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
            {logs.join('')}
          </pre>
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
                  <tr key={b[0]}>
                    <td>{b[0]}</td>
                    <td>{b[1]}</td>
                    <td>{b[2]}</td>
                    <td>{b[3]}</td>
                    <td>{b[8]}</td>
                    <td>{b[9]}</td>
                    <td>{b[4]}</td>
                    <td>{b[10]}</td>
                    <td>{new Date(b[5] * 1000).toLocaleString()}</td>
                    <td>{b[6] ? new Date(b[6] * 1000).toLocaleString() : 'N/A'}</td>
                    <td>{b[7]}</td>
                    <td>{b[11]}</td>
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
      </ul>
      <div className="mt-3">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminLogsPage;