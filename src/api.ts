export const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

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

export interface LoginResponse {
  access_token?: string;
  error?: string;
}

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
export const logout = (token: string): Promise<any> => {
  return fetchWithAuth('/logout', token, {
    method: 'POST',
  });
};

/**
 * Generic function for authenticated API calls.
 */
const fetchWithAuth = async (endpoint: string, token: string, options: RequestInit = {}): Promise<any> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (response.status === 401) {
      console.error('Authentication error:', errorData.error);
    }
    throw new Error(errorData.error || `API call to ${endpoint} failed`);
  }

  return response.json();
};

// Retrieves the list of all available classes.
export const getClasses = (token: string): Promise<any> => {
  return fetchWithAuth('/classes', token);
};

/**
 * Retrieves the list of user's bookings and waiting list entries.
 */
export const getMyBookings = (token: string): Promise<any> => {
  return fetchWithAuth('/bookings', token);
};

/**
 * Sends a request to book a class (or join a waiting list).
 */
export const bookClass = (token: string, className: string, date: string, time: string): Promise<any> => {
  const payload: BookingPayload = { class_name: className, date, time };
  return fetchWithAuth('/book', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Sends a request to cancel a booking (or a waiting list spot).
 */
export const cancelBooking = (token: string, className: string, date: string, time: string): Promise<any> => {
  const payload: BookingPayload = { class_name: className, date, time };
  return fetchWithAuth('/cancel', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Retrieves the static timetable data.
 */
export const getStaticClasses = (token: string): Promise<any> => {
  return fetchWithAuth('/static_classes', token);
};

/**
 * Schedules an automatic booking for a class.
 */
export const scheduleAutoBook = (token: string, className: string, dayOfWeek: string, time: string, instructor: string): Promise<any> => {
  const payload: AutoBookingPayload = {
    class_name: className,
    time: time,
    day_of_week: dayOfWeek,
    instructor: instructor
  };
  return fetchWithAuth('/schedule_auto_book', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Retrieves all scheduled automatic bookings for the current user.
 */
export const getAutoBookings = (token: string): Promise<any> => {
  return fetchWithAuth('/auto_bookings', token);
};

/**
 * Cancels a scheduled automatic booking.
 */
export const cancelAutoBooking = (token: string, bookingId: number): Promise<any> => {
  const payload = { booking_id: bookingId };
  return fetchWithAuth('/cancel_auto_book', token, {
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
export const subscribeToPush = (token: string, subscription: PushSubscription): Promise<any> => {
  return fetchWithAuth('/subscribe-push', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
};

// --- Admin Functions ---

export const getAdminLogs = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/logs', token);
};

export const getAdminAutoBookings = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/auto_bookings', token);
};

export const getAdminLiveBookings = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/live_bookings', token);
};

export const getAdminPushSubscriptions = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/push_subscriptions', token);
};

export const getAdminUsers = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/users', token);
};

export const getAdminSessions = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/sessions', token);
};

export const getAdminStatus = (token: string): Promise<any> => {
  return fetchWithAuth('/admin/status', token);
};