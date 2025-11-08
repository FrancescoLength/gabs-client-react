import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

// Funzione per formattare la data da "Monday 6th October" a "2025-10-06"
// NOTA: Questo è un parser semplificato e si basa sul formato specifico del sito.
const parseDate = (dateString) => {
    const parts = dateString.split(' ');
    if (parts.length < 3) return null;

    const day = parseInt(parts[1].replace(/\D/g, ''), 10); // Estrae solo i numeri (es. da "6th" a "6")
    const monthName = parts[2];
    const currentYear = new Date().getFullYear();

    const monthMap = { 'january': 0, 'february': 1, 'march': 2, 'april': 3, 'may': 4, 'june': 5, 'july': 6, 'august': 7, 'september': 8, 'october': 9, 'november': 10, 'december': 11 };
    const month = monthMap[monthName.toLowerCase()];

    if (isNaN(day) || month === undefined) return null;

    // Try to determine the correct year
    let year = currentYear;
    // Use Date.UTC to avoid timezone issues when creating the date object
    const testDate = new Date(Date.UTC(year, month, day));

    // If the parsed date is in the past, assume it's for next year
    // Compare with current date in UTC to be consistent
    const nowUtc = new Date();
    const nowUtcMonth = nowUtc.getUTCMonth();
    const nowUtcDay = nowUtc.getUTCDate();

    if (testDate < nowUtc && (nowUtcMonth > month || (nowUtcMonth === month && nowUtcDay > day))) {
        year++;
    }

    // Create the final date object using UTC
    return new Date(Date.UTC(year, month, day));
};

const getClassDateTime = (bookingDateString, bookingTimeString) => {
    const dateObj = parseDate(bookingDateString);
    if (!dateObj) return null;

    const [hours, minutes] = bookingTimeString.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
};

const calculateTimeRemaining = (targetDateTime) => {
    const now = new Date();
    const difference = targetDateTime.getTime() - now.getTime();

    if (difference <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { total: difference, days, hours, minutes, seconds };
};

function MyBookings({ bookings, onActionSuccess }) {
    const { token } = useAuth();
    const [loadingId, setLoadingId] = useState(null); // ID della classe in caricamento
    const [error, setError] = useState(null);
    const [countdownStates, setCountdownStates] = useState({});

    useEffect(() => {
        const interval = setInterval(() => {
            const newCountdownStates = {};
            bookings.forEach(booking => {
                const classDateTime = getClassDateTime(booking.date, booking.time);
                if (classDateTime) {
                    const cancellationDeadline = new Date(classDateTime.getTime() - (180 * 60 * 1000));
                    newCountdownStates[booking.name + booking.date + booking.time] = calculateTimeRemaining(cancellationDeadline);
                }
            });
            setCountdownStates(newCountdownStates);
        }, 1000);

        return () => clearInterval(interval);
    }, [bookings]);

    const handleCancel = async (booking) => {
        const dateForApi = parseDate(booking.date);
        if (!dateForApi) {
            setError("Invalid date format for cancellation.");
            return;
        }

        setLoadingId(booking.name + booking.date); // Identificatore unico per il loading
        setError(null);

        try {
            await api.cancelBooking(token, booking.name, dateForApi.toISOString().split('T')[0], booking.time);
            alert('Cancellation successful!');
            onActionSuccess(); // Ricarica i dati nella dashboard
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    if (!bookings || bookings.length === 0) {
        return <p>You have no active reservations.</p>;
    }

    return (
        <>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="list-group">
                {bookings.map((booking, index) => {
                    const isLoading = loadingId === (booking.name + booking.date);
                    const bookingKey = booking.name + booking.date + booking.time;
                    const countdown = countdownStates[bookingKey];
                    const isNearDeadline = countdown && countdown.total > 0 && countdown.total <= (60 * 60 * 1000); // 60 minutes before deadline
                    const isPastDeadline = countdown && countdown.total <= 0;

                    let cardClass = "list-group-item list-group-item-action flex-column align-items-start";
                    if (isNearDeadline) {
                        cardClass += " bg-warning"; // Yellow background for near deadline
                    } else if (isPastDeadline) {
                        cardClass += " bg-danger text-white"; // Red background for past deadline
                    }

                    return (
                        <div key={index} className={cardClass}>
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{booking.name}</h5>
                                <small>{booking.date}</small>
                            </div>
                            <p className="mb-1">Time: {booking.time}</p>
                            {countdown && countdown.total > 0 && (
                                <p className="mb-1 text-muted">
                                    Cancel by: {countdown.days > 0 && `${countdown.days}d `}{countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                                </p>
                            )}
                            {isPastDeadline && (
                                <p className="mb-1 text-danger fw-bold">Scaduto! Potrebbe essere applicata una multa.</p>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge bg-${booking.status === 'Booked' ? 'success' : 'warning'}`}>
                                    {booking.status}
                                </span>
                                {/* Conditionally render the Cancel button */}
                                {!isPastDeadline && (
                                    <button 
                                        className="btn btn-danger btn-sm" 
                                        onClick={() => handleCancel(booking)}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Cancel'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default MyBookings;