import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

// Funzione per formattare la data da "gg/mm/yyyy" a "yyyy-mm-dd"
const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
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
            const result = await api.bookClass(token, item.name, dateForApi);
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

    return (
        <>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="list-group">
                {classes.map((item, index) => {
                    const isLoading = loadingId === (item.name + item.date);
                    return (
                        <div key={index} className="list-group-item list-group-item-action flex-column align-items-start">
                            <div className="d-flex w-100 justify-content-between">
                                <h5 className="mb-1">{item.name}</h5>
                                <small>{item.date}</small>
                            </div>
                            <p className="mb-1">Hours: {item.time} - Instructor: {item.instructor || 'N/D'}</p>
                            <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => handleBook(item)}
                                disabled={isLoading}
                            >
                                {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Book'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default ClassList;