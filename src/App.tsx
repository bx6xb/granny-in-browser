import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { HauntedHouse } from './components/HauntedHouse';
import { Granny } from './components/Granny';
import { Player } from './components/Player';
import { GameUI } from './components/GameUI';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <GameUI />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 75 }}>
        {/* 1. Освещение (для хоррора делаем тусклым) */}
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />

        {/* 2. Окружение (необязательно, но помогает видеть форму) */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* 3. Физика и игра */}
        <Physics gravity={[0, -9.81, 0]}>
          <Suspense fallback={null}>
            <HauntedHouse scale={1} />
            <Granny />
            <Player />
          </Suspense>
        </Physics>
      </Canvas>
    </div>
  );
}
