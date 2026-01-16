import { Canvas } from '@react-three/fiber';
import { Stats } from '@react-three/drei';
import { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { HauntedHouse } from './components/HauntedHouse';
import { Granny } from './components/Granny';
import { Player } from './components/Player';
import { GameUI } from './components/GameUI';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
      <GameUI />
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 0], fov: 75 }}
        gl={{ 
          antialias: false, // Disable for better performance
          powerPreference: 'high-performance'
        }}
      >
        {/* Dark ambient light for night atmosphere */}
        <ambientLight intensity={0.05} />
        
        {/* Very subtle moonlight from above */}
        <directionalLight 
          position={[0, 50, 0]} 
          intensity={0.1} 
          color="#4a5f8f"
          castShadow={false}
        />

        {/* Fog for atmosphere and performance (culls distant objects) */}
        <fog attach="fog" args={['#000000', 10, 50]} />

        {/* Physics and game */}
        <Physics gravity={[0, -9.81, 0]}>
          <Suspense fallback={null}>
            <HauntedHouse scale={1} />
            <Granny />
            <Player />
          </Suspense>
        </Physics>

        {/* FPS Counter */}
        <Stats className="fps-stats" />
      </Canvas>
    </div>
  );
}
