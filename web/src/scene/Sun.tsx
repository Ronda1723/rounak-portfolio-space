import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Mesh, TextureLoader, BackSide, AdditiveBlending, Color } from "three";
import { SUN_RADIUS } from "../config/planets";

const SUN_TEXTURE = "/assets/textures/2k_sun.jpg";

export function Sun() {
  const meshRef = useRef<Mesh>(null);
  const glowRef = useRef<Mesh>(null);
  const tex = useLoader(TextureLoader, SUN_TEXTURE);

  useFrame((_, dt) => {
    if (meshRef.current) meshRef.current.rotation.y += dt * 0.06;
    if (glowRef.current) {
      const t = performance.now() * 0.0005;
      const s = 1 + Math.sin(t) * 0.025;
      glowRef.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={120} distance={80} decay={1.6} color="#ffe4a8" />
      <mesh ref={meshRef}>
        <sphereGeometry args={[SUN_RADIUS, 64, 32]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef} scale={1.18}>
        <sphereGeometry args={[SUN_RADIUS, 32, 16]} />
        <meshBasicMaterial
          color={new Color("#ffb347")}
          transparent
          opacity={0.18}
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh scale={1.45}>
        <sphereGeometry args={[SUN_RADIUS, 32, 16]} />
        <meshBasicMaterial
          color={new Color("#ff8a3d")}
          transparent
          opacity={0.06}
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
