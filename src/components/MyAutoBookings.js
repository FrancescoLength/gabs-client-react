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
        console.log('--- getNextOccurrence Debug ---');
        console.log('Input: dayOfWeek', dayOfWeek, 'startTime', startTime, 'lastBookedDate', lastBookedDate);

        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        console.log('today (Date object):', today);
        console.log('today.getDay():', today.getDay());

        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
        console.log('targetDayIndex:', targetDayIndex);
        
        let daysUntilTarget = (targetDayIndex - today.getDay() + 7) % 7;
        console.log('daysUntilTarget (initial):', daysUntilTarget);

        if (daysUntilTarget === 0 && today.getHours() >= parseInt(startTime.split(':')[0])) {
            console.log('Class is today and time has passed, advancing by 7 days.');
            daysUntilTarget = 7;
        }
        console.log('daysUntilTarget (after adjustment):', daysUntilTarget);

        let nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilTarget);
        console.log('nextDate (before time set):', nextDate);

        if (lastBookedDate) {
            console.log('lastBookedDate is present:', lastBookedDate);
            const [lbYear, lbMonth, lbDay] = lastBookedDate.split('-').map(Number);
            const lastBooked = new Date(lbYear, lbMonth - 1, lbDay);
            console.log('lastBooked (Date object):', lastBooked);
            if (nextDate.toDateString() === lastBooked.toDateString()) {
                console.log('nextDate matches lastBookedDate, advancing by 7 days.');
                nextDate.setDate(nextDate.getDate() + 7);
            }
        }
        console.log('nextDate (after lastBookedDate adjustment):', nextDate);
        
        const [hour, minute] = startTime.split(':').map(Number);
        nextDate.setHours(hour, minute, 0, 0);
        console.log('nextDate (final):', nextDate);

        const bookingOpenTime = new Date(nextDate.getTime() - 48 * 60 * 60 * 1000); // Usa nextDate, non nextClassTime
        console.log('bookingOpenTime:', bookingOpenTime);
        const diff = bookingOpenTime.getTime() - new Date().getTime();
        console.log('diff:', diff);

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