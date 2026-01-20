import { useGameSettings } from '../store/useGameSettings';

export function InGameMenu() {
  const { volume, setVolume, setInGameMenuOpen, setScreen } = useGameSettings();

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
          padding: '40px 60px',
          borderRadius: '12px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          minWidth: '400px',
        }}
      >
        <h1
          style={{
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '32px',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          PAUSED
        </h1>

        <div style={{ marginBottom: '30px' }}>
          <label
            style={{
              color: 'white',
              fontFamily: 'monospace',
              fontSize: '18px',
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
            }}
          />
        </div>

        <button
          onClick={handleBackToGame}
          style={{
            width: '100%',
            padding: '15px',
            marginBottom: '15px',
            backgroundColor: 'rgba(0, 150, 0, 0.8)',
            color: 'white',
            border: '2px solid rgba(0, 255, 0, 0.3)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 200, 0, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 150, 0, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Resume Game
        </button>

        <button
          onClick={handleBackToMainMenu}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: 'rgba(150, 0, 0, 0.8)',
            color: 'white',
            border: '2px solid rgba(255, 0, 0, 0.3)',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '18px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(200, 0, 0, 0.9)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(150, 0, 0, 0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
