/**
 * Echo Eyes - Minimal dots
 * "The Essence" - minimalist, stark, pure
 * REFACTORED: Minimal Black & White Vibe
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function EchoEyes({
  leftRef,
  rightRef,
  onWink,
  onHoverStart,
  onHoverEnd,
  isActive = false,
}: EyeProps) {
  const geo = EYE_GEOMETRIES.echo!;
  
  // Listening state - subtle size change
  const eyeScale = isActive ? 1.15 : 1;

  const renderDotEye = (
    side: "left" | "right",
    cx: number,
    cy: number,
    r: number,
    eyeRef: RefObject<SVGElement | null>
  ) => {
    return (
      <g key={side}>
        {/* Main dot - Solid filled outline, extremely simple */}
        <circle
          ref={eyeRef as RefObject<SVGCircleElement>}
          cx={cx}
          cy={cy}
          r={r}
          fill="currentColor"
          className="cursor-pointer text-foreground hover:opacity-80 transition-opacity duration-300"
          style={{
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.3s ease-out",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Ring ripple on interaction only - removed constant breathing */}
      </g>
    );
  };

  return (
    <g className="echo-eyes">
      {/* Absolute zero distraction. No connecting line. */}
      
      {renderDotEye("left", geo.leftCx, geo.leftCy, geo.leftRx, leftRef)}
      {renderDotEye("right", geo.rightCx, geo.rightCy, geo.rightRx, rightRef)}
    </g>
  );
}
