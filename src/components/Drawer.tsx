import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDrawers } from '../store/useDrawers';

interface DrawerProps {
  drawerId: string;
  children: React.ReactNode;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  slideDistance?: number;
}

export function Drawer({
  drawerId,
  children,
  position,
  rotation,
  scale,
  slideDistance = 14,
}: DrawerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const userDataSet = useRef(false);
  const openDrawers = useDrawers((state) => state.openDrawers);
  const isOpen = openDrawers[drawerId] || false;

  useFrame(() => {
    if (!innerGroupRef.current || !groupRef.current) return;

    // Set userData on first frame when refs are ready
    if (!userDataSet.current) {
      // Set on both groups
      groupRef.current.userData.isDrawer = true;
      groupRef.current.userData.drawerId = drawerId;
      innerGroupRef.current.userData.isDrawer = true;
      innerGroupRef.current.userData.drawerId = drawerId;

      // Also set on all children (meshes) for raycasting
      innerGroupRef.current.traverse((child) => {
        child.userData.isDrawer = true;
        child.userData.drawerId = drawerId;
      });

      userDataSet.current = true;
    }

    // Animate drawer sliding along X axis
    const targetX = isOpen ? slideDistance : 0;
    const currentX = innerGroupRef.current.position.x;
    const newX = THREE.MathUtils.lerp(currentX, targetX, 0.1);
    innerGroupRef.current.position.x = newX;
  });

  return (
    <group
      ref={groupRef}
      name={drawerId}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ isDrawer: true, drawerId }}
    >
      <group ref={innerGroupRef} userData={{ isDrawer: true, drawerId }}>
        {children}
      </group>
    </group>
  );
}
