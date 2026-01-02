/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    red: '#DC2626', // Premium Red (Tailwind Red-600)
                    'red-hover': '#B91C1C', // Darker Red for hover
                    'red-light': '#FEE2E2', // Light Red for backgrounds
                    white: '#FFFFFF',
                    gray: '#F3F4F6', // Light gray background
                    dark: '#111827', // Deep gray/black for text
                    muted: '#6B7280', // Muted text
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
