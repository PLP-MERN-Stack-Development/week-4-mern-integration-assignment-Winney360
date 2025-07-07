/** @type {import('tailwindcss').Config} */
module.exports = {  // Added missing equals sign
  darkMode: 'selector',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"  // Removed trailing comma
  ],
  safelist: [
    // Background colors
    'bg-blue-600', 'bg-gray-200', 'bg-red-600', 'bg-green-600', 'bg-yellow-500',
    // Hover states
    'hover:bg-blue-700', 'hover:bg-gray-300', 'hover:bg-red-700', 'hover:bg-green-700', 'hover:bg-yellow-600',
    // Text colors
    'text-white', 'text-gray-800',
    // Focus rings
    'focus:ring-blue-500', 'focus:ring-gray-500', 'focus:ring-red-500', 'focus:ring-green-500', 'focus:ring-yellow-500',
    // Sizes
    'px-2', 'py-1', 'px-4', 'py-2', 'px-6', 'py-3',
    // Rounding
    'rounded', 'rounded-md',
    // Disabled states
    'opacity-50', 'cursor-not-allowed',
    // Dark mode classes
    'dark:bg-gray-800',
    'dark:bg-gray-700',
    'dark:text-gray-200',
    'dark:text-gray-300',
    'dark:border-gray-700',
    'dark:hover:bg-gray-700/50',
    'dark:bg-gray-800', 
    'dark:text-white', 
    'dark:hover:bg-gray-700'
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      screens: {  // Moved screens outside of keyframes
        'xs': '475px',  // Extra small devices
        '3xl': '1792px' // Large desktop
      }
    },
  },
  plugins: [],
}