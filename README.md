# GABS Client React Application
<img width="1236" height="524" alt="image" src="https://github.com/user-attachments/assets/d701a678-3fb2-4e8c-9a28-fc95fad03382" />


This is the frontend React application for the Gym Automatic Booking System (GABS). It provides a user interface to interact with the GABS API, allowing users to manage their gym class bookings, schedule auto-bookings, and receive push notifications.

## Features

-   **Automatic Booking**: Set up recurring schedules (e.g., "Every Monday at 9:00 AM") and GABS handles the rest.
-   **Live Booking**: View real-time class availability and book instantly.
-   **Smart Notifications**: Receive alerts for successful bookings or useful reminders.
-   **Progressive Web App (PWA)**: Install GABS on your iOS or Android home screen for a app-like experience.
-   **Open Source**: Fully transparent codebase for both [Frontend](https://github.com/FrancescoLength/gabs-client-react) and [Backend](https://github.com/FrancescoLength/gabs-api-server).
-   **Admin Panel**: Monitor logs, manage users, and check server health.

## Setup and Installation

1.  **Prerequisites:**
    -   Node.js (LTS version recommended)
    -   npm or Yarn
    -   **GABS API Server:** Ensure the [GABS API Server](https://github.com/FrancescoLength/gabs-api-server) is set up and running.

2.  **Installation:**
    ```bash
    # Navigate to the project directory
    cd gabs-client-react

    # Install dependencies
    npm install
    ```

3.  **Configuration (.env file):**
    This project uses environment variables for configuration.
    -   Create a file named `.env` in the root of the `gabs-client-react` directory.
    -   Copy the content from `.env.example` (if available) or use the template below.
    -   **Do NOT commit your `.env` file to Git!**

    ```env
    # Example .env content
    VITE_API_URL=http://localhost:5000 # Or your ngrok URL
    ```
    *Note: We now use Vite, so environment variables must be prefixed with `VITE_` (except standard ones).*

4.  **Running the Application:**
    ```bash
    # Start the development server
    npm start
    ```
    The application will be available at `http://localhost:5173` (default Vite port).

## Available Scripts

In the project directory, you can run:

### `npm start` (or `npm run dev`)

Runs the app in the development mode using Vite.
Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
