export function GameUI() {
  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        color: 'white',
        fontFamily: 'monospace',
        fontSize: '14px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        🏚️ Haunted House
      </div>
      <div style={{ marginBottom: '5px' }}>
        <strong>Controls:</strong>
      </div>
      <div>• Click to lock mouse</div>
      <div>• WASD - Move</div>
      <div>• Mouse - Look around</div>
      <div>• C - Crouch</div>
      <div>• ESC - Unlock mouse</div>
    </div>
  );
}
