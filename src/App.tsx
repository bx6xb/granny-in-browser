import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { HauntedHouse } from './components/HauntedHouse';
import { Granny } from './components/Granny';
import { Player } from './components/Player';
import { GameUI } from './components/GameUI';
import { InGameMenu } from './components/InGameMenu';
import { MainMenu } from './components/MainMenu';
import { SettingsMenu } from './components/SettingsMenu';
import { useGameSettings } from './store/useGameSettings';

export default function App() {
  const { screen, inGameMenuOpen } = useGameSettings();

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      {screen === 'mainMenu' && <MainMenu />}
      {screen === 'settings' && <SettingsMenu />}
      
      {screen === 'game' && (
        <>
          <GameUI />
          {inGameMenuOpen && <InGameMenu />}
          <div className="crosshair" />
          <Canvas 
            shadows 
            camera={{ position: [0, 0, 0], fov: 75 }}
            gl={{ 
              antialias: false,
              powerPreference: 'high-performance'
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
                <Granny />
                <Player />
              </Suspense>
            </Physics>

            <Stats className="fps-stats" />
          </Canvas>
        </>
      )}
    </div>
  );
}
