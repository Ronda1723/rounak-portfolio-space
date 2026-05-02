import { forwardRef, useMemo, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Group, ShaderMaterial } from "three";

type Props = {
  initialPosition?: [number, number, number];
  thrustRef?: RefObject<number>;
};

const FLAME_VERT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uThrust;

void main() {
  vUv = uv;
  vec3 pos = position;
  // Wobble tip; uv.y ~ 1 at apex, 0 at base
  float t = uv.y;
  float wobble = sin(uTime * 28.0 + t * 14.0) * 0.06 * t;
  float wobble2 = cos(uTime * 33.0 + t * 11.0) * 0.06 * t;
  pos.x += wobble * uThrust;
  pos.y += wobble2 * uThrust;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FLAME_FRAG = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uThrust;

void main() {
  // Distance from cone center axis (uv.x ~ longitude around cone)
  // For a cone with openEnded, uv.x sweeps 0..1 around the surface; we want
  // a soft falloff toward the apex (uv.y -> 1) and a hot core near base.
  float t = vUv.y;

  vec3 white  = vec3(1.0, 1.0, 0.94);
  vec3 yellow = vec3(1.0, 0.82, 0.35);
  vec3 orange = vec3(1.0, 0.45, 0.12);
  vec3 deep   = vec3(0.85, 0.20, 0.05);
  vec3 blue   = vec3(0.35, 0.65, 1.0);

  // Body color along length: white-hot near base, fading to orange/red, blue at tip
  vec3 col = mix(white, yellow, smoothstep(0.0, 0.18, t));
  col = mix(col, orange, smoothstep(0.18, 0.55, t));
  col = mix(col, deep, smoothstep(0.55, 0.85, t));
  col = mix(col, blue, smoothstep(0.85, 1.0, t));

  // Flicker
  float flicker = 0.86 + 0.14 * sin(uTime * 55.0 + t * 18.0);

  // Length-based alpha — fade out at apex
  float lenAlpha = smoothstep(1.0, 0.05, t);
  // Boost near base
  float baseGlow = smoothstep(0.0, 0.25, 1.0 - t) * 0.7;

  float a = lenAlpha * (0.85 + baseGlow);
  vec3 finalCol = col * (1.6 + baseGlow) * flicker;
  gl_FragColor = vec4(finalCol, a * smoothstep(0.0, 0.15, uThrust));
}
`;

function Flame({ thrustRef }: { thrustRef?: RefObject<number> }) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: FLAME_VERT,
        fragmentShader: FLAME_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uThrust: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );

  const innerMat = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: FLAME_VERT,
        fragmentShader: FLAME_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uThrust: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );

  useFrame((_, dt) => {
    const target = thrustRef?.current ?? 0;
    const cur = material.uniforms.uThrust.value;
    const next = cur + (target - cur) * Math.min(1, dt * 8);
    material.uniforms.uTime.value += dt;
    material.uniforms.uThrust.value = next;
    innerMat.uniforms.uTime.value += dt;
    innerMat.uniforms.uThrust.value = next;
  });

  // Cone is built along Y by default (apex at +Y). We rotate +π/2 around X so
  // apex ends up at +Z (the rocket's "back" direction).
  return (
    <group position={[0, 0, 1.55]} rotation={[Math.PI / 2, 0, 0]}>
      {/* Outer flame: wide, soft halo */}
      <mesh material={material} renderOrder={3} frustumCulled={false}>
        <coneGeometry args={[0.24, 1.6, 32, 8, true]} />
      </mesh>
      {/* Inner flame: narrower, hotter core */}
      <mesh
        material={innerMat}
        renderOrder={4}
        frustumCulled={false}
        scale={[0.55, 1.05, 0.55]}
      >
        <coneGeometry args={[0.24, 1.6, 32, 8, true]} />
      </mesh>
    </group>
  );
}

export const Rocket = forwardRef<Group, Props>(
  ({ initialPosition, thrustRef }, ref) => {
    return (
      <group ref={ref} position={initialPosition ?? [0, 0, 0]} scale={0.55}>
        {/* ── Body (main fuselage) ───────────────────────────── */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 2.0, 48]} />
          <meshStandardMaterial
            color="#f4f4f6"
            metalness={0.55}
            roughness={0.22}
            envMapIntensity={1.6}
          />
        </mesh>

        {/* Black cockpit window strip near the nose */}
        <mesh position={[0, 0, -0.55]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.262, 0.262, 0.22, 48]} />
          <meshStandardMaterial
            color="#0d1320"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={2.5}
          />
        </mesh>

        {/* Red accent stripe */}
        <mesh position={[0, 0, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.263, 0.263, 0.06, 48]} />
          <meshStandardMaterial
            color="#d73c2c"
            metalness={0.4}
            roughness={0.4}
          />
        </mesh>

        {/* Mid panel seam (subtle dark band) */}
        <mesh position={[0, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.261, 0.261, 0.03, 48]} />
          <meshStandardMaterial
            color="#1a1d24"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* ── Nose cone ──────────────────────────────────────── */}
        <mesh
          position={[0, 0, -1.4]}
          rotation={[-Math.PI / 2, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.26, 0.85, 48]} />
          <meshStandardMaterial
            color="#f4f4f6"
            metalness={0.55}
            roughness={0.22}
            envMapIntensity={1.6}
          />
        </mesh>

        {/* Nose-tip nav light (small emissive sphere) */}
        <mesh position={[0, 0, -1.85]}>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshStandardMaterial
            color="#ffd089"
            emissive="#ffaa55"
            emissiveIntensity={6}
            toneMapped={false}
          />
        </mesh>

        {/* ── Engine collar (dark wider section) ─────────────── */}
        <mesh
          position={[0, 0, 1.08]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 48]} />
          <meshStandardMaterial
            color="#101216"
            metalness={0.85}
            roughness={0.32}
          />
        </mesh>

        {/* ── Engine bell (truncated cone, flares back) ──────── */}
        <mesh
          position={[0, 0, 1.4]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <cylinderGeometry args={[0.32, 0.2, 0.45, 48, 1, true]} />
          <meshStandardMaterial
            color="#0a0a0d"
            metalness={0.95}
            roughness={0.18}
            side={2}
            envMapIntensity={1.8}
          />
        </mesh>

        {/* Inner engine glow ring */}
        <mesh position={[0, 0, 1.59]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.08, 0.3, 32]} />
          <meshBasicMaterial color="#ff8a3c" toneMapped={false} />
        </mesh>

        {/* ── 3 fins ─────────────────────────────────────────── */}
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.36,
                Math.sin(angle) * 0.36,
                1.0,
              ]}
              rotation={[0, 0, angle]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.025, 0.55]} />
              <meshStandardMaterial
                color="#1a1d24"
                metalness={0.7}
                roughness={0.35}
              />
            </mesh>
          );
        })}

        {/* ── Animated flame ─────────────────────────────────── */}
        <Flame thrustRef={thrustRef} />
      </group>
    );
  }
);
Rocket.displayName = "Rocket";
