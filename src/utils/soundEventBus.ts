import * as THREE from 'three';
import { useGrannyState } from '../store/useGrannyState';
import { useGameSettings } from '../store/useGameSettings';
import { navigationSystem } from './navigation';

type SoundCallback = (position: THREE.Vector3) => void;

class SoundEventBus {
  private listeners: SoundCallback[] = [];

  subscribe(callback: SoundCallback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  emit(position: THREE.Vector3) {
    this.listeners.forEach(callback => callback(position));
  }
}

export const soundEventBus = new SoundEventBus();

// Helper function to notify Granny about a sound
export const notifySound = (position: THREE.Vector3) => {
  const { difficulty } = useGameSettings.getState();
  
  // In practice mode, skip all sound processing
  if (difficulty === 'practice') return;
  
  // Find closest point on navmesh
  const closestPoint = navigationSystem.getClosestPointOnNavMesh(position);
  
  // Notify Granny to investigate
  useGrannyState.getState().startInvestigation(closestPoint);
  
  console.log('Sound detected at:', position, 'Closest navmesh point:', closestPoint);
};
