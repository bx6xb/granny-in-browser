import { useDoors } from '../store/useDoors';
import { useDrawers } from '../store/useDrawers';
import { useItems } from '../store/useItems';
import { useGuillotine } from '../store/useGuillotine';
import { usePlank } from '../store/usePlank';
import { useTerminal } from '../store/useTerminal';
import { useEscapeDoor } from '../store/useEscapeDoor';
import { useWires } from '../store/useWires';
import { useLock } from '../store/useLock';
import { useSafe } from '../store/useSafe';

export function GameUI() {
  const { nearbyDoor, getDoorState } = useDoors();
  const { nearbyDrawer, openDrawers } = useDrawers();
  const { nearbyItem, heldItem } = useItems();
  const { nearGuillotine, watermelonPlaced } = useGuillotine();
  const { nearPlank, isChippedOff } = usePlank();
  const { nearTerminal } = useTerminal();
  const { cardSwiped, lockOpened } = useEscapeDoor();
  const { nearWire, doorWireCut, shieldWireCut } = useWires();
  const { nearLock } = useLock();
  const { safeOpened } = useSafe();
  const doorState = nearbyDoor ? getDoorState(nearbyDoor) : null;
  const isDrawerOpen = nearbyDrawer ? openDrawers[nearbyDrawer] : false;

  // Format item names for display
  const formatItemName = (itemName: string): string => {
    const nameMap: { [key: string]: string } = {
      padlock_key: 'Padlock Key',
      master_key: 'Master Key',
      card: 'Card',
      safe_key: 'Safe Key',
      handle: 'Handle',
      watermelon: 'Watermelon',
      cut: 'Cut Pliers',
      hammer: 'Hammer',
      wood_plank_item: 'Wood Plank',
    };
    return nameMap[itemName] || itemName;
  };

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
        <div>• E - Interact with doors/drawers</div>
        <div>• F - Grab items</div>
        <div>• Space - Drop item</div>
        <div>• ESC - Unlock mouse</div>
        <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
          💡 Use your flashlight to see in the dark
        </div>
      </div>

      {/* Lock interaction prompt */}
      {nearLock && heldItem === 'padlock_key' && !lockOpened && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffaa00',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(255, 170, 0, 0.5)',
          }}
        >
          🔑 Press [E] to open the Lock
        </div>
      )}

      {/* Terminal interaction prompt */}
      {nearTerminal && heldItem === 'card' && !cardSwiped && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(0, 255, 0, 0.5)',
          }}
        >
          💳 Press [E] to use Card in Terminal
        </div>
      )}

      {/* Wire cutting prompt */}
      {nearWire && heldItem === 'cut' && (
        (nearWire === 'door_wire' && !doorWireCut) || 
        (nearWire.startsWith('shield_wire') && !shieldWireCut)
      ) && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(0, 255, 255, 0.5)',
          }}
        >
          ✂️ Press [E] to cut a wire
        </div>
      )}

      {/* Plank interaction prompt */}
      {nearPlank && heldItem === 'hammer' && !isChippedOff && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffa500',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(255, 165, 0, 0.5)',
          }}
        >
          🔨 Press [E] to chip off Wood Plank
        </div>
      )}

      {/* Guillotine interaction prompt */}
      {nearGuillotine && heldItem === 'watermelon' && !watermelonPlaced && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#ffcc00',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(255, 204, 0, 0.5)',
          }}
        >
          🍉 Press [E] to place Watermelon in Guillotine
        </div>
      )}

      {/* Door interaction prompt */}
      {nearbyDoor && doorState && !doorState.isRotating && !nearGuillotine && !nearPlank && !nearTerminal && !nearWire && !nearLock && (
        nearbyDoor === 'safe_door001' ? (
          !safeOpened && heldItem !== 'safe_key' ? (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ff4444',
                fontFamily: 'monospace',
                fontSize: '18px',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '15px 25px',
                borderRadius: '8px',
                pointerEvents: 'none',
                zIndex: 1000,
                textAlign: 'center',
                border: '2px solid rgba(255, 68, 68, 0.5)',
              }}
            >
              🔒 You need Safe Key to open
            </div>
          ) : !safeOpened && heldItem === 'safe_key' ? (
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
              Press [E] to Open Safe Door
            </div>
          ) : null
        ) : (
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
        )
      )}

      {/* Drawer interaction prompt */}
      {nearbyDrawer && !nearbyDoor && !nearGuillotine && !nearPlank && !nearTerminal && !nearWire && !nearLock && (
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
          Press [E] to {isDrawerOpen ? 'Close' : 'Open'} Drawer
        </div>
      )}

      {/* Item interaction prompt */}
      {nearbyItem && !nearbyDoor && !nearbyDrawer && !nearGuillotine && !nearPlank && !nearTerminal && !nearWire && !nearLock && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: heldItem ? '#ffaa00' : 'white',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: heldItem ? '2px solid rgba(255, 170, 0, 0.5)' : '2px solid rgba(255, 255, 255, 0.3)',
          }}
        >
          Press [F] to {heldItem ? 'swap with' : 'grab'} {formatItemName(nearbyItem)}
        </div>
      )}

      {/* Held item display */}
      {heldItem && (
        <div
          style={{
            position: 'fixed',
            bottom: '30px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '12px 20px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(100, 200, 100, 0.5)',
          }}
        >
          Holding: {formatItemName(heldItem)}
        </div>
      )}
    </>
  );
}
