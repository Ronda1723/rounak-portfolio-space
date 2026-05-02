import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color } from "three";

export function OrbitRing({
  radius,
  segments = 128,
  color = "#5BC0EB",
  opacity = 0.15,
}: {
  radius: number;
  segments?: number;
  color?: string;
  opacity?: number;
}) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(t) * radius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(t) * radius;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    return geo;
  }, [radius, segments]);

  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        color={new Color(color)}
        transparent
        opacity={opacity}
      />
    </lineLoop>
  );
}
