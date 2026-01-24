import { useEffect } from 'react';
import { useDoors } from '../store/useDoors';
import { useItems } from '../store/useItems';
import { useGuillotine } from '../store/useGuillotine';
import { usePlank } from '../store/usePlank';
import { useTerminal } from '../store/useTerminal';
import { useEscapeDoor } from '../store/useEscapeDoor';
import { useWires } from '../store/useWires';
import { useLock } from '../store/useLock';
import { useSafe } from '../store/useSafe';
import { useWell } from '../store/useWell';
import { useDayState } from '../store/useDayState';
import { useGameSettings } from '../store/useGameSettings';
import { useBedHiding } from '../store/useBedHiding';

export function GameUI() {
  const { nearbyDoor, getDoorState } = useDoors();
  const { nearbyItem, heldItem } = useItems();
  const { nearGuillotine, watermelonPlaced } = useGuillotine();
  const { nearPlank, isChippedOff, nearPlankSlot, plankPlaced } = usePlank();
  const { nearTerminal } = useTerminal();
  const { cardSwiped, lockOpened, isDoorUnlocked, nearMainDoor, hasEscaped } = useEscapeDoor();
  const { nearWire, doorWireCut, shieldWireCut, atticWireCut } = useWires();
  const { nearLock } = useLock();
  const { safeOpened } = useSafe();
  const { nearShaft, nearHandle, handleSet, bucketHeight } = useWell();
  const { currentDay, showDayMessage, gameOver, hideDayMessage } = useDayState();
  const { setScreen } = useGameSettings();
  const { nearBed, isHiding } = useBedHiding();
  const doorState = nearbyDoor ? getDoorState(nearbyDoor) : null;

  // Auto-hide day message after 3 seconds
  useEffect(() => {
    if (showDayMessage && !gameOver) {
      const timer = setTimeout(() => {
        hideDayMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDayMessage, gameOver, hideDayMessage]);

  // Format item names for display
  const formatItemName = (itemName: string): string => {
    const nameMap: { [key: string]: string } = {
      padlock_key: 'Padlock Key',
      master_key: 'Master Key',
      card: 'Card',
      safe_key: 'Safe Key',
      handle: 'Handle',
      watermelon: 'Watermelon',
      cut_pliers: 'Cut Pliers',
      hammer: 'Hammer',
      wood_plank_item: 'Wood Plank',
    };
    return nameMap[itemName] || itemName;
  };

  return (
    <>
      {/* Day message - black screen with day number */}
      {showDayMessage && !gameOver && !hasEscaped && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            color: 'white',
            fontFamily: 'monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '72px', fontWeight: 'bold', textAlign: 'center' }}>
            Day {currentDay}
          </div>
        </div>
      )}

      {/* Game Over screen */}
      {gameOver && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.98)',
            color: '#ff4444',
            fontFamily: 'monospace',
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
            style={{ fontSize: '64px', marginBottom: '40px', fontWeight: 'bold', color: '#ff4444' }}
          >
            GAME OVER
          </div>
          <div style={{ fontSize: '28px', marginBottom: '50px', color: '#fff', opacity: 0.9 }}>
            You failed to escape in 5 days...
          </div>
          <button
            onClick={() => {
              setScreen('mainMenu');
            }}
            style={{
              fontSize: '24px',
              padding: '15px 40px',
              backgroundColor: '#ff4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ff6666';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ff4444';
            }}
          >
            Return to Main Menu
          </button>
        </div>
      )}

      {/* Win screen */}
      {hasEscaped && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            pointerEvents: 'all',
            cursor: 'default',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '30px', fontWeight: 'bold' }}>
            🎉 YOU ESCAPED! 🎉
          </div>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>
            Congratulations! You've successfully escaped the Haunted House!
          </div>
          <button
            onClick={() => {
              setScreen('mainMenu');
            }}
            style={{
              fontSize: '24px',
              padding: '15px 40px',
              backgroundColor: '#00aa00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00cc00';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00aa00';
            }}
          >
            Return to Main Menu
          </button>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: window.innerWidth <= 768 ? '11px' : '14px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: window.innerWidth <= 768 ? '10px' : '15px',
          borderRadius: '8px',
          pointerEvents: 'none',
          zIndex: 1000,
          maxWidth: window.innerWidth <= 768 ? '160px' : 'auto',
        }}
      >
        <div
          style={{
            marginBottom: '10px',
            fontSize: window.innerWidth <= 768 ? '13px' : '16px',
            fontWeight: 'bold',
          }}
        >
          🏚️ Haunted House
        </div>
        {window.innerWidth > 1024 ? (
          <>
            <div style={{ marginBottom: '5px' }}>
              <strong>Controls:</strong>
            </div>
            <div>• Click to lock mouse</div>
            <div>• WASD - Move</div>
            <div>• Mouse - Look around</div>
            <div>• C - Crouch</div>
            <div>• E - Interact with doors</div>
            <div>• F - Grab items</div>
            <div>• Space - Drop item</div>
            <div>• ESC/ALT - Open menu</div>
            <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
              💡 Use your flashlight to see in the dark
            </div>
          </>
        ) : (
          <div style={{ fontSize: '10px', opacity: 0.9 }}>Touch controls enabled</div>
        )}
      </div>

      {/* Main door escape prompt */}
      {nearMainDoor &&
        heldItem === 'master_key' &&
        (isDoorUnlocked ? (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: '20px',
              fontWeight: 'bold',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              padding: '20px 30px',
              borderRadius: '8px',
              pointerEvents: 'none',
              zIndex: 1000,
              textAlign: 'center',
              border: '3px solid rgba(0, 255, 0, 0.7)',
            }}
          >
            🗝️ Press [E] to ESCAPE!
          </div>
        ) : (
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
            🔒 Door is still locked. Complete all tasks first!
          </div>
        ))}

      {/* Well shaft interaction prompt */}
      {nearShaft && heldItem === 'handle' && !handleSet && !nearMainDoor && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#8B4513',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(139, 69, 19, 0.5)',
          }}
        >
          Press [E] to set Handle on Well
        </div>
      )}

      {/* Well handle interaction prompt */}
      {nearHandle && handleSet && bucketHeight < 4.7 && !nearMainDoor && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#4169E1',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(65, 105, 225, 0.5)',
          }}
        >
          Hold [E] to use Well
        </div>
      )}

      {/* Bed hiding interaction prompt */}
      {nearBed && !isHiding && !nearMainDoor && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#9370DB',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(147, 112, 219, 0.5)',
          }}
        >
          Press [E] to hide under bed
        </div>
      )}

      {/* Stand up from bed prompt */}
      {isHiding && (
        <div
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#9370DB',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(147, 112, 219, 0.5)',
          }}
        >
          Press [E] to stand up
        </div>
      )}

      {/* Lock interaction prompt */}
      {nearLock && heldItem === 'padlock_key' && !lockOpened && !nearMainDoor && (
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
      {nearTerminal && heldItem === 'card' && !cardSwiped && !nearMainDoor && (
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
      {nearWire &&
        heldItem === 'cut_pliers' &&
        !nearMainDoor &&
        ((nearWire === 'door_wire' && !doorWireCut) ||
          (nearWire.startsWith('shield_wire') && !shieldWireCut) ||
          (nearWire === 'attic_wire' && !atticWireCut)) && (
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
            ✂️ Press [E] to cut wire
          </div>
        )}

      {/* Plank chipping prompt */}
      {nearPlank && heldItem === 'hammer' && !isChippedOff && !nearMainDoor && (
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

      {/* Plank placement prompt */}
      {nearPlankSlot && heldItem === 'wood_plank_item' && !plankPlaced && !nearMainDoor && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#8B4513',
            fontFamily: 'monospace',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '15px 25px',
            borderRadius: '8px',
            pointerEvents: 'none',
            zIndex: 1000,
            textAlign: 'center',
            border: '2px solid rgba(139, 69, 19, 0.5)',
          }}
        >
          Press [E] to set plank here
        </div>
      )}

      {/* Guillotine interaction prompt */}
      {nearGuillotine && heldItem === 'watermelon' && !watermelonPlaced && !nearMainDoor && (
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
      {nearbyDoor &&
        doorState &&
        !doorState.isRotating &&
        !nearGuillotine &&
        !nearPlank &&
        !nearPlankSlot &&
        !nearTerminal &&
        !nearWire &&
        !nearLock &&
        !nearMainDoor &&
        !nearShaft &&
        !nearHandle &&
        !nearBed &&
        !isHiding &&
        (nearbyDoor === 'safe_door001' ? (
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
        ))}

      {/* Item interaction prompt */}
      {nearbyItem &&
        !nearbyDoor &&
        !nearGuillotine &&
        !nearPlank &&
        !nearPlankSlot &&
        !nearTerminal &&
        !nearWire &&
        !nearLock &&
        !nearMainDoor &&
        !nearShaft &&
        !nearHandle &&
        !nearBed &&
        !isHiding && (
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
              border: heldItem
                ? '2px solid rgba(255, 170, 0, 0.5)'
                : '2px solid rgba(255, 255, 255, 0.3)',
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
