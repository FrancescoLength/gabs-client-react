import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Plus, Clock, User } from 'lucide-react';

function AutoBookingScheduler({ staticClasses, onActionSuccess }) {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [openDay, setOpenDay] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    const toggleDay = (day) => {
        setOpenDay(openDay === day ? null : day);
    };

    const handleScheduleAutoBook = async (cls, day) => {
        console.log("handleScheduleAutoBook clicked", { cls, day });

        // const confirmMsg = `Enable Auto-Booking for ${cls.name} on ${day}s at ${cls.start_time}?`;
        // if (!window.confirm(confirmMsg)) {
        //     console.log("Confirmation cancelled");
        //     return;
        // }

        const loadKey = `${day}-${cls.name}-${cls.start_time}`;
        setLoadingId(loadKey);

        try {
            console.log("Calling api.scheduleAutoBook...");
            const response = await api.scheduleAutoBook(token, cls.name, day, cls.start_time, cls.instructor);
            console.log("API Success", response);
            alert(response.message);
            queryClient.invalidateQueries(['autoBookings']);
            onActionSuccess();
        } catch (err) {
            console.error("API Error", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoadingId(null);
        }
    };

    const sortedDays = Object.keys(staticClasses || {}).sort((a, b) => {
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return days.indexOf(a) - days.indexOf(b);
    });

    if (!staticClasses || sortedDays.length === 0) {
        return <p className="text-gray-500">No classes available for automation.</p>;
    }

    return (
        <div className="space-y-4">
            {sortedDays.map((day) => {
                const isOpen = openDay === day;
                const classes = staticClasses[day];

                return (
                    <div key={day} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-float transition-all duration-300">
                        <button
                            onClick={() => toggleDay(day)}
                            className={`w-full px-6 py-5 flex items-center justify-between transition-colors text-left ${isOpen ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <span className="font-bold text-brand-dark text-lg">{day}</span>
                            {isOpen ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>

                        {isOpen && (
                            <div className="divide-y divide-gray-50">
                                {classes.map((cls, idx) => {
                                    const loadKey = `${day}-${cls.name}-${cls.start_time}`;
                                    const isLoading = loadingId === loadKey;

                                    return (
                                        <div key={idx} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/80 transition-colors group">
                                            <div className="mb-4 md:mb-0">
                                                <h5 className="font-bold text-brand-dark text-base mb-1 group-hover:text-brand-red transition-colors">{cls.name}</h5>
                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock size={14} className="mr-1.5 text-gray-400" />
                                                        {cls.start_time} - {cls.end_time}
                                                    </div>
                                                    {cls.instructor && (
                                                        <div className="flex items-center">
                                                            <User size={14} className="mr-1.5 text-gray-400" />
                                                            {cls.instructor}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                className="btn-sm flex items-center justify-center px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-brand-red hover:shadow-lg hover:shadow-brand-red/30 transition-all shadow-sm whitespace-nowrap text-sm font-bold disabled:opacity-50"
                                                onClick={() => handleScheduleAutoBook(cls, day)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                ) : (
                                                    <>
                                                        <Plus size={16} className="mr-1.5" />
                                                        Add Auto-Book
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default AutoBookingScheduler;
