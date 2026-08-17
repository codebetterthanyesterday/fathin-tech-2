'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ImmersiveAtmosphereProps {
  scrollProgress: number; // 0 to 1 representing section scroll progress
  isDarkMode: boolean;
}

export default function ImmersiveAtmosphere({ scrollProgress, isDarkMode }: ImmersiveAtmosphereProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const particleCount = 1000;
  
  // Create a soft radial gradient texture for the particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  // Generate particle positions, colors, and scales
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a large volume
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 50;
      
      const scale = Math.random() * 0.5 + 0.1;
      
      temp.push({ x, y, z, scale });
    }
    return temp;
  }, [particleCount]);

  // Set colors based on the theme dynamically
  const colorArray = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    const color = new THREE.Color();
    
    // Base colors mapped to approximate Tailwind sky-400 and indigo-400
    // In actual implementation we can use getComputedStyle but doing it dynamically is easier with hex
    const baseColor = isDarkMode ? new THREE.Color(0x38bdf8) : new THREE.Color(0x94a3b8);
    const secondaryColor = isDarkMode ? new THREE.Color(0x818cf8) : new THREE.Color(0xd1d5db);

    for (let i = 0; i < particleCount; i++) {
      const mixRatio = Math.random();
      color.lerpColors(baseColor, secondaryColor, mixRatio);
      
      if (!isDarkMode) {
         // Subtler particles in light mode
         color.multiplyScalar(0.9);
      }

      color.toArray(arr, i * 3);
    }
    return arr;
  }, [particleCount, isDarkMode]);

  // Initialize positions
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Slowly rotate the entire group for ambient movement
    groupRef.current.rotation.y = time * 0.05;
    groupRef.current.rotation.x = time * 0.02;

    // Parallax based on scroll progress (0 to 1)
    // We map progress 0 -> 1 to y translation
    const targetY = (scrollProgress - 0.5) * 20;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);

    // Update individual particle instances
    particles.forEach((particle, i) => {
      const { x, y, z, scale } = particle;
      // Pulse scale
      const currentScale = scale + Math.sin(time * 2 + i) * 0.1;
      
      dummy.position.set(
        x + Math.sin(time * 0.5 + i) * 0.5, 
        y + Math.cos(time * 0.5 + i) * 0.5, 
        z
      );
      dummy.scale.set(currentScale, currentScale, currentScale);
      
      // Face the camera roughly since it's a plane (billboarding is complex for instanced mesh, but planes with additive blending look okay from many angles, or we just look straight down Z)
      // Since the camera doesn't move wildly off Z, we can just leave rotation 0
      
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial 
          map={particleTexture} 
          transparent={true} 
          opacity={isDarkMode ? 0.4 : 0.25} 
          depthWrite={false}
          blending={isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending}
          vertexColors={true}
        />
        <instancedBufferAttribute attach="instanceColor" args={[colorArray, 3]} />
      </instancedMesh>
    </group>
  );
}
