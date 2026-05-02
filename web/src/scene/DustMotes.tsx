import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferAttribute, BufferGeometry, Points, ShaderMaterial, AdditiveBlending, Color } from "three";

type Props = {
  bounds: [number, number, number];
  count?: number;
  color?: string;
};

const VERT = /* glsl */ `
attribute float aSize;
attribute float aSeed;
varying float vAlpha;
uniform float uTime;
uniform vec3 uBounds;

void main() {
  vec3 p = position;
  // Gentle drift: slow sinusoidal motion on a per-mote phase
  float phase = aSeed * 6.2831853;
  p.x += sin(uTime * 0.18 + phase) * 0.6;
  p.y += sin(uTime * 0.10 + phase * 1.3) * 0.4;
  p.z += cos(uTime * 0.15 + phase * 0.7) * 0.6;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * (160.0 / -mv.z);

  vAlpha = 0.15 + 0.5 * (sin(uTime * 0.6 + phase) * 0.5 + 0.5);
}
`;

const FRAG = /* glsl */ `
varying float vAlpha;
uniform vec3 uColor;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = length(d);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.0, r) * vAlpha;
  gl_FragColor = vec4(uColor * a, a);
}
`;

export function DustMotes({ bounds, count = 120, color = "#ffffff" }: Props) {
  const ref = useRef<Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * bounds[0];
      positions[i * 3 + 1] = Math.random() * bounds[1] * 0.9 + 0.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * bounds[2];
      sizes[i] = 0.6 + Math.random() * 1.4;
      seeds[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("aSize", new BufferAttribute(sizes, 1));
    g.setAttribute("aSeed", new BufferAttribute(seeds, 1));
    const m = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uBounds: { value: bounds },
        uColor: { value: new Color(color) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return { geometry: g, material: m };
  }, [count, bounds, color]);

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
