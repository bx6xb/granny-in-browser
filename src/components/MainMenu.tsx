import { useGameSettings } from '../store/useGameSettings';

export function MainMenu() {
  const { setScreen } = useGameSettings();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        fontFamily: 'monospace',
      }}
    >
      <h1
        style={{
          fontSize: window.innerWidth <= 768 ? '36px' : window.innerWidth <= 1024 ? '64px' : '96px',
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: window.innerWidth <= 768 ? '40px' : '80px',
          textShadow: '0 0 20px rgba(255, 0, 0, 0.5)',
          letterSpacing: window.innerWidth <= 768 ? '4px' : '8px',
          textAlign: 'center',
          padding: '0 20px',
        }}
      >
        HAUNTED HOUSE
      </h1>

      <button
        onClick={() => setScreen('settings')}
        style={{
          fontSize: window.innerWidth <= 768 ? '20px' : '32px',
          padding: window.innerWidth <= 768 ? '15px 40px' : '20px 60px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          border: '3px solid #ffffff',
          cursor: 'pointer',
          fontFamily: 'monospace',
          fontWeight: 'bold',
          transition: 'all 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.color = '#000000';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1a1a1a';
          e.currentTarget.style.color = '#ffffff';
        }}
      >
        PLAY
      </button>
    </div>
  );
}
