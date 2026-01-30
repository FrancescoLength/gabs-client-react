export interface ClassSession {
    name: string;
    date: string; // "dd/MM/yyyy"
    start_time: string;
    end_time: string;
    instructor: string;
    available_spaces: number;
    duration?: number;
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
    username: string;
    class_name: string;
    day_of_week: string; // "Monday"
    target_time: string;
    instructor?: string;
    status: string; // "pending", etc.
    last_booked_date?: string;
    retry_count?: number;
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

export interface LogEntry {
    level: string;
    message: string;
    timestamp: string;
}

export interface SystemStatus {
    status: string;
    uptime: string;
    ssh_tunnel_command?: string;
}

export interface LiveBooking {
    id: number;
    username: string;
    class_name: string;
    class_date: string;
    class_time: string;
    reminder_sent: boolean;
    auto_booking_id?: number;
    created_at?: string;
}

export interface PushSubscriptionRecord {
    id: number;
    username: string;
    endpoint: string;
    created_at: number;
}

export interface SessionRecord {
    username: string;
    updated_at: number;
    session_data: unknown;
}
