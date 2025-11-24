"use client";

import { useEffect, useRef, useState } from "react";

const VOLUME = 0.08;

export function AmbientSoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const [available, setAvailable] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      dispose();
    };
  }, []);

  const dispose = () => {
    noiseSourceRef.current?.stop();
    noiseSourceRef.current?.disconnect();
    noiseSourceRef.current = null;
    gainRef.current?.disconnect();
    gainRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
  };

  const toggle = async () => {
    if (enabled) {
      dispose();
      setEnabled(false);
      return;
    }

    try {
      const context = audioContextRef.current ?? new AudioContext();
      if (context.state === "suspended") {
        await context.resume();
      }

      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i += 1) {
        channel[i] = (Math.random() * 2 - 1) * Math.exp(-i / channel.length);
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = context.createGain();
      gain.gain.value = VOLUME;

      source.connect(gain);
      gain.connect(context.destination);
      source.start(0);

      audioContextRef.current = context;
      noiseSourceRef.current = source;
      gainRef.current = gain;
      setEnabled(true);
    } catch (error) {
      console.error("Failed to initialize ambient sound", error);
      setAvailable(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!available}
      className={`motion-spring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
        enabled
          ? "border-accent/40 bg-accent/20 text-accent hover:border-accent"
          : "border-white/10 bg-card/70 text-muted hover:border-accent/40 hover:text-accent"
      } ${!available ? "opacity-60" : ""}`}
    >
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          enabled ? "bg-accent shadow-[0_0_12px_rgba(213,155,246,0.6)]" : "bg-muted"
        }`}
      />
      <span>{enabled ? "Ambient on" : "Ambient off"}</span>
    </button>
  );
}
