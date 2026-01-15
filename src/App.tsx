import { Canvas } from '@react-three/fiber';
import { Sky } from '@react-three/drei';
import { Suspense } from 'react';
import { HauntedHouse } from './components/HauntedHouse';
import { Granny } from './components/Granny';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        {/* 1. Освещение (для хоррора делаем тусклым) */}
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />

        {/* 2. Окружение (необязательно, но помогает видеть форму) */}
        <Sky sunPosition={[100, 20, 100]} />

        {/* 3. Твоя локация */}
        <Suspense fallback={null}>
          <HauntedHouse scale={1} />
          <Granny />
        </Suspense>
      </Canvas>
    </div>
  );
}
