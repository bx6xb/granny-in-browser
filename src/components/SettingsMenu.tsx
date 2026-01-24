import { useGameSettings } from '../store/useGameSettings';

export function SettingsMenu() {
  const { difficulty, volume, sensitivity, setDifficulty, setVolume, setSensitivity, startGame } =
    useGameSettings();

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: window.innerWidth <= 768 ? '20px' : '40px',
          padding: window.innerWidth <= 768 ? '30px 20px' : '60px',
          backgroundColor: '#1a1a1a',
          border: '3px solid #ffffff',
          maxWidth: window.innerWidth <= 768 ? '90%' : 'auto',
        }}
      >
        <h2
          style={{
            fontSize: window.innerWidth <= 768 ? '28px' : '48px',
            color: '#ffffff',
            marginBottom: window.innerWidth <= 768 ? '10px' : '20px',
            textAlign: 'center',
          }}
        >
          SETTINGS
        </h2>

        {/* Difficulty Selection */}
        <div>
          <label
            style={{
              fontSize: window.innerWidth <= 768 ? '16px' : '24px',
              color: '#9a9a9a',
              display: 'block',
              marginBottom: '15px',
            }}
          >
            DIFFICULTY
          </label>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(['practice', 'easy', 'normal', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                style={{
                  fontSize: window.innerWidth <= 768 ? '14px' : '20px',
                  padding: window.innerWidth <= 768 ? '12px 20px' : '15px 30px',
                  backgroundColor: difficulty === diff ? '#666666' : '#2a2a2a',
                  color: difficulty === diff ? '#ffffff' : '#888888',
                  border: '2px solid #555555',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  flex: window.innerWidth <= 768 ? '1' : 'auto',
                  transition: 'all 0.2s',
                }}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div>
          <label
            style={{
              fontSize: window.innerWidth <= 768 ? '16px' : '24px',
              color: '#9a9a9a',
              display: 'block',
              marginBottom: '15px',
            }}
          >
            VOLUME: {volume}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              cursor: 'pointer',
              accentColor: '#666666',
            }}
          />
        </div>

        {/* Sensitivity Control */}
        <div>
          <label
            style={{
              fontSize: window.innerWidth <= 768 ? '16px' : '24px',
              color: '#9a9a9a',
              display: 'block',
              marginBottom: '15px',
            }}
          >
            SENSITIVITY: {sensitivity}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              cursor: 'pointer',
              accentColor: '#666666',
            }}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          style={{
            fontSize: window.innerWidth <= 768 ? '20px' : '32px',
            padding: window.innerWidth <= 768 ? '15px 40px' : '20px 60px',
            backgroundColor: '#1a1a1a',
            color: '#888888',
            border: '3px solid #555555',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            marginTop: '20px',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333333';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.borderColor = '#888888';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.color = '#888888';
            e.currentTarget.style.borderColor = '#555555';
          }}
        >
          START
        </button>
      </div>
    </div>
  );
}
