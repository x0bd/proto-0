"use client";

import * as React from "react";
import { motion } from "motion/react";
import { IoMicOutline, IoMusicalNotesOutline, IoStopOutline, IoPlayOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useAudioAnalysis, type AudioLevels } from "@/hooks/useAudioAnalysis";

interface AudioPanelProps {
  onLevelsChange: (levels: AudioLevels) => void;
  className?: string;
}

/**
 * Audio input panel for testing avatar reactivity.
 * Supports microphone input and audio file upload.
 */
export function AudioPanel({ onLevelsChange, className }: AudioPanelProps) {
  const {
    levels,
    isAnalyzing,
    error,
    connectMicrophone,
    connectFile,
    disconnect,
    stopAnalysis,
    startAnalysis,
  } = useAudioAnalysis({ autoStart: true });

  const [mode, setMode] = React.useState<"idle" | "mic" | "file">("idle");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bufferSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  // Forward levels to parent
  React.useEffect(() => {
    onLevelsChange(levels);
  }, [levels, onLevelsChange]);

  const handleMicClick = async () => {
    if (mode === "mic") {
      disconnect();
      setMode("idle");
    } else {
      disconnect();
      const success = await connectMicrophone();
      if (success) {
        setMode("mic");
        setFileName(null);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    disconnect();
    if (bufferSourceRef.current) {
      bufferSourceRef.current.stop();
      bufferSourceRef.current = null;
    }

    const source = await connectFile(file);
    if (source) {
      bufferSourceRef.current = source;
      source.start(0);
      source.onended = () => {
        stopAnalysis();
        setMode("idle");
      };
      setMode("file");
      setFileName(file.name);
    }
  };

  const handleStop = () => {
    if (bufferSourceRef.current) {
      bufferSourceRef.current.stop();
      bufferSourceRef.current = null;
    }
    disconnect();
    setMode("idle");
    setFileName(null);
  };

  // Level bar helper
  const LevelBar = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <div className="h-16 w-3 bg-foreground/10 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-emerald-500 rounded-full"
          animate={{ height: `${value * 100}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
      <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );

  return (
    <div
      className={cn(
        "bg-background/80 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-lg",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono font-bold tracking-widest text-foreground/80 uppercase">
          Audio Input
        </span>
        <div className="flex items-center gap-1">
          {isAnalyzing && (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <span className="text-[10px] font-mono text-muted-foreground">
            {mode === "mic" ? "MIC" : mode === "file" ? "FILE" : "IDLE"}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-[10px] text-rose-500 mb-3 font-mono">{error}</div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={handleMicClick}
          className={cn(
            "size-10 rounded-full flex items-center justify-center transition-all active:scale-95",
            mode === "mic"
              ? "bg-rose-500 text-white"
              : "bg-foreground/10 text-foreground hover:bg-foreground/20"
          )}
          title="Use Microphone"
        >
          <IoMicOutline className="size-5" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "size-10 rounded-full flex items-center justify-center transition-all active:scale-95",
            mode === "file"
              ? "bg-blue-500 text-white"
              : "bg-foreground/10 text-foreground hover:bg-foreground/20"
          )}
          title="Load Audio File"
        >
          <IoMusicalNotesOutline className="size-5" />
        </button>

        {mode !== "idle" && (
          <button
            onClick={handleStop}
            className="size-10 rounded-full flex items-center justify-center bg-foreground/10 text-foreground hover:bg-foreground/20 transition-all active:scale-95"
            title="Stop"
          >
            <IoStopOutline className="size-5" />
          </button>
        )}
      </div>

      {/* File Name */}
      {fileName && (
        <div className="text-[10px] font-mono text-muted-foreground mb-3 truncate">
          {fileName}
        </div>
      )}

      {/* Level Meters */}
      <div className="flex items-end justify-between gap-2">
        <LevelBar value={levels.bass} label="Bass" />
        <LevelBar value={levels.lowMid} label="Low" />
        <LevelBar value={levels.mid} label="Mid" />
        <LevelBar value={levels.highMid} label="High" />
        <LevelBar value={levels.presence} label="Air" />
        <LevelBar value={levels.overall} label="RMS" />
      </div>
    </div>
  );
}
