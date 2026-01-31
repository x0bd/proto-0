/**
 * Myst Eyes - Triangular layout with 3 eyes
 * "The Visionary" - mystical, all-seeing, ethereal
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
  const theme = getAgentTheme("myst")!;
  
  // Pupil movement range
  const pupilMoveX = geo.leftRx * 0.35;
  const pupilMoveY = geo.leftRy * 0.35;
  
  const pupilX = pupilOffset.x * pupilMoveX;
  const pupilY = pupilOffset.y * pupilMoveY;
  
  // Listening state
  const eyeScale = isActive ? 1.1 : 1;
  const pupilScale = isActive ? 1.15 : 1;

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
    const gradientId = `myst-pupil-gradient-${side}`;
    
    return (
      <g key={side}>
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <radialGradient id={gradientId} cx="30%" cy="30%">
            <stop offset="0%" stopColor={theme.pupilStart} />
            <stop offset="100%" stopColor={theme.pupilEnd} />
          </radialGradient>
        </defs>
        
        {/* Ethereal outer glow */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 10}
          fill="none"
          stroke={theme.glow}
          strokeWidth="1"
          opacity="0.3"
        >
          <animate
            attributeName="r"
            values={`${r + 8};${r + 14};${r + 8}`}
            dur={`${3 + delay * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.3;0.6;0.3"
            dur={`${3 + delay * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Sclera */}
        <circle
          ref={eyeRef as RefObject<SVGCircleElement>}
          cx={cx}
          cy={cy}
          r={r}
          fill={theme.eyeWhite}
          stroke={theme.accent}
          strokeWidth="1.5"
          style={{
            filter: `drop-shadow(0 0 15px ${theme.glow})`,
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.2s ease-out",
          }}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Pupil group */}
        <g
          ref={pupilRef}
          clipPath={`url(#${clipId})`}
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main pupil */}
          <circle
            cx={cx}
            cy={cy}
            r={geo.pupilRadius!}
            fill={`url(#${gradientId})`}
          />
          {/* Mystical inner glow */}
          <circle
            cx={cx}
            cy={cy}
            r={geo.pupilRadius! - 2}
            fill="none"
            stroke={theme.glow}
            strokeWidth="1"
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.4;0.8;0.4"
              dur="2s"
              repeatCount="indefinite"
              begin={`${delay * 0.3}s`}
            />
          </circle>
          {/* Highlight */}
          <circle
            cx={cx - geo.pupilRadius! * 0.35}
            cy={cy - geo.pupilRadius! * 0.35}
            r={geo.pupilRadius! * 0.3}
            fill="white"
            opacity="0.85"
          />
        </g>
      </g>
    );
  };

  return (
    <g className="myst-eyes">
      {/* Connecting lines between eyes - ethereal triangular structure */}
      <path
        d={`M ${geo.leftCx} ${geo.leftCy} L ${geo.topCx} ${geo.topCy} L ${geo.rightCx} ${geo.rightCy}`}
        fill="none"
        stroke={theme.glow}
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.2"
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
