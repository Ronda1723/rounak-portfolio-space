import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  ShaderMaterial,
  Vector3,
} from "three";

const COUNT = 90;

const VERT = /* glsl */ `
attribute float aSize;
attribute float aLife;
varying float vLife;
void main() {
  vLife = aLife;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (180.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
varying float vLife;
uniform vec3 uColorHot;
uniform vec3 uColorCool;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float core = smoothstep(0.5, 0.0, r);
  vec3 col = mix(uColorCool, uColorHot, vLife);
  gl_FragColor = vec4(col * core, core * vLife);
}
`;

type Props = {
  rocketRef: RefObject<Group | null>;
  thrustRef: RefObject<number>;
};

export function EnginePlume({ rocketRef, thrustRef }: Props) {
  const pointsRef = useRef<Points>(null);

  const { geometry, material, particles } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const lives = new Float32Array(COUNT);
    const particles: { pos: Vector3; vel: Vector3; age: number; ttl: number }[] = [];

    for (let i = 0; i < COUNT; i++) {
      lives[i] = 0;
      sizes[i] = 0;
      particles.push({
        pos: new Vector3(),
        vel: new Vector3(),
        age: 0,
        ttl: 0,
      });
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));
    geo.setAttribute("aLife", new BufferAttribute(lives, 1));

    const mat = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uColorHot: { value: new Color("#ffd49a") },
        uColorCool: { value: new Color("#5BC0EB") },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    return { geometry: geo, material: mat, particles };
  }, []);

  const tmpRel = useRef(new Vector3());
  const tmpDir = useRef(new Vector3());

  useFrame((_, dt) => {
    const rocket = rocketRef.current;
    if (!pointsRef.current || !rocket) return;
    const thrust = thrustRef.current;
    const positions = geometry.getAttribute("position") as BufferAttribute;
    const sizes = geometry.getAttribute("aSize") as BufferAttribute;
    const lives = geometry.getAttribute("aLife") as BufferAttribute;

    // Backward direction in rocket local frame is +Z; transform to world.
    const back = tmpDir.current.set(0, 0, 1).applyEuler(rocket.rotation);

    // Spawn position offset behind the rocket in world space.
    const spawnOffset = tmpRel.current.copy(back).multiplyScalar(0.6);

    let toSpawn = thrust > 0.05 ? Math.ceil(thrust * 10) : 0;

    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      if (p.age < p.ttl) {
        p.age += dt;
        p.pos.addScaledVector(p.vel, dt);
        const t = p.age / p.ttl;
        const life = 1 - t;
        positions.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
        lives.setX(i, life);
        sizes.setX(i, 0.45 + life * 1.6);
      } else if (toSpawn > 0) {
        // Spawn in world space at rocket position + back offset.
        p.pos.copy(rocket.position).add(spawnOffset);
        const spread = 0.18;
        p.vel
          .copy(back)
          .multiplyScalar(2.5 + Math.random() * 2.5)
          .add(
            new Vector3(
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread
            )
          );
        p.age = 0;
        p.ttl = 0.55 + Math.random() * 0.4;
        toSpawn--;
        positions.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
        lives.setX(i, 1);
        sizes.setX(i, 1.4 + Math.random() * 0.6);
      } else {
        sizes.setX(i, 0);
        lives.setX(i, 0);
      }
    }

    positions.needsUpdate = true;
    sizes.needsUpdate = true;
    lives.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} frustumCulled={false} />
  );
}
