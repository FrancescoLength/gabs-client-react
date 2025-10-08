import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

// Funzione per formattare la data da "gg/mm/yyyy" a "yyyy-mm-dd"
const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
};

const getDayOfWeek = (dateString) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month}-${day}`);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

function ClassList({ classes, onActionSuccess }) {
    const { token } = useAuth();
    const [loadingId, setLoadingId] = useState(null);
    const [error, setError] = useState(null);

    const handleBook = async (item) => {
        const dateForApi = parseDate(item.date);
        if (!dateForApi) {
            setError("Invalid date format for booking.");
            return;
        }

        setLoadingId(item.name + item.date);
        setError(null);

        try {
            const result = await api.bookClass(token, item.name, dateForApi, item.start_time);
            if (result.status === 'success') {
                alert('Booking successful!');
            } else if (result.status === 'info') {
                alert(result.message);
            } else if (result.status === 'error') {
                setError(result.message);
            }
            onActionSuccess(); // Ricarica i dati
        } catch (err) {
            setError(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    if (!classes || classes.length === 0) {
        return <p>No classes available in the next few days.</p>;
    }

    // Raggruppa le classi per data
    const groupedClasses = classes.reduce((acc, item) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {});

    return (
        <>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="accordion" id="liveBookingAccordion">
                {Object.keys(groupedClasses).map(date => (
                    <div className="accordion-item" key={date}>
                        <h2 className="accordion-header" id={`heading${date.replace(/\//g, '' )}`}>
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#collapse${date.replace(/\//g, '' )}`}
                                aria-expanded="false"
                                aria-controls={`collapse${date.replace(/\//g, '' )}`}
                            >
                                {getDayOfWeek(date)} - {date}
                            </button>
                        </h2>
                        <div
                            id={`collapse${date.replace(/\//g, '' )}`}
                            className="accordion-collapse collapse"
                            aria-labelledby={`heading${date.replace(/\//g, '' )}`}
                            data-bs-parent="#liveBookingAccordion"
                        >
                            <div className="accordion-body">
                                <div className="list-group">
                                    {groupedClasses[date].map((item, index) => {
                                        const isLoading = loadingId === (item.name + item.date);
                                        return (
                                            <div key={index} className="list-group-item list-group-item-action flex-column align-items-start">
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h5 className="mb-1">{item.name}</h5>
                                                </div>
                                                <p className="mb-1">Time: {item.start_time} - {item.end_time} - Duration: {item.duration} minutes - Instructor: {item.instructor || 'N/D'} - Available Spaces: <strong className="fs-5">{item.available_spaces}</strong></p>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleBook(item)}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? <span className="spinner-border spinner-border-sm"></span> : (item.available_spaces < 1 ? 'Book Waitinglist' : 'Book')}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default ClassList;