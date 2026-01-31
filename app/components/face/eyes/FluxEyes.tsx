/**
 * Flux Eyes - Geometric triangular shapes
 * "The Architect" - structured, precise, systematic
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function FluxEyes({
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
  const geo = EYE_GEOMETRIES.flux!;
  const theme = getAgentTheme("flux")!;
  
  // Listening state
  const eyeScale = isActive ? 1.08 : 1;
  const pupilScale = isActive ? 1.1 : 1;

  const renderTriangleEye = (
    side: "left" | "right",
    cx: number,
    cy: number,
    size: number,
    eyeRef: RefObject<SVGElement | null>,
    pupilRef?: RefObject<SVGGElement | null>
  ) => {
    // Triangle points (equilateral, pointing up)
    const h = size * Math.sqrt(3) / 2;
    const points = [
      [cx, cy - h * 0.6],           // Top
      [cx - size / 2, cy + h * 0.4], // Bottom left
      [cx + size / 2, cy + h * 0.4], // Bottom right
    ];
    const pathD = `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`;
    
    const clipId = `flux-clip-${side}`;
    const gradientId = `flux-pupil-gradient-${side}`;
    
    // Pupil movement (constrained by triangle)
    const pupilMoveX = size * 0.2;
    const pupilMoveY = size * 0.15;
    const pupilX = pupilOffset.x * pupilMoveX;
    const pupilY = pupilOffset.y * pupilMoveY;
    
    // Hexagonal pupil points
    const pupilR = geo.pupilRadius!;
    const hexPoints = Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 30) * Math.PI / 180;
      return [cx + Math.cos(angle) * pupilR, cy + Math.sin(angle) * pupilR];
    });
    const hexPath = `M ${hexPoints[0][0]} ${hexPoints[0][1]} ` + 
      hexPoints.slice(1).map(p => `L ${p[0]} ${p[1]}`).join(' ') + ' Z';
    
    return (
      <g key={side}>
        <defs>
          <clipPath id={clipId}>
            <path d={pathD} />
          </clipPath>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={theme.pupilStart} />
            <stop offset="100%" stopColor={theme.pupilEnd} />
          </linearGradient>
        </defs>
        
        {/* Outer geometric frame */}
        <path
          d={pathD}
          fill="none"
          stroke={theme.glow}
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.3"
          transform={`translate(0, -3) scale(1.15)`}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />
        
        {/* Main triangle sclera */}
        <path
          ref={eyeRef as RefObject<SVGPathElement>}
          d={pathD}
          fill={theme.eyeWhite}
          stroke={theme.accent}
          strokeWidth="2"
          strokeLinejoin="round"
          style={{
            filter: `drop-shadow(0 0 10px ${theme.glow})`,
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.15s steps(4)",
          }}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Hexagonal pupil */}
        <g
          ref={pupilRef}
          clipPath={`url(#${clipId})`}
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.1s steps(3)",
          }}
        >
          <path
            d={hexPath}
            fill={`url(#${gradientId})`}
          />
          {/* Inner hex ring */}
          <path
            d={hexPath}
            fill="none"
            stroke={theme.glow}
            strokeWidth="1"
            opacity="0.5"
            transform="scale(0.7)"
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Geometric highlight */}
          <polygon
            points={`${cx - pupilR * 0.3},${cy - pupilR * 0.3} ${cx},${cy - pupilR * 0.45} ${cx + pupilR * 0.2},${cy - pupilR * 0.25}`}
            fill="white"
            opacity="0.8"
          />
        </g>
      </g>
    );
  };

  return (
    <g className="flux-eyes">
      {/* Grid lines connecting eyes */}
      <line
        x1={geo.leftCx + geo.leftRx}
        y1={geo.leftCy}
        x2={geo.rightCx - geo.rightRx}
        y2={geo.rightCy}
        stroke={theme.glow}
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.15"
      />
      
      {renderTriangleEye("left", geo.leftCx, geo.leftCy, geo.leftRx * 2, leftRef, leftPupilRef)}
      {renderTriangleEye("right", geo.rightCx, geo.rightCy, geo.rightRx * 2, rightRef, rightPupilRef)}
    </g>
  );
}
