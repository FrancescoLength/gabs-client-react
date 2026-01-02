import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { format } from 'date-fns';
import { Clock, Calendar, Trash2 } from 'lucide-react';
import { parseBookingDate, getCancellationStatus } from '../utils/dateUtils';
import { Booking } from '../types';

interface MyBookingsProps {
    bookings: Booking[];
    onActionSuccess: () => void;
}

const MyBookings = ({ bookings, onActionSuccess }: MyBookingsProps) => {
    const { token } = useAuth();

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCancel = async (uniqueId: string, className: string, dateStr: string, time: string) => {
        // window.confirm removed to fix UI blocking issue
        setLoadingId(uniqueId);
        try {
            // API expects date in YYYY-MM-DD format
            if (token) {
                const response = await api.cancelBooking(token, className, dateStr, time);
                // Show alert only on success/error to confirm action completed
                alert(response.message || 'Cancelled successfully');
                onActionSuccess();
            }
        } catch (err: unknown) {
            console.error("Cancel Error:", err);
            alert(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoadingId(null);
        }
    };

    if (!bookings || bookings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-medium">You have no upcoming bookings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking: Booking, index: number) => {
                const bookingDate = parseBookingDate(booking.date);
                // Create a unique ID for React key and loading state, as booking.id might be missing
                const uniqueId = booking.id || `${booking.name}-${booking.date}-${booking.time}-${index}`;

                // Format date for API (YYYY-MM-DD)
                const apiDateStr = bookingDate ? format(bookingDate, 'yyyy-MM-dd') : null;

                const isLoading = loadingId === uniqueId;

                const { canCancel, statusText } = getCancellationStatus(bookingDate, booking.time, currentTime);

                return (
                    <div key={uniqueId} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-float transition-all duration-300 p-5 group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-red rounded-l-2xl"></div>

                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                                <h5 className="font-bold text-brand-dark text-lg">{booking.name}</h5>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar size={14} className="mr-1.5 text-brand-red" />
                                    {booking.date}
                                </div>
                            </div>
                            {statusText && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${canCancel ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {statusText}
                                </span>
                            )}
                        </div>

                        <div className="pl-2 space-y-2 mb-4">
                            <div className="flex items-center text-gray-600 font-medium">
                                <Clock size={16} className="mr-2 text-gray-400" />
                                {booking.time}
                            </div>
                        </div>

                        {canCancel && (
                            <button
                                className="relative z-10 w-full flex items-center justify-center px-4 py-2 border border-red-100 shadow-sm text-sm font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                                onClick={() => {
                                    if (apiDateStr) {
                                        handleCancel(uniqueId, booking.name, apiDateStr, booking.time);
                                    } else {
                                        alert("Error parsing booking date");
                                    }
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Cancelling...
                                    </span>
                                ) : (
                                    <>
                                        <Trash2 size={16} className="mr-2" />
                                        Cancel Booking
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MyBookings;