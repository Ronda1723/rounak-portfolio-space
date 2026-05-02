import { Stars } from "@react-three/drei";

export function StarField() {
  return (
    <Stars
      radius={120}
      depth={60}
      count={2500}
      factor={4}
      saturation={0.6}
      fade
      speed={0.4}
    />
  );
}
