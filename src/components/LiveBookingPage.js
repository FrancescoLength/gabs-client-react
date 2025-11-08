import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import MyBookings from './MyBookings';
import ClassList from './ClassList';


const parseBookingDate = (dateString) => {
    const parts = dateString.split(' ');
    if (parts.length < 3) return null;

    const day = parts[1].replace(/\D/g, '');
    const monthName = parts[2];
    const year = new Date().getFullYear();

    const monthMap = { 'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06', 'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12' };
    const month = monthMap[monthName.toLowerCase()];

    if (!month || !day) return null;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

const parseAvailableClassDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

function LiveBookingPage() {
  const { token } = useAuth(); // Get logout from useAuth
  
  const [myBookings, setMyBookings] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const bookingsData = await api.getMyBookings(token);
      const classesData = await api.getClasses(token);

      const bookedClassesSet = new Set(bookingsData.map(b => `${b.name}|${parseBookingDate(b.date)}|${b.time}`));

      const filteredClasses = classesData.filter(c => !bookedClassesSet.has(`${c.name}|${parseAvailableClassDate(c.date)}|${c.start_time}`));

      setMyBookings(bookingsData);
      setAvailableClasses(filteredClasses);

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
    return <p>Error: {error}</p>;
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

export default LiveBookingPage;
