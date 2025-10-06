const API_URL = '/api'; // Thanks to the proxy, the full IP is not needed

/**
 * Executes user login.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} Data returned by the API, including the access_token.
 */
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return response.json();
};

/**
 * Generic function for authenticated API calls.
 * @param {string} endpoint The endpoint to call (e.g., '/classes').
 * @param {string} token The user's JWT token.
 * @param {object} options Additional options for fetch().
 * @returns {Promise<any>}
 */
const fetchWithAuth = async (endpoint, token, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    // If the token has expired, the API might return a specific error
    if (response.status === 401) {
        // We could handle automatic logout here
        console.error('Authentication error:', errorData.error);
    }
    throw new Error(errorData.error || `API call to ${endpoint} failed`);
  }

  return response.json();
};

// Retrieves the list of all available classes.
export const getClasses = (token) => {
  return fetchWithAuth('/classes', token);
};

/**
 * Retrieves the list of user's bookings and waiting list entries.
 * @param {string} token The user's JWT token.
 */
export const getMyBookings = (token) => {
  return fetchWithAuth('/bookings', token);
};

/**
 * Sends a request to book a class (or join a waiting list).
 * @param {string} token The user's JWT token.
 * @param {string} className The class name.
 * @param {string} date The class date in YYYY-MM-DD format.
 */
export const bookClass = (token, className, date) => {
  const payload = { class_name: className, date };
  return fetchWithAuth('/book', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

/**
 * Sends a request to cancel a booking (or a waiting list spot).
 * @param {string} token The user's JWT token.
 * @param {string} className The class name.
 * @param {string} date The class date in YYYY-MM-DD format.
 */
export const cancelBooking = (token, className, date) => {
    const payload = { class_name: className, date };
    return fetchWithAuth('/cancel', token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
};