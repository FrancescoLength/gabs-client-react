import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';

function AutoBookingScheduler({onActionSuccess, staticClasses }) { // Accept staticClasses as prop
    const { token } = useAuth();
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 5000); // Clear message after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleScheduleAutoBook = async (className, dayOfWeek, startTime, instructor) => {
        try {
            setMessage(null);
            const response = await api.scheduleAutoBook(token, className, dayOfWeek, startTime, instructor);
            alert(JSON.stringify(response.message));
            window.location.reload();
            onActionSuccess();
        } catch (err) {
            setMessage({ error: err.message }); // Store error message as an object
        }
    };

    // No loading or error state here, as it's handled by AutoBookingPage

    return (
        <div>
            <h3>Schedule Automatic Bookings</h3>
            {message && message.success && <div className="alert alert-success">{message.success}</div>}
            {message && message.error && <div className="alert alert-danger">{message.error}</div>}
            <div className="accordion" id="autoBookingAccordion">
                {Object.entries(staticClasses)
                    .sort(([dayA], [dayB]) => {
                        const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                        return daysOrder.indexOf(dayA) - daysOrder.indexOf(dayB);
                    })
                    .map(([day, classes]) => (
                        <div className="accordion-item" key={day}>
                            <h2 className="accordion-header" id={`heading${day}`}>
                                <button
                                    className="accordion-button collapsed"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#collapse${day}`}
                                    aria-expanded="false"
                                    aria-controls={`collapse${day}`}
                                >
                                    {day}
                                </button>
                            </h2>
                            <div
                                id={`collapse${day}`}
                                className="accordion-collapse collapse"
                                aria-labelledby={`heading${day}`}
                                data-bs-parent="#autoBookingAccordion"
                            >
                                <div className="accordion-body">
                                    <ul className="list-group">
                                        {classes.map((cls, index) => (
                                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                                {cls.start_time} - {cls.end_time} - {cls.name} ({cls.instructor})
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleScheduleAutoBook(cls.name, day, cls.start_time, cls.instructor)}
                                                >
                                                    Schedule Auto-Book
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default AutoBookingScheduler;
