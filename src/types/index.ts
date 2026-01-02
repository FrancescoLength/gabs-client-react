export interface ClassSession {
    name: string;
    start_time: string;
    end_time: string;
    instructor: string;
}

export interface BookingPayload {
    class_name: string;
    date: string;
    time: string;
}

export interface AutoBookingPayload {
    class_name: string;
    time: string;
    day_of_week: string;
    instructor: string;
}

export interface Booking {
    id?: string; // Sometimes ID might be missing or generated client-side
    name: string; // The class name
    date: string; // "Monday 1st January"
    time: string; // "10:30"
}

export interface AutoBooking {
    id: number;
    class_name: string;
    day_of_week: string; // "Monday"
    target_time: string;
    instructor?: string;
    status: string; // "pending", etc.
    last_booked_date?: string;
}

export interface User {
    username: string;
    isAdmin: boolean;
    exp: number;
}

export interface ApiError {
    error?: string;
    message?: string;
}

export interface LoginResponse {
    access_token?: string;
    error?: string;
}

export interface ApiResponse {
    message: string;
    status?: string; // 'success', 'info', 'error'
}
