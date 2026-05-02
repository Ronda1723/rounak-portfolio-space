import { useEffect, useRef } from "react";
import { useGameStore } from "../state/useGameStore";
import { PLANETS, type Planet } from "../config/planets";

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

function matchPlanet(text: string): Planet | null {
  const lower = text.toLowerCase();
  for (const p of PLANETS) {
    for (const alias of p.voiceAliases) {
      if (lower.includes(alias)) return p;
    }
  }
  return null;
}

export function useVoiceCommand() {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listening = useGameStore((s) => s.voiceListening);
  const setListening = useGameStore((s) => s.setVoiceListening);
  const setTranscript = useGameStore((s) => s.setVoiceTranscript);
  const setTarget = useGameStore((s) => s.setTarget);

  useEffect(() => {
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      const display = (final || interim).trim();
      setTranscript(display);
      if (final) {
        const p = matchPlanet(final);
        if (p) setTarget(p);
      }
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [setListening, setTranscript, setTarget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "v" && e.key !== "V") return;
      const rec = recognitionRef.current;
      if (!rec) return;
      if (listening) {
        rec.stop();
      } else {
        setTranscript("listening...");
        try {
          rec.start();
          setListening(true);
        } catch { /* already running */ }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening, setListening, setTranscript]);
}
