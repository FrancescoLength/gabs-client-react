# GABS Client React Application

![GABS Banner](https://github.com/user-attachments/assets/d701a678-3fb2-4e8c-9a28-fc95fad03382)

This is the modern **Frontend React** application for the **Gym Automatic Booking System (GABS)**. It interacts with the GABS API to automate gym class bookings, track live availability, and manage user schedules. 

The project has been recently refactored to use **TypeScript**, **Vite**, **Tailwind CSS**, and a **Feature-Based Architecture**.

## 🚀 Features

-   **Automatic Booking**: Schedule recurring bookings (e.g., "Every Monday @ 9:00") handled by the backend.
-   **Live Booking**: Real-time view of available classes with instant booking/cancellation.
-   **Smart Notifications**: Push notifications for booking confirmations and reminders.
-   **PWA Support**: Installable as a native-like app on iOS and Android.
-   **Admin Dashboard**: comprehensive logging, user management, and system health monitoring.
-   **Responsive Design**: Mobile-first UI built with Tailwind CSS.

## 🛠️ Tech Stack

-   **Core**: React 19, TypeScript 5.9
-   **Build Tool**: Vite 7
-   **Styling**: Tailwind CSS 4
-   **State/Data**: TanStack Query v5 (React Query)
-   **Routing**: React Router v7
-   **Testing**: Vitest, React Testing Library
-   **Linting**: ESLint (Flat Config)

## 📂 Project Structure

This project uses a **Feature-Based Architecture** to ensure scalability:

```
src/
├── api.ts              # Centralized API client with automated Token Management
├── components/         # Shared UI components (Input, Button, Layouts)
├── context/            # Global state (AuthContext, ThemeContext)
├── features/           # Domain-specific logic and pages
│   ├── admin/          # Admin dashboard, logs, system status
│   └── booking/        # Booking logic, class lists, schedules
├── hooks/              # Custom React hooks (usePushNotifications, etc.)
├── types/              # Centralized TypeScript definitions
└── utils/              # Helper functions (Date parsing, formatting)
```

## ⚡ Getting Started

### 1. Prerequisites
-   **Node.js**: LTS version (v18+ recommended)
-   **Backend**: Ensure the [GABS API Server](https://github.com/FrancescoLength/gabs-api-server) is running.

### 2. Installation
```bash
git clone https://github.com/FrancescoLength/gabs-client-react.git
cd gabs-client-react
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory. **Note**: Vite requires variables to start with `VITE_`.

```env
# .env
VITE_API_URL=http://localhost:5000  # URL of your Python Backend
```

### 4. Running the App
```bash
# Start Development Server (Hot Reload)
npm start
# App runs at: http://localhost:5173
```

## 📜 Available Scripts

| Command           | Description                                                      |
| :---------------- | :--------------------------------------------------------------- |
| `npm start`       | Starts the Vite development server.                              |
| `npm run build`   | Type-checks (`tsc`) and builds the production bundle to `dist/`. |
| `npm run serve`   | Previews the production build locally.                           |
| `npm run lint`    | Runs ESLint to check for code quality issues.                    |
| `npm run test`    | Runs the Vitest test suite in watch mode.                        |
| `npm run test:ci` | Runs all tests once (useful for CI/CD pipelines).                |

## 🧪 Testing

The project maintains a **100% passing test suite**.
Tests are co-located with components in `__tests__` directories.

-   **Unit Tests**: Verified with `Vitest`.
-   **Integration Tests**: Verified with `React Testing Library`.

To run tests:
```bash
npm run test
```


## 🚀 CI/CD & Deployment

This project uses **GitHub Actions** for Continuous Integration and **Vercel** for Continuous Deployment.

### 🔄 GitHub Actions Workflow
The workflow is defined in `.github/workflows/frontend.yml`:
1.  **Test**: On every `push` or `pull_request` to `master`, it:
    -   Installs dependencies (`npm ci`).
    -   Runs linting checks (`npm run lint`).
    -   Runs the full test suite (`npm run test:ci`).
2.  **Deploy**: If tests pass (and it's a push to `master`), it triggers a deployment to Vercel.

### ☁️ Vercel Deployment
The application is automatically deployed to Vercel.
-   **Production Build**: `npm run build` is executed.
-   **Routing**: `vercel.json` handles SPA routing (redirects all requests to `index.html`).
-   **Proxy**: The Vercel deployment connects to your backend via the API URL configured in Vercel's Environment Variables.

## 📄 License
This project is licensed under the [GNU General Public License v3.0](LICENSE).
