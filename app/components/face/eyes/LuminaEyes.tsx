/**
 * Lumina Eyes - Classic dual ellipse with pupils
 * "Creative Companion" - warm, inviting, expressive
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function LuminaEyes({
  leftRef,
  rightRef,
  leftPupilRef,
  rightPupilRef,
  onWink,
  onHoverStart,
  onHoverEnd,
  pupilOffset = { x: 0, y: 0 },
  isActive = false,
}: EyeProps) {
  const geo = EYE_GEOMETRIES.lumina!;
  const theme = getAgentTheme("lumina")!;
  
  // Pupil movement range (max pixels)
  const pupilMoveX = geo.leftRx * 0.4;
  const pupilMoveY = geo.leftRy * 0.35;
  
  const pupilX = pupilOffset.x * pupilMoveX;
  const pupilY = pupilOffset.y * pupilMoveY;
  
  // Listening state scales
  const eyeScale = isActive ? 1.08 : 1;
  const pupilScale = isActive ? 1.12 : 1;

  const renderEye = (
    side: "left" | "right",
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    eyeRef: RefObject<SVGElement | null>,
    pupilRef?: RefObject<SVGGElement | null>
  ) => {
    const clipId = `lumina-clip-${side}`;
    const gradientId = `lumina-pupil-gradient-${side}`;
    
    return (
      <g key={side}>
        {/* Definitions for this eye */}
        <defs>
          <clipPath id={clipId}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          </clipPath>
          <radialGradient id={gradientId} cx="30%" cy="30%">
            <stop offset="0%" stopColor={theme.pupilStart} />
            <stop offset="100%" stopColor={theme.pupilEnd} />
          </radialGradient>
        </defs>
        
        {/* Sclera (eye white) */}
        <ellipse
          ref={eyeRef as RefObject<SVGEllipseElement>}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={theme.eyeWhite}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth="1"
          style={{
            filter: `drop-shadow(0 0 12px ${theme.glow})`,
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
        
        {/* Inner shadow on sclera */}
        <ellipse
          cx={cx}
          cy={cy + 2}
          rx={rx - 2}
          ry={ry - 2}
          fill="none"
          stroke="rgba(0,0,0,0.03)"
          strokeWidth="4"
          clipPath={`url(#${clipId})`}
          style={{ pointerEvents: "none" }}
        />
        
        {/* Pupil group - animated via ref */}
        <g
          ref={pupilRef}
          clipPath={`url(#${clipId})`}
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* Main pupil */}
          <circle
            cx={cx}
            cy={cy}
            r={geo.pupilRadius!}
            fill={`url(#${gradientId})`}
          />
          {/* Pupil depth ring */}
          <circle
            cx={cx}
            cy={cy}
            r={geo.pupilRadius! - 2}
            fill="none"
            stroke={theme.pupilEnd}
            strokeWidth="1"
            opacity="0.3"
          >
            <animate
              attributeName="r"
              values={`${geo.pupilRadius! - 2};${geo.pupilRadius!};${geo.pupilRadius! - 2}`}
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Primary highlight */}
          <ellipse
            cx={cx - geo.pupilRadius! * 0.35}
            cy={cy - geo.pupilRadius! * 0.4}
            rx={geo.pupilRadius! * 0.35}
            ry={geo.pupilRadius! * 0.45}
            fill="white"
            opacity="0.92"
          />
          {/* Secondary highlight */}
          <circle
            cx={cx + geo.pupilRadius! * 0.4}
            cy={cy + geo.pupilRadius! * 0.5}
            r={geo.pupilRadius! * 0.18}
            fill="white"
            opacity="0.5"
          />
        </g>
      </g>
    );
  };

  return (
    <g className="lumina-eyes">
      {renderEye("left", geo.leftCx, geo.leftCy, geo.leftRx, geo.leftRy, leftRef, leftPupilRef)}
      {renderEye("right", geo.rightCx, geo.rightCy, geo.rightRx, geo.rightRy, rightRef, rightPupilRef)}
    </g>
  );
}
