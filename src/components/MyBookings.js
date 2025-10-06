import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

// Funzione per formattare la data da "Monday 6th October" a "2025-10-06"
// NOTA: Questo è un parser semplificato e si basa sul formato specifico del sito.
const parseDate = (dateString) => {
    const parts = dateString.split(' ');
    if (parts.length < 3) return null;

    const day = parts[1].replace(/\D/g, ''); // Estrae solo i numeri (es. da "6th" a "6")
    const monthName = parts[2];
    const year = new Date().getFullYear(); // Assume l'anno corrente

    const monthMap = { 'january': '01', 'february': '02', 'march': '03', 'april': '04', 'may': '05', 'june': '06', 'july': '07', 'august': '08', 'september': '09', 'october': '10', 'november': '11', 'december': '12' };
    const month = monthMap[monthName.toLowerCase()];

    if (!month || !day) return null;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

function MyBookings({ bookings, onActionSuccess }) {
    const { token } = useAuth();
    const [loadingId, setLoadingId] = useState(null); // ID della classe in caricamento
    const [error, setError] = useState(null);

    const handleCancel = async (booking) => {
        const dateForApi = parseDate(booking.date);
        if (!dateForApi) {
            setError("Invalid date format for cancellation.");
            return;
        }

        setLoadingId(booking.name + booking.date); // Identificatore unico per il loading
        setError(null);

        try {
            await api.cancelBooking(token, booking.name, dateForApi);
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
                    return (
                        <div key={index} className="list-group-item list-group-item-action flex-column align-items-start">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{booking.name}</h5>
                                <small>{booking.date}</small>
                            </div>
                            <p className="mb-1">Time: {booking.time}</p>
                            <div className="d-flex justify-content-between align-items-center">
                                <span className={`badge bg-${booking.status === 'Booked' ? 'success' : 'warning'}`}>
                                    {booking.status}
                                </span>
                                <button 
                                    className="btn btn-danger btn-sm" 
                                    onClick={() => handleCancel(booking)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Cancel'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default MyBookings;