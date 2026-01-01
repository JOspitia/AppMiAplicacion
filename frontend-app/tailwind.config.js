/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // <--- ESTO es vital para que funcione el toggle
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui'],
            },
            colors: {
                primary: {
                    DEFAULT: 'rgb(var(--primary-rgb))',
                    hover: 'var(--primary-hover)',
                    dark: 'var(--primary-dark)',
                    light: 'var(--primary-light)',
                    vibrant: 'var(--primary-vibrant)',
                    stop: 'var(--primary-stop)',
                },
                success: 'var(--success-color)',
                warning: 'var(--warning-color)',
                danger: 'var(--danger-color)',
                info: 'var(--info-color)',
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    800: '#1e293b',
                    900: '#0f172a',
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
