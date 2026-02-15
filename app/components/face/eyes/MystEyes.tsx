/**
 * Myst Eyes - Triangular layout with 3 eyes
 * "The Visionary" - minimalist, stark
 * REFACTORED: Minimal Black & White Vibe
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function MystEyes({
  leftRef,
  rightRef,
  topRef,
  leftPupilRef,
  rightPupilRef,
  topPupilRef,
  onWink,
  onHoverStart,
  onHoverEnd,
  pupilOffset = { x: 0, y: 0 },
  isActive = false,
}: EyeProps) {
  const geo = EYE_GEOMETRIES.myst!;
  // We use the theme for colors, but enforce minimal stroke/fill styles directly
  const theme = getAgentTheme("myst")!;
  
  // Pupil movement range
  const pupilMoveX = geo.leftRx * 0.35;
  const pupilMoveY = geo.leftRy * 0.35;
  
  const pupilX = pupilOffset.x * pupilMoveX;
  const pupilY = pupilOffset.y * pupilMoveY;
  
  // Listening state
  const eyeScale = isActive ? 1.05 : 1;
  const pupilScale = isActive ? 1.1 : 1;

  const renderEye = (
    side: "left" | "right" | "top",
    cx: number,
    cy: number,
    r: number,
    eyeRef: RefObject<SVGElement | null>,
    pupilRef?: RefObject<SVGGElement | null>,
    delay: number = 0
  ) => {
    const clipId = `myst-clip-${side}`;
    
    return (
      <g key={side}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        
        {/* Sclera - Pure Outline or Simple Fill */}
        <circle
          ref={eyeRef as RefObject<SVGCircleElement>}
          cx={cx}
          cy={cy}
          r={r}
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5"
          style={{
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.2s ease-out",
          }}
          className="cursor-pointer text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Pupil group */}
        <g
          ref={pupilRef as React.LegacyRef<SVGGElement>}
          clipPath={`url(#${clipId})`}
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)", // Snappy
          }}
        >
          {/* Main pupil - Solid Dot */}
          <circle
            cx={cx}
            cy={cy}
            r={geo.pupilRadius!}
            fill="currentColor"
            className="text-foreground"
          />
          
          {/* Highlight - crisp, no opacity */}
          <circle
            cx={cx - geo.pupilRadius! * 0.35}
            cy={cy - geo.pupilRadius! * 0.35}
            r={geo.pupilRadius! * 0.25}
            fill="currentColor"
            className="text-background"
          />
        </g>
      </g>
    );
  };

  return (
    <g className="myst-eyes">
      {/* Connecting lines - Minimal hairline */}
      <path
        d={`M ${geo.leftCx} ${geo.leftCy} L ${geo.topCx} ${geo.topCy} L ${geo.rightCx} ${geo.rightCy} Z`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 4"
        className="text-muted-foreground/40"
      />
      
      {/* Top eye (third eye) */}
      {topRef && renderEye("top", geo.topCx!, geo.topCy!, geo.topR!, topRef, topPupilRef, 0)}
      
      {/* Left eye */}
      {renderEye("left", geo.leftCx, geo.leftCy, geo.leftRx, leftRef, leftPupilRef, 1)}
      
      {/* Right eye */}
      {renderEye("right", geo.rightCx, geo.rightCy, geo.rightRx, rightRef, rightPupilRef, 2)}
    </g>
  );
}
