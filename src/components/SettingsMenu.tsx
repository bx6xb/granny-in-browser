import { useGameSettings } from '../store/useGameSettings';

export function SettingsMenu() {
  const { difficulty, volume, setDifficulty, setVolume, startGame } = useGameSettings();

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
          gap: '40px',
          padding: '60px',
          backgroundColor: '#1a1a1a',
          border: '3px solid #ffffff',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            color: '#ffffff',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          SETTINGS
        </h2>

        {/* Difficulty Selection */}
        <div>
          <label
            style={{
              fontSize: '24px',
              color: '#ffffff',
              display: 'block',
              marginBottom: '15px',
            }}
          >
            DIFFICULTY
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            {(['easy', 'normal', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                style={{
                  fontSize: '20px',
                  padding: '15px 30px',
                  backgroundColor: difficulty === diff ? '#ffffff' : '#2a2a2a',
                  color: difficulty === diff ? '#000000' : '#ffffff',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
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
              fontSize: '24px',
              color: '#ffffff',
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
            }}
          />
        </div>

        {/* Start Button */}
        <button
          onClick={startGame}
          style={{
            fontSize: '32px',
            padding: '20px 60px',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            border: '3px solid #ffffff',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            marginTop: '20px',
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
          START
        </button>
      </div>
    </div>
  );
}
