import {
  Booking,
  AutoBooking,
  BookingPayload,
  AutoBookingPayload,
  ClassSession,
  LoginResponse,
  ApiResponse,
  LogEntry,
  SystemStatus,
  LiveBooking,
  PushSubscriptionRecord,
  SessionRecord,
  User
} from './types';

export const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/**
 * Generic function for authenticated API calls.
 * Automatically retrieves token from localStorage.
 */
const fetchWithAuth = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('authToken');
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Handle cases where json() fails
    if (response.status === 401) {
      console.error('Authentication error:', errorData.error);
      // Optional: Trigger logout event or redirect
    }
    throw new Error(errorData.error || `API call to ${endpoint} failed`);
  }

  return response.json();
};

/**
 * Executes user login.
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify({ username: email, password }),
  });

  return response.json();
};

/**
 * Executes user logout on the backend.
 */
export const logout = (): Promise<{ message: string }> => {
  return fetchWithAuth('/logout', {
    method: 'POST',
  });
};

// Retrieves the list of all available classes.
export const getClasses = (): Promise<ClassSession[]> => {
  return fetchWithAuth<ClassSession[]>('/classes');
};

/**
 * Retrieves the list of user's bookings and waiting list entries.
 */
export const getMyBookings = (): Promise<Booking[]> => {
  return fetchWithAuth<Booking[]>('/bookings');
};

/**
 * Sends a request to book a class (or join a waiting list).
 */
export const bookClass = (className: string, date: string, time: string): Promise<ApiResponse> => {
  const payload: BookingPayload = { class_name: className, date, time };
  return fetchWithAuth<ApiResponse>('/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Sends a request to cancel a booking (or a waiting list spot).
 */
export const cancelBooking = (className: string, date: string, time: string): Promise<ApiResponse> => {
  const payload: BookingPayload = { class_name: className, date, time };
  return fetchWithAuth<ApiResponse>('/cancel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Retrieves the static timetable data.
 */
export const getStaticClasses = (): Promise<Record<string, ClassSession[]>> => {
  return fetchWithAuth('/static_classes');
};

/**
 * Schedules an automatic booking for a class.
 */
export const scheduleAutoBook = (className: string, dayOfWeek: string, time: string, instructor: string): Promise<ApiResponse> => {
  const payload: AutoBookingPayload = {
    class_name: className,
    time: time,
    day_of_week: dayOfWeek,
    instructor: instructor
  };
  return fetchWithAuth<ApiResponse>('/schedule_auto_book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Retrieves all scheduled automatic bookings for the current user.
 */
export const getAutoBookings = (): Promise<AutoBooking[]> => {
  return fetchWithAuth<AutoBooking[]>('/auto_bookings');
};

/**
 * Cancels a scheduled automatic booking.
 */
export const cancelAutoBooking = (bookingId: number): Promise<ApiResponse> => {
  const payload = { booking_id: bookingId };
  return fetchWithAuth<ApiResponse>('/cancel_auto_book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Retrieves the VAPID public key from the server.
 */
export const getVapidPublicKey = async (): Promise<string> => {
  const response = await fetch(`${API_URL}/vapid-public-key`, {
    headers: {
      'ngrok-skip-browser-warning': 'true',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to get VAPID public key');
  }
  return response.text();
};

/**
 * Sends the push subscription to the backend.
 */
export const subscribeToPush = (subscription: PushSubscription): Promise<ApiResponse> => {
  return fetchWithAuth<ApiResponse>('/subscribe-push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
};

// --- Admin Functions ---

export const getAdminLogs = (): Promise<{ logs: LogEntry[] }> => {
  return fetchWithAuth<{ logs: LogEntry[] }>('/admin/logs');
};

export const getAdminAutoBookings = (): Promise<AutoBooking[]> => {
  return fetchWithAuth<AutoBooking[]>('/admin/auto_bookings');
};

export const getAdminLiveBookings = (): Promise<LiveBooking[]> => {
  return fetchWithAuth<LiveBooking[]>('/admin/live_bookings');
};

export const getAdminPushSubscriptions = (): Promise<PushSubscriptionRecord[]> => {
  return fetchWithAuth<PushSubscriptionRecord[]>('/admin/push_subscriptions');
};

export const getAdminUsers = (): Promise<User[]> => {
  return fetchWithAuth<User[]>('/admin/users');
};

export const getAdminSessions = (): Promise<SessionRecord[]> => {
  return fetchWithAuth<SessionRecord[]>('/admin/sessions');
};

export const getAdminStatus = (): Promise<SystemStatus> => {
  return fetchWithAuth<SystemStatus>('/admin/status');
};