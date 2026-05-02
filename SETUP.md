# SpaceX Portfolio — Setup State

A voice-commanded, planet-hopping 3D portfolio. SpaceX mission-control aesthetic.
Six planets = six projects. Pilot a rocket, voice-command "Take me to MiniFlow",
GSAP autopilots the camera, landing opens a mission-briefing panel.

## Stack (decided)

- **Renderer**: Three.js + React Three Fiber (R3F) + drei + leva
- **Post-FX**: postprocessing (Bloom, DoF, ChromaticAberration, FilmGrain, Vignette, ACES tone mapping)
- **Physics**: Rapier (@react-three/rapier) — rocket inertia
- **Animation**: GSAP for cinematic camera flights + R3F useFrame
- **Voice**: Web Speech API → upgrade to Deepgram Nova-3 via Railway backend (per Uxie pattern)
- **Audio**: Howler.js + Three PositionalAudio (engine rumble, planet flyby doppler, ambient drone)
- **State**: Zustand
- **Build**: Vite + React + TypeScript
- **3D assets**: Blender 5.1.1 → glTF 2.0 (.glb) with Draco compression

## Blender MCP setup — current state

**Goal**: drive Blender from Claude Code via MCP so I can generate scene assets in this session.

### What's installed and working
- ✅ Blender 5.1.1 installed
- ✅ "Allow Online Access" enabled in Preferences → System
- ✅ "lab.blender.org" extension repository added
- ✅ MCP addon v0.3.0 installed and enabled
  - Path: `/Users/rounaklenka/Library/Application Support/Blender/5.1/extensions/user_default/mcp/`
  - Maintainer: Blender Lab
- ✅ MCP bridge server started inside Blender (Preferences → Add-ons → MCP → Start MCP Bridge Server)
  - Listens on `localhost:9876`
  - Protocol: null-byte-delimited JSON over TCP
  - Request shape: `{"type": "execute", "code": "<python>", "strict_json": true}`
- ✅ Bridge code written: stdio MCP server that forwards to Blender's TCP
  - Bridge dir: `/Users/rounaklenka/.claude/mcp-bridges/blender-bridge/`
  - Entry: `bridge.py` (exposes one tool: `blender_execute`)
  - Venv: `venv/bin/python` with `mcp` SDK installed
- ✅ End-to-end protocol tested — got Blender 5.1.1 to respond with default scene objects

### What's pending
- ⏳ Register the bridge as an MCP server in Claude Code
  - Run this in terminal:
    ```bash
    python3 -c "
    import json, pathlib
    p = pathlib.Path.home() / '.claude.json'
    d = json.loads(p.read_text())
    d.setdefault('mcpServers', {})['blender'] = {
        'type': 'stdio',
        'command': '/Users/rounaklenka/.claude/mcp-bridges/blender-bridge/venv/bin/python',
        'args': ['/Users/rounaklenka/.claude/mcp-bridges/blender-bridge/bridge.py']
    }
    p.write_text(json.dumps(d, indent=2))
    print('added')
    "
    ```
- ⏳ Reload VS Code window: Cmd+Shift+P → "Developer: Reload Window"
- ⏳ Verify in new chat: `/mcp` should show `blender` connected
- ⏳ Confirm Blender app is running with MCP bridge server started

### Important caveats discovered
- The Blender Lab MCP addon does NOT put a tab in the N-panel sidebar — its
  Start/Stop buttons are inside the addon's preferences page (Preferences →
  Add-ons → expand MCP).
- The addon runs a custom TCP protocol, NOT standard MCP. That's why a stdio→TCP
  bridge process was needed for Claude Code (which speaks stdio MCP).
- Claude Desktop's built-in Blender connector handles this bridging itself, but
  we're using Claude Code so we wrote our own bridge.
- `claude` CLI is not installed on this machine — MCP servers must be registered
  by editing `~/.claude.json` directly (not via `claude mcp add`).

## Project plan (4–6 week solo build)

1. **Week 1** — Vite + R3F skeleton, star field, free-fly camera, postprocessing
2. **Week 2** — Blender: rocket + 1 planet, full PBR bake, glTF into scene + flight controls (Rapier)
3. **Week 3** — Remaining 5 planets, orbit math, parallax stars, audio layer
4. **Week 4** — Voice command pipeline (Web Speech → Deepgram), GSAP autopilot, landing sequence
5. **Week 5** — Mission briefing UI overlays, HUD, mission-control aesthetic pass
6. **Week 6** — Performance pass (LOD, KTX2/Basis textures), mobile fallback, deploy

## 3D asset budget (web)

- Rocket: <2 MB .glb, <50k tris
- Each planet: <1 MB, <20k tris (sphere + displacement does the heavy lift)
- Total scene: <100 draw calls
- Textures: 2K max, 1K preferred, atlased

## "GTA cinematic" checklist (what makes it feel AAA)

- ACES Filmic tone mapping (single line, biggest impact)
- Bloom on emissive engine plumes + planet city lights
- Depth of Field — focus rocket, blur far planets
- Chromatic aberration 0.002, film grain 0.15, vignette 0.3
- FOV punch on acceleration (60° → 75°)
- Slight perlin handheld noise on idle camera
- Engine rumble pitched by velocity, planet flyby doppler whoosh, ambient drone
- 1 directional light (sun) + HDRI env, real-time shadows ONLY on rocket

## Project location

This file: `/Users/rounaklenka/Desktop/rounak portfolio space/SETUP.md`
Web app (planned): `~/projects/spacex-portfolio` (not yet scaffolded)

## How to resume in a new session

Tell new Claude Code:
> "Read `~/Desktop/rounak portfolio space/SETUP.md`. Continue the SpaceX
> portfolio Blender modeling work. Verify the `blender` MCP server is connected
> via `/mcp`, confirm Blender is open with its bridge server running on
> localhost:9876, then start with the Falcon 9 rocket — clear the default scene
> first."
