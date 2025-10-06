
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import MyBookings from './MyBookings';
import ClassList from './ClassList';

function Dashboard() {
  const { token } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useCallback to prevent the function from being recreated on every render
  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const [bookingsData, classesData] = await Promise.all([
        api.getMyBookings(token),
        api.getClasses(token)
      ]);

      setMyBookings(bookingsData);
      setAvailableClasses(classesData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
        <div className="d-flex justify-content-center p-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  if (error) {
    return <p>Loading data...</p>;
  }

  return (
    <div>
      <div className="row g-5">
        <div className="col-lg-6">
          <h3>My bookings</h3>
          <MyBookings bookings={myBookings} onActionSuccess={fetchData} />
        </div>
        <div className="col-lg-6">
          <h3>Available Classes</h3>
          <ClassList classes={availableClasses} onActionSuccess={fetchData} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
