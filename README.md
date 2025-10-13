# GABS Client React Application

This is the frontend React application for the Gym Automatic Booking System (GABS). It provides a user interface to interact with the GABS API, allowing users to manage their gym class bookings, schedule auto-bookings, and receive push notifications.

## Features

-   User authentication and session management.
-   View available gym classes.
-   Book and cancel gym classes.
-   View personal upcoming bookings.
-   Schedule and manage recurring auto-bookings.
-   Receive push notifications for cancellation reminders.
-   **Admin Panel:** Dedicated section for administrators to monitor backend logs, auto-bookings, push subscriptions, and server status.

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
    # or
    yarn install
    ```

3.  **Configuration (.env file):**
    This project uses environment variables for configuration, including the backend API URL and admin email.
    -   Create a file named `.env` in the root of the `gabs-client-react` directory.
    -   Copy the content from `.env.example` into your new `.env` file.
    -   Fill in the required values. **Do NOT commit your `.env` file to Git!**

    ```
    # Example .env content (fill in your actual values)
    REACT_APP_API_URL=http://localhost:5000 # Or your ngrok URL, e.g., https://xxxx.ngrok-free.dev
    REACT_APP_ADMIN_EMAIL=admin@gmail.com # The email address of the admin user
    ```
    **Note:** `REACT_APP_API_URL` should point to your running GABS API Server. During local development, this might be `http://localhost:5000` or your `ngrok` URL.

4.  **Running the Application:**
    ```bash
    # Start the development server
    npm start
    # or
    yarn start
    ```
    The application will be available at `http://localhost:3000`.

## Available Scripts

In the project directory, you can run:

### `npm start`

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
