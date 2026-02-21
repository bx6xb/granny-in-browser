export function DeviceWarning() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '2px solid rgba(255, 100, 100, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '64px',
            marginBottom: '20px',
          }}
        >
          🖥️
        </div>

        <h1
          style={{
            color: '#ff6b6b',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '20px',
            fontFamily: 'monospace',
            textShadow: '0 0 10px rgba(255, 107, 107, 0.5)',
          }}
        >
          Desktop Only
        </h1>

        <p
          style={{
            color: '#e0e0e0',
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '15px',
            fontFamily: 'monospace',
          }}
        >
          This game is designed exclusively for desktop computers.
        </p>

        <p
          style={{
            color: '#b0b0b0',
            fontSize: '16px',
            lineHeight: '1.6',
            fontFamily: 'monospace',
          }}
        >
          Please visit this page on a PC or laptop with a keyboard and mouse to play.
        </p>

        <div
          style={{
            marginTop: '30px',
            padding: '15px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 107, 107, 0.2)',
          }}
        >
          <p
            style={{
              color: '#ff9999',
              fontSize: '14px',
              margin: 0,
              fontFamily: 'monospace',
            }}
          >
            ⚠️ Mobile and tablet devices are not supported
          </p>
        </div>
      </div>
    </div>
  );
}
