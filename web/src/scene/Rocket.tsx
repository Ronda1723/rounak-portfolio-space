import { forwardRef, useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh, MeshStandardMaterial } from "three";

const ROCKET_URL = "/assets/rocket/dragon.glb";

type Props = {
  initialPosition?: [number, number, number];
};

export const Rocket = forwardRef<Group, Props>(({ initialPosition }, ref) => {
  const { scene } = useGLTF(ROCKET_URL);

  // Clone so we don't mutate the cached source.
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // Punch up the materials so the rocket reads as polished metal/paint
  // instead of flat plastic.
  useEffect(() => {
    cloned.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      obj.castShadow = true;
      obj.receiveShadow = false;
      const mat = obj.material;
      if (!mat) return;
      const apply = (m: MeshStandardMaterial) => {
        const base = m.color?.getHex() ?? 0xffffff;
        // Detect engine emission (warm orange in the source mat) and keep it.
        const isEmissive = m.emissiveIntensity > 0;
        if (isEmissive) {
          m.emissiveIntensity = 6.0;
          m.toneMapped = false;
          return;
        }
        const isWhite = base > 0xc0c0c0;
        const isBlack = base < 0x202020;
        if (isWhite) {
          m.metalness = 0.55;
          m.roughness = 0.32;
        } else if (isBlack) {
          m.metalness = 0.65;
          m.roughness = 0.38;
        } else {
          m.metalness = 0.85;
          m.roughness = 0.28;
        }
        m.envMapIntensity = 1.5;
        m.needsUpdate = true;
      };
      if (Array.isArray(mat)) mat.forEach((m) => apply(m as MeshStandardMaterial));
      else apply(mat as MeshStandardMaterial);
    });
  }, [cloned]);

  return (
    <group ref={ref} position={initialPosition ?? [0, 0, 0]}>
      <primitive
        object={cloned}
        scale={0.45}
        rotation={[0, 0, 0]}
      />
    </group>
  );
});
Rocket.displayName = "Rocket";

useGLTF.preload(ROCKET_URL);
