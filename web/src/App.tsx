import { Scene } from "./scene/Scene";
import { HUD } from "./ui/HUD";
import { DockPrompt } from "./ui/DockPrompt";
import { DockedPanel } from "./ui/DockedPanel";
import { ProjectModal } from "./ui/ProjectModal";
import { SatelliteModal } from "./ui/SatelliteModal";
import { SatelliteTooltip } from "./ui/SatelliteTooltip";
import { WarpOverlay } from "./ui/WarpOverlay";
import { HazardWarning } from "./ui/HazardWarning";
import { PlanetTooltip } from "./ui/PlanetTooltip";
import { MiniMap } from "./ui/MiniMap";
import { BootScreen } from "./ui/BootScreen";
import { Explosion } from "./ui/Explosion";
import { useVoiceCommand } from "./voice/useVoiceCommand";
import { useEngineAudio } from "./audio/useEngineAudio";
import "./App.css";

export default function App() {
  useVoiceCommand();
  useEngineAudio();

  return (
    <div className="app">
      <Scene />
      <HazardWarning />
      <HUD />
      <MiniMap />
      <PlanetTooltip />
      <DockPrompt />
      <DockedPanel />
      <WarpOverlay />
      <ProjectModal />
      <SatelliteModal />
      <SatelliteTooltip />
      <Explosion />
      <BootScreen />
    </div>
  );
}
