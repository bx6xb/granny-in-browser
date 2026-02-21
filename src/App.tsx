import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { Physics } from '@react-three/rapier';
import { HauntedHouse } from './components/HauntedHouse';
import { Granny } from './components/Granny';
import { Player } from './components/Player';
import { GameUI } from './components/GameUI';
import { InGameMenu } from './components/InGameMenu';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { DeviceWarning } from './components/DeviceWarning';
import { useGameSettings } from './store/useGameSettings';
import { useDayState } from './store/useDayState';
import { useEscapeDoor } from './store/useEscapeDoor';

export default function App() {
  const { screen, inGameMenuOpen, difficulty } = useGameSettings();
  const { gameOver } = useDayState();
  const { hasEscaped } = useEscapeDoor();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 1024;
      const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile((isTouchDevice && isSmallScreen) || mobileUserAgent);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  if (isMobile) {
    return <DeviceWarning />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      {screen === 'mainMenu' && <MainMenu />}
      {screen === 'settings' && <SettingsMenu />}

      {screen === 'game' && (
        <>
          <GameUI />
          {inGameMenuOpen && !gameOver && !hasEscaped && <InGameMenu />}
          <div className="crosshair" />
          <Canvas
            shadows
            camera={{ position: [0, 0, 0], fov: 75 }}
            gl={{
              antialias: false,
              powerPreference: 'high-performance',
            }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
                console.warn('WebGL context lost - attempting recovery');
              });
              gl.domElement.addEventListener('webglcontextrestored', () => {
                console.log('WebGL context restored');
                window.location.reload();
              });
            }}
          >
            <ambientLight intensity={0.05} />

            <directionalLight
              position={[0, 50, 0]}
              intensity={0.1}
              color="#4a5f8f"
              castShadow={false}
            />

            <fog attach="fog" args={['#000000', 10, 50]} />

            <Physics gravity={[0, -9.81, 0]}>
              <Suspense fallback={null}>
                <HauntedHouse scale={1} />
                {difficulty !== 'practice' && <Granny />}
                <Player />
              </Suspense>
            </Physics>

            {import.meta.env.DEV && <Stats className="fps-stats" />}
          </Canvas>
        </>
      )}
    </div>
  );
}
