/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // <--- ESTO es vital para que funcione el toggle
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui'],
            },
            colors: {
                primary: {
                    DEFAULT: '#6366f1', // Indigo 500
                    light: '#818cf8',
                    dark: '#4f46e5',
                },
                accent: {
                    DEFAULT: '#a855f7', // Purple 500
                }
            }
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        }
    },
    plugins: [],
}
