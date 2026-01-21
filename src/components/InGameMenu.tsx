import { useGameSettings } from '../store/useGameSettings';

export function InGameMenu() {
  const { volume, sensitivity, setVolume, setSensitivity, setInGameMenuOpen, setScreen } = useGameSettings();

  const handleBackToGame = () => {
    setInGameMenuOpen(false);
  };

  const handleBackToMainMenu = () => {
    setInGameMenuOpen(false);
    setScreen('mainMenu');
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
        pointerEvents: 'all',
        cursor: 'default',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          padding: window.innerWidth <= 768 ? '30px 20px' : '40px 60px',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          minWidth: window.innerWidth <= 768 ? '90%' : '400px',
          maxWidth: window.innerWidth <= 768 ? '90%' : 'auto',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontFamily: 'monospace',
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            marginBottom: window.innerWidth <= 768 ? '20px' : '30px',
            textAlign: 'center',
          }}
        >
          PAUSED
        </h1>

        <div style={{ marginBottom: window.innerWidth <= 768 ? '20px' : '30px' }}>
          <label
            style={{
              color: '#9a9a9a',
              fontFamily: 'monospace',
              fontSize: window.innerWidth <= 768 ? '14px' : '18px',
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Volume: {volume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#666666',
            }}
          />
        </div>

        <div style={{ marginBottom: window.innerWidth <= 768 ? '20px' : '30px' }}>
          <label
            style={{
              color: '#9a9a9a',
              fontFamily: 'monospace',
              fontSize: window.innerWidth <= 768 ? '14px' : '18px',
              display: 'block',
              marginBottom: '10px',
            }}
          >
            Sensitivity: {sensitivity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#666666',
            }}
          />
        </div>

        <button
          onClick={handleBackToGame}
          style={{
            width: '100%',
            padding: window.innerWidth <= 768 ? '12px' : '15px',
            marginBottom: '15px',
            backgroundColor: 'rgba(60, 60, 80, 0.8)',
            color: '#cccccc',
            border: '2px solid rgba(100, 100, 100, 0.5)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(80, 80, 100, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(60, 60, 80, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = '#cccccc';
          }}
        >
          Resume Game
        </button>

        <button
          onClick={handleBackToMainMenu}
          style={{
            width: '100%',
            padding: window.innerWidth <= 768 ? '12px' : '15px',
            backgroundColor: 'rgba(70, 60, 60, 0.8)',
            color: '#cccccc',
            border: '2px solid rgba(100, 100, 100, 0.5)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: window.innerWidth <= 768 ? '16px' : '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(90, 80, 80, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(70, 60, 60, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.color = '#cccccc';
          }}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
