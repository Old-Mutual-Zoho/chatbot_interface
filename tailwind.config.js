/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // Brand tokens
      colors: {
        'om-green': '#00a651',
        'om-green-dark': '#0b7a3a',
      },

      // Fonts (matches the reference look)
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
        serif: ['"Playfair Display"', 'ui-serif', 'Georgia', 'Times New Roman', 'serif'],
      },

      // MessageBubble animation
      keyframes: {
        'bubble-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },

        // ChatWidget animations
        'om-widget-land-in': {
          from: { opacity: '0', transform: 'translate(80px, -90px) scale(0.88)' },
          to: { opacity: '1', transform: 'translate(0, 0) scale(1)' },
        },
        'widget-slide-up': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'om-launcher-land-in': {
          from: { opacity: '0', transform: 'translate(72px, -78px) rotate(6deg) scale(0.88)' },
          to: { opacity: '1', transform: 'translate(0, 0) rotate(0deg) scale(1)' },
        },
        'om-launcher-bounce': {
          '0%': { transform: 'translateY(0)' },
          '8%': { transform: 'translateY(-14px)' },
          '16%': { transform: 'translateY(0)' },
          '22%': { transform: 'translateY(-6px)' },
          '28%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(0)' },
        },
        'om-launcher-halo-pulse': {
          '0%': { opacity: '0.40', transform: 'scale(0.98)' },
          '50%': { opacity: '0.70', transform: 'scale(1.04)' },
          '100%': { opacity: '0.40', transform: 'scale(0.98)' },
        },
      },
      animation: {
        'bubble-float': 'bubble-float 4.2s ease-in-out infinite',

        // ChatWidget animations
        'om-widget-land-in': 'om-widget-land-in 820ms cubic-bezier(0.16, 1, 0.3, 1)',
        'widget-slide-up': 'widget-slide-up 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        'om-launcher-land-in': 'om-launcher-land-in 760ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'om-launcher-bounce': 'om-launcher-bounce 2.6s ease-in-out 760ms infinite',
        'om-launcher-halo-pulse': 'om-launcher-halo-pulse 3s ease-in-out infinite',

        // Combined launcher animation (keeps JSX clean)
        'om-launcher':
          'om-launcher-land-in 760ms cubic-bezier(0.16, 1, 0.3, 1) both, om-launcher-bounce 2.6s ease-in-out 760ms infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        // ChatWindow wrapper (keeps JSX simple: className="chat-window cw")
        '.cw': {
          display: 'flex',
          height: '100%',
          width: '100%',
          minHeight: '0',
          flexDirection: 'column',
          background: 'transparent',
        },

        // Header typography
        '.cw .chat-header h2': {
          margin: '0',
          fontSize: '1.5rem',
        },
        '.cw .chat-header p': {
          marginTop: '0.5rem',
          opacity: '0.9',
        },

        // Messages pane
        '.cw .chat-messages': {
          flex: '1',
          overflowY: 'auto',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        },

        // Input row
        '.cw .chat-input-container': {
          padding: '12px',
          display: 'flex',
          gap: '1rem',
          background: '#f9fafb',
          borderTop: '1px solid #e5e7eb',
        },

        // Text input
        '.cw .chat-input': {
          flex: '1',
          minWidth: '0',
          padding: '0.75rem 1rem',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '1rem',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 160ms ease',
          transformOrigin: 'center',
        },
        '.cw .chat-input.is-typing': {
          transform: 'scaleY(1.14)',
        },
        '.cw .chat-input:focus': {
          outline: 'none',
          borderColor: 'var(--om-green)',
          boxShadow: '0 0 0 4px rgba(0, 166, 81, 0.15)',
        },
        // Send button (reuses existing btn/btn-send classnames)
        '.cw .btn': {
          padding: '0.75rem 1.5rem',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          fontWeight: '500',
          flexShrink: '0',
          whiteSpace: 'nowrap',
        },
        '.cw .btn-send': {
          background: 'linear-gradient(135deg, var(--om-green) 0%, #0b7a3a 100%)',
          color: '#ffffff',
        },
        '.cw .btn-send:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0, 166, 81, 0.35)',
        },

        // Floating widget shell (ChatWidget)
        '.mia-widget': {
          position: 'fixed',
          zIndex: '9999',
          right: '1rem',
          bottom: 'calc(var(--om-widget-bottom) + env(safe-area-inset-bottom, 0px))',
        },

        '.mia-panel': {
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '18px',
          border: '1px solid rgba(255, 255, 255, 0.65)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow:
            '0 1px 0 rgba(17,24,39,0.04), 0 20px 60px rgba(17,24,39,0.28)',

          width: '330px',
          maxWidth: 'calc(100vw - 32px)',
          height: '560px',
          maxHeight: 'calc(100vh - 96px)',
        },

        '.mia-panel__header': {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: 'none',
          padding: '18px 14px',
          color: '#ffffff',
          backgroundImage: 'linear-gradient(135deg, var(--om-green), #0b7a3a)',
        },
        '.mia-panel__title': {
          fontSize: '1.5rem',
          lineHeight: '1.1',
          fontWeight: '700',
        },
        '.mia-panel__close': {
          height: '32px',
          width: '32px',
          borderRadius: '10px',
          background: 'transparent',
          color: '#ffffff',
          fontSize: '22px',
          lineHeight: '1',
          border: '0',
          cursor: 'pointer',
        },
        '.mia-panel__close:hover': {
          background: 'rgba(255, 255, 255, 0.20)',
        },
        '.mia-panel__body': {
          flex: '1',
          minHeight: '0',
        },

        // Launcher
        '.mia-launcher': {
          position: 'relative',
        },
        '.mia-launcher__halo': {
          pointerEvents: 'none',
          position: 'absolute',
          inset: '-24px',
          zIndex: '0',
        },
        '.mia-launcher__halo::before': {
          content: '""',
          position: 'absolute',
          inset: '0',
          borderRadius: '9999px',
          background: 'rgba(52, 211, 153, 0.20)',
          filter: 'blur(40px)',
          animation: 'om-launcher-halo-pulse 3s ease-in-out infinite',
        },
        '.mia-launcher__halo::after': {
          content: '""',
          position: 'absolute',
          inset: '16px',
          borderRadius: '9999px',
          background: 'rgba(52, 211, 153, 0.15)',
          filter: 'blur(24px)',
          animation: 'om-launcher-halo-pulse 3s ease-in-out infinite',
        },

        '.mia-launcher__button': {
          position: 'relative',
          zIndex: '10',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: '14px',
          textAlign: 'left',
          color: '#ffffff',
          backgroundImage: 'linear-gradient(135deg, var(--om-green), #0b7a3a)',
          border: '6px solid rgba(255, 255, 255, 0.85)',
          padding: '18px 20px',
          minWidth: '320px',
          minHeight: '92px',
          maxWidth: 'min(420px, calc(100vw - 24px))',
          borderRadius: '9999px',
          transition: 'transform 200ms ease, filter 200ms ease',
          willChange: 'transform',
          cursor: 'pointer',
          boxShadow: '0 1px 0 rgba(17,24,39,0.05), 0 18px 48px rgba(0,0,0,0.22)',
        },
        '.mia-launcher__button:hover': {
          transform: 'translateY(-2px)',
          filter: 'saturate(1.05)',
        },

        '.mia-launcher__avatar': {
          height: '48px',
          width: '48px',
          borderRadius: '9999px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '4px solid #ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.14)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: '0',
        },
      });
    }),
  ],
};
