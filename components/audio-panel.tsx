"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { IoMicOutline, IoMusicalNotesOutline, IoStopOutline, IoCloseOutline, IoPulseOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { useAudioAnalysis, type AudioLevels } from "@/hooks/useAudioAnalysis";

interface AudioPanelProps {
  onLevelsChange: (levels: AudioLevels) => void;
  onClose?: () => void;
  className?: string;
}

export function AudioPanel({ onLevelsChange, onClose, className }: AudioPanelProps) {
  const {
    levels,
    isAnalyzing,
    error,
    connectMicrophone,
    connectFile,
    disconnect,
    stopAnalysis,
  } = useAudioAnalysis({ autoStart: true });

  const [mode, setMode] = React.useState<"idle" | "mic" | "file">("idle");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const bufferSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  // Auto-forward levels
  React.useEffect(() => {
    onLevelsChange(levels);
  }, [levels, onLevelsChange]);

  const toggleMic = async () => {
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

  // Sleek level bar with theme-aware colors
  const LevelBar = ({ value, label, delay }: { value: number; label: string; delay: number }) => (
    <div className="flex flex-col items-center gap-1.5 group">
      <div className="h-16 w-1.5 bg-foreground/5 rounded-full overflow-hidden relative">
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.1)] dark:shadow-[0_0_8px_rgba(255,255,255,0.3)] rounded-full"
          animate={{ height: `${Math.max(4, value * 100)}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>
      <span className="text-[9px] font-mono text-muted-foreground/60 font-medium tracking-wider group-hover:text-foreground transition-colors">
        {label}
      </span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        // Glass Card base - adapting to light/dark
        "glass-card rounded-3xl p-5",
        "flex flex-col gap-5",
        "border border-border/50",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-1.5 rounded-full transition-colors duration-500",
            isAnalyzing 
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
              : "bg-muted text-muted-foreground"
          )}>
            <IoPulseOutline className="size-4" />
          </div>
          <span className="text-xs font-medium text-foreground tracking-wide">
            Audio Input
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <IoCloseOutline className="size-5" />
          </button>
        )}
      </div>

      {/* Main Controls */}
      <div className="flex items-center gap-3">
        {/* Mic Toggle - Primary Action */}
        <button
          onClick={toggleMic}
          className={cn(
            "flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300",
            mode === "mic"
              ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
              : "bg-muted hover:bg-muted/80 text-foreground border border-transparent hover:border-border/50"
          )}
        >
          {mode === "mic" ? (
             <>
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>Live</span>
             </>
          ) : (
            <>
              <IoMicOutline className="size-4 opacity-70" />
              <span>Mic</span>
            </>
          )}
        </button>

        {/* File Action */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => {
             if (mode === 'file') handleStop();
             else fileInputRef.current?.click();
          }}
          className={cn(
            "h-10 px-4 rounded-xl flex items-center justify-center transition-all duration-300",
             mode === "file" 
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                : "bg-muted hover:bg-muted/80 text-foreground/70 hover:text-foreground"
          )}
          title="Play Audio File"
        >
          {mode === "file" ? <IoStopOutline className="size-4" /> : <IoMusicalNotesOutline className="size-4" />}
        </button>
      </div>

      {/* Visualizer Area */}
      <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
        <div className="flex items-end justify-between px-2 h-20">
          <LevelBar value={levels.bass} label="BASS" delay={0} />
          <LevelBar value={levels.lowMid} label="LOW" delay={0.05} />
          <LevelBar value={levels.mid} label="MID" delay={0.1} />
          <LevelBar value={levels.highMid} label="HIGH" delay={0.15} />
          <LevelBar value={levels.presence} label="AIR" delay={0.2} />
        </div>
      </div>

      {/* Status / Error */}
      <div className="h-4 flex items-center justify-center">
        {error ? (
          <span className="text-[10px] text-rose-500 font-mono tracking-wide">{error}</span>
        ) : fileName ? (
          <span className="text-[10px] text-blue-500 font-mono tracking-wide truncate max-w-[200px]">
            {fileName}
          </span>
        ) : (
            <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase">
              {mode === 'idle' ? 'Ready to analyze' : 'Processing audio stream'}
            </span>
        )}
      </div>
    </motion.div>
  );
}
