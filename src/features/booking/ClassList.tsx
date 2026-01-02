import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api';
import { format, parse } from 'date-fns';
import { ChevronDown, ChevronUp, Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import { ClassSession } from '../../types';

// Helper to parse "dd/mm/yyyy" to Date object
const parseDateString = (dateString: string) => parse(dateString, 'dd/MM/yyyy', new Date());

// Format date for API: "yyyy-mm-dd"
const formatDateForApi = (dateString: string) => {
    try {
        const date = parseDateString(dateString);
        return format(date, 'yyyy-MM-dd');
    } catch {
        console.error("Invalid date format:", dateString);
        return null;
    }
};

const getDayOfWeek = (dateString: string) => {
    try {
        const date = parseDateString(dateString);
        return format(date, 'EEEE');
    } catch {
        return '';
    }
};

interface ClassListProps {
    classes: ClassSession[];
    onActionSuccess: () => void;
}

function ClassList({ classes, onActionSuccess }: ClassListProps) {
    const { token } = useAuth();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [openSections, setOpenSections] = useState<string[]>([]);

    const toggleSection = (date: string) => {
        setOpenSections(prev =>
            prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
        );
    };

    const handleBook = async (item: ClassSession) => {
        const dateForApi = formatDateForApi(item.date);
        if (!dateForApi) {
            setError("Invalid date format for booking.");
            return;
        }

        setLoadingId(item.name + item.date);
        setError(null);

        try {
            if (!token) return;
            const result = await api.bookClass(item.name, dateForApi, item.start_time);
            if (result.status === 'success') {
                alert('Booking successful!');
            } else if (result.status === 'info') {
                alert(result.message);
            } else if (result.status === 'error') {
                setError(result.message);
            }
            onActionSuccess();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoadingId(null);
        }
    };

    if (!classes || classes.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                    <Calendar size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900">No classes found</h3>
                <p className="mt-1 text-gray-500">There are no classes scheduled for the upcoming days.</p>
            </div>
        );
    }

    const groupedClasses = classes.reduce((acc: Record<string, ClassSession[]>, item: ClassSession) => {
        const date = item.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(item);
        return acc;
    }, {} as Record<string, ClassSession[]>);

    return (
        <div className="space-y-6">
            {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-center animate-fade-in shadow-sm">
                    <AlertCircle className="text-red-600 mr-3" size={20} />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
            )}

            {Object.keys(groupedClasses).map((date) => {
                const isExpanded = openSections.includes(date);

                return (
                    <div key={date} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-float transition-all duration-300">
                        <button
                            onClick={() => toggleSection(date)}
                            className={`w-full px-6 py-5 flex items-center justify-between transition-colors text-left ${isExpanded ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg ${isExpanded ? 'bg-brand-red text-white' : 'bg-brand-red-light/30 text-brand-red'} transition-colors`}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <span className="block font-bold text-brand-dark text-lg leading-tight">
                                        {getDayOfWeek(date)}
                                    </span>
                                    <span className="text-gray-500 text-sm font-medium">{date}</span>
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                        </button>

                        {isExpanded && (
                            <div className="divide-y divide-gray-50">
                                {groupedClasses[date].map((item: ClassSession, index: number) => {
                                    const isLoading = loadingId === (item.name + item.date);
                                    const isAvailable = item.available_spaces > 0;

                                    return (
                                        <div key={index} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/80 transition-colors group">
                                            <div className="mb-4 md:mb-0">
                                                <div className="flex items-center mb-2">
                                                    <h5 className="font-bold text-brand-dark text-lg group-hover:text-brand-red transition-colors">{item.name}</h5>
                                                    {item.duration && <span className="ml-3 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full border border-gray-200">{item.duration}m</span>}
                                                </div>

                                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <Clock size={16} className="mr-1.5 text-gray-400" />
                                                        <span className="font-medium text-gray-700">{item.start_time} - {item.end_time}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <User size={16} className="mr-1.5 text-gray-400" />
                                                        {item.instructor || 'Instructor TBD'}
                                                    </div>
                                                    <div className={`flex items-center font-bold ${isAvailable ? 'text-green-600' : 'text-orange-500'}`}>
                                                        {isAvailable ? <CheckCircle size={16} className="mr-1.5" /> : <AlertCircle size={16} className="mr-1.5" />}
                                                        {item.available_spaces} spaces left
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                className={`
                                                    min-w-[140px] px-6 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center
                                                    ${isLoading
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : isAvailable
                                                            ? 'bg-brand-red text-white hover:bg-brand-red-hover hover:shadow-lg hover:shadow-brand-red/30 hover:-translate-y-0.5'
                                                            : 'bg-orange-50 text-orange-600 border border-orange-100 hover:bg-orange-100'
                                                    }
                                                `}
                                                onClick={() => handleBook(item)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center">
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Booking...
                                                    </span>
                                                ) : (
                                                    isAvailable ? 'Book Class' : 'Join Waitlist'
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

export default ClassList;