import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <div className="app-root">
      <Canvas style={{ background: 'black', width: '100vw', height: '100vh' }}>
        <axesHelper args={[5]} />
        <mesh></mesh>

        <directionalLight position={[2, 2, 2]} intensity={10} />
      </Canvas>
    </div>
  );
}

export default App;
