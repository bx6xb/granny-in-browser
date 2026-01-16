import { useDoors } from '../store/useDoors';

export function GameUI() {
  const { nearbyDoor, getDoorState } = useDoors();
  const doorState = nearbyDoor ? getDoorState(nearbyDoor) : null;

  return (
    <>
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
          🏚️ Haunted House - Night Mode
        </div>
        <div style={{ marginBottom: '5px' }}>
          <strong>Controls:</strong>
        </div>
        <div>• Click to lock mouse</div>
        <div>• WASD - Move</div>
        <div>• Mouse - Look around</div>
        <div>• C - Crouch</div>
        <div>• E - Interact with doors</div>
        <div>• ESC - Unlock mouse</div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
          💡 Use your flashlight to see in the dark
        </div>
      </div>

      {/* Door interaction prompt */}
      {nearbyDoor && doorState && !doorState.isRotating && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          Press [E] to {doorState.isOpen ? 'Close' : 'Open'} Door
        </div>
      )}
    </>
  );
}
