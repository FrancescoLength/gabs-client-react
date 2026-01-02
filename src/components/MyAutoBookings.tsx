import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { Clock, Repeat, Trash2 } from 'lucide-react';

interface MyAutoBookingsProps {
    autoBookings: any[];
    staticClasses: any;
    onActionSuccess: () => void;
}

function MyAutoBookings({ autoBookings, staticClasses, onActionSuccess }: MyAutoBookingsProps) {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getNextOccurrence = (dayOfWeek: string, startTime: string, lastBookedDate: string) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = new Date();
        const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
        if (targetDayIndex === -1) return null;

        const daysUntilTarget = (targetDayOfWeek - currentDayOfWeek + 7) % 7;

        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilTarget);
        const [hours, minutes] = startTime.split(':').map(Number);
        nextDate.setHours(hours, minutes, 0, 0);

        if (daysUntilTarget === 0 && today > nextDate) {
            nextDate.setDate(nextDate.getDate() + 7);
        }

        if (lastBookedDate) {
            const lbKey = lastBookedDate;
            const nextKey = nextDate.toISOString().split('T')[0];
            if (lbKey === nextKey) {
                nextDate.setDate(nextDate.getDate() + 7);
            }
        }
        return nextDate;
    };

    const handleCancelAutoBook = async (bookingId: number) => {
        // Removed blocking confirm
        // if (!confirm('Are you sure you want to cancel this automatic booking?')) return;

        console.log("handleCancelAutoBook clicked", bookingId);

        try {
            setLoadingId(bookingId);
            if (token) {
                const response = await api.cancelAutoBooking(token, bookingId);
                console.log("Delete Auto-Booking Response:", response);
                alert(response.message);
                queryClient.invalidateQueries({ queryKey: ['autoBookings'] });
                onActionSuccess();
            }
        } catch (err: any) {
            console.error("Delete Auto-Booking Error:", err);
            alert(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    if (!autoBookings || autoBookings.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500">No automatic bookings scheduled.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {autoBookings.map((booking: any) => {
                const updatedNextClassTime = getNextOccurrence(booking.day_of_week, booking.target_time, booking.last_booked_date);
                const isLoading = loadingId === booking.id;

                let displayEndTime = '';
                if (staticClasses && booking.day_of_week && staticClasses[booking.day_of_week]) {
                    const foundClass = staticClasses[booking.day_of_week].find(
                        (c: any) => c.name === booking.class_name && c.start_time === booking.target_time && c.instructor === booking.instructor
                    );
                    if (foundClass) displayEndTime = foundClass.end_time;
                }

                let statusText = null;
                if (updatedNextClassTime) {
                    const bookingOpenTime = new Date(updatedNextClassTime.getTime() - 48 * 60 * 60 * 1000);
                    const diff = bookingOpenTime.getTime() - currentTime.getTime();

                    if (diff > 0) {
                        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                        statusText = `Next booking attempt in: ${d > 0 ? `${d}d ` : ''}${h}h ${m}m`;
                    } else {
                        statusText = "Booking attempt imminent or in progress.";
                    }
                }

                return (
                    <div key={booking.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 hover:shadow-float transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h5 className="font-bold text-brand-dark text-lg group-hover:text-brand-red transition-colors">{booking.class_name}</h5>
                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Repeat size={14} className="mr-1.5 text-brand-red" />
                                    Every {booking.day_of_week}
                                </div>
                            </div>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'pending' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-800'}`}>
                                {booking.status === 'pending' ? 'Active' : booking.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-5 pl-1">
                            <div className="flex items-center text-gray-700 font-medium">
                                <Clock size={16} className="mr-2.5 text-gray-400" />
                                {booking.target_time}{displayEndTime ? ` - ${displayEndTime}` : ''}
                            </div>
                            {statusText && (
                                <div className="flex items-center text-xs text-brand-red bg-brand-red-light/20 px-3 py-2 rounded-lg font-bold border border-brand-red-light/30">
                                    <Clock size={14} className="mr-2" />
                                    {statusText}
                                </div>
                            )}
                        </div>

                        {booking.status === 'pending' && (
                            <button
                                className="w-full flex items-center justify-center px-4 py-2.5 border border-red-100 shadow-sm text-sm font-bold rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
                                onClick={() => handleCancelAutoBook(booking.id)}
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
                                        Delete Auto-Booking
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default MyAutoBookings;