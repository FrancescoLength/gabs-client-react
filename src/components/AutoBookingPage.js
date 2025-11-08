import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import AutoBookingScheduler from './AutoBookingScheduler';
import MyAutoBookings from './MyAutoBookings';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

function AutoBookingPage() {
  const { token } = useAuth();
  const [staticClasses, setStaticClasses] = useState({});
  const [loadingStaticClasses, setLoadingStaticClasses] = useState(true);
  const [errorStaticClasses, setErrorStaticClasses] = useState(null);
  const [refreshAutoBookings, setRefreshAutoBookings] = useState(0); // State to trigger refresh

  const handleRefreshAutoBookings = useCallback(() => {
    setRefreshAutoBookings(prev => prev + 1); // Increment state to trigger re-fetch in MyAutoBookings
  }, []);

  useEffect(() => {
    const fetchStaticClasses = async () => {
        if (!token) return;
        try {
            setLoadingStaticClasses(true);
            setErrorStaticClasses(null);
            const data = await api.getStaticClasses(token);
            setStaticClasses(data);
        } catch (err) {
            setErrorStaticClasses(err.message);
        } finally {
            setLoadingStaticClasses(false);
        }
    };

    fetchStaticClasses();
  }, [token]);

  if (loadingStaticClasses) {
    return (
        <div className="d-flex justify-content-center p-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
  }

  if (errorStaticClasses) {
    return <p>Error: {errorStaticClasses}</p>;
  }

  return (
    <div>
      <div className="row g-5">
        <div className="col-lg-6">
          <MyAutoBookings staticClasses={staticClasses} onActionSuccess={handleRefreshAutoBookings} refreshTrigger={refreshAutoBookings} />
        </div>
        <div className="col-lg-6">
          <AutoBookingScheduler staticClasses={staticClasses} onActionSuccess={handleRefreshAutoBookings} />
        </div>
      </div>
    </div>
  );
}

export default AutoBookingPage;
