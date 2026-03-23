"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { BrainCircuit, Loader2 } from "lucide-react"

interface TranscriptPanelProps {
  text: string
  isFinal?: boolean
  isThinking?: boolean
  accentColor?: string
  className?: string
}

export function TranscriptPanel({
  text,
  isFinal = false,
  isThinking = false,
  accentColor = "#7c3aed",
  className
}: TranscriptPanelProps) {
  if (!text && !isThinking) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.98 }}
        transition={{ type: "spring", damping: 25, stiffness: 400 }}
        className={cn(
          "w-full max-w-md p-5 rounded-[24px] bg-background/80 backdrop-blur-xl border-2 shadow-premium flex flex-col gap-3",
          className
        )}
        style={{ borderColor: `${accentColor}20` }}
      >
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
            <BrainCircuit className="size-3" />
          </div>
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">DOT</span>
        </div>

        <div className="min-h-[60px]">
          {isThinking && !text ? (
            <div className="flex items-center gap-2 text-muted-foreground h-full">
              <Loader2 className="size-4 animate-spin" style={{ color: accentColor }} />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          ) : (
            <p className={cn(
              "text-[16px] leading-relaxed transition-opacity duration-300",
              isFinal ? "text-foreground font-medium" : "text-foreground/70"
            )}>
              {text}
              {!isFinal && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-1.5 h-4 ml-1 align-middle rounded-sm"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
