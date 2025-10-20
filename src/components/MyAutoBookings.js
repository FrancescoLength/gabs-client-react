import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

function MyAutoBookings({ onActionSuccess, staticClasses, refreshTrigger }) {
    const { token } = useAuth();
    const [autoBookings, setAutoBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const getNextOccurrence = (dayOfWeek, startTime, lastBookedDate) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
        
        let daysUntilTarget = (targetDayIndex - today.getDay() + 7) % 7;
        
        let nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilTarget);
        nextDate.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);

        // Adjust for classes that have already passed today
        if (daysUntilTarget === 0 && today.getTime() > nextDate.getTime()) {
            nextDate.setDate(nextDate.getDate() + 7);
        }

        // Adjust for classes that were already booked on this date
        if (lastBookedDate) {
            const [lbYear, lbMonth, lbDay] = lastBookedDate.split('-').map(Number);
            const lastBooked = new Date(lbYear, lbMonth - 1, lbDay);
            if (nextDate.toDateString() === lastBooked.toDateString()) {
                nextDate.setDate(nextDate.getDate() + 7);
            }
        }

        // Now, ensure the booking window is in the future
        let bookingOpenTime = new Date(nextDate.getTime() - 48 * 60 * 60 * 1000);
        while (bookingOpenTime.getTime() < new Date().getTime()) {
            nextDate.setDate(nextDate.getDate() + 7);
            bookingOpenTime = new Date(nextDate.getTime() - 48 * 60 * 60 * 1000);
        }
        
        return nextDate;
    };

    const fetchAutoBookings = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const data = await api.getAutoBookings(token);
            setAutoBookings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token, refreshTrigger]);

    useEffect(() => {
        fetchAutoBookings();
    }, [fetchAutoBookings]);

    useEffect(() => {
        const timer = setInterval(() => {
            setAutoBookings(prevBookings => [...prevBookings]); 
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (successMessage || errorMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                setErrorMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, errorMessage]);

    const handleCancelAutoBook = async (bookingId) => {
        try {
            setSuccessMessage(null);
            setErrorMessage(null);
            const response = await api.cancelAutoBooking(token, bookingId);
            alert(response.message);
            onActionSuccess();
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    if (loading) return <p>Loading scheduled auto-bookings...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h4>My Scheduled Auto-Bookings</h4>
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            {autoBookings.length === 0 ? (
                <p>No automatic bookings scheduled.</p>
            ) : (
                <ul className="list-group">
                    {autoBookings.map((booking) => {
                        console.log('Booking object:', booking);
                        const nextClassTime = getNextOccurrence(booking.day_of_week, booking.target_time, booking.last_booked_date);
                        let countdown = '';
                        if (nextClassTime) {
                            const bookingOpenTime = new Date(nextClassTime.getTime() - 48 * 60 * 60 * 1000);
                            const diff = bookingOpenTime.getTime() - new Date().getTime();
                            if (diff > 0) {
                                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                                countdown = `Booking opens in: ${days > 0 ? `${days}d ` : ''}${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
                            } else {
                                countdown = 'Booking attempt due soon or in progress.';
                            }
                        }

                        let displayEndTime = '';
                        if (staticClasses && booking.day_of_week && staticClasses[booking.day_of_week]) {
                            const classDetails = staticClasses[booking.day_of_week].find(
                                (cls) => cls.name === booking.class_name && cls.start_time === booking.target_time && cls.instructor === booking.instructor
                            );
                            if (classDetails) displayEndTime = classDetails.end_time;
                        }

                        return (
                            <li key={booking.id} className="list-group-item">
                                <div>
                                    <strong>{booking.class_name}</strong>
                                    <span className="ms-2">({booking.day_of_week} at {booking.target_time}{displayEndTime && ` - ${displayEndTime}`})</span>
                                </div>
                                <div>
                                    Instructor: {booking.instructor}
                                </div>
                                <div>
                                    Status: <span className={`badge bg-${booking.status === 'pending' ? 'info' : 'secondary'}`}>{booking.status}</span>
                                    {countdown && <span className="ms-2 text-muted">{countdown}</span>}
                                </div>
                                {booking.status === 'pending' && (
                                    <button
                                        className="btn btn-danger btn-sm mt-2"
                                        onClick={() => handleCancelAutoBook(booking.id)}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default MyAutoBookings;