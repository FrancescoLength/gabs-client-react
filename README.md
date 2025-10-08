# GABS Client React Application

This is the frontend React application for the Gym Booking API (GABS). It provides a user interface to interact with the GABS API, allowing users to manage their gym class bookings, schedule auto-bookings, and receive push notifications.

## Features

-   User authentication and session management.
-   View available gym classes.
-   Book and cancel gym classes.
-   View personal upcoming bookings.
-   Schedule and manage recurring auto-bookings.
-   Receive push notifications for cancellation reminders.

## Setup and Installation

1.  **Prerequisites:**
    -   Node.js (LTS version recommended)
    -   npm or Yarn

2.  **Installation:**
    ```bash
    # Navigate to the project directory
    cd gabs-client-react

    # Install dependencies
    npm install
    # or
    yarn install
    ```

3.  **Configuration:**
    -   Ensure the GABS API server is running and accessible.
    -   The client expects the API to be available at `/api`. If your API is running on a different host or port, you might need to configure a proxy in `package.json` or adjust the `API_URL` in `src/api.js`.

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

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!