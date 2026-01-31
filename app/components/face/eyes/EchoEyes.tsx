/**
 * Echo Eyes - Minimal dots
 * "The Essence" - minimalist, stark, pure
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
  const theme = getAgentTheme("echo")!;
  
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
        {/* Subtle outer ring on hover */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 4}
          fill="none"
          stroke={theme.glow}
          strokeWidth="1"
          opacity="0"
          className="transition-opacity duration-300"
          style={{ 
            opacity: 0,
            transition: "opacity 0.3s ease"
          }}
        />
        
        {/* Main dot */}
        <circle
          ref={eyeRef as RefObject<SVGCircleElement>}
          cx={cx}
          cy={cy}
          r={r}
          fill={theme.eyeWhite}
          style={{
            filter: `drop-shadow(0 0 6px ${theme.glow})`,
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.3s ease-out",
          }}
          className="cursor-pointer hover:opacity-80"
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Subtle breathing pulse */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={theme.glow}
          strokeWidth="1"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values={`${r};${r + 3};${r}`}
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.1;0.3"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    );
  };

  return (
    <g className="echo-eyes">
      {/* Minimalist connecting line */}
      <line
        x1={geo.leftCx + geo.leftRx + 10}
        y1={geo.leftCy}
        x2={geo.rightCx - geo.rightRx - 10}
        y2={geo.rightCy}
        stroke={theme.text}
        strokeWidth="0.5"
        opacity="0.1"
      />
      
      {renderDotEye("left", geo.leftCx, geo.leftCy, geo.leftRx, leftRef)}
      {renderDotEye("right", geo.rightCx, geo.rightCy, geo.rightRx, rightRef)}
    </g>
  );
}
