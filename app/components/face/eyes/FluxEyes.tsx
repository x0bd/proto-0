/**
 * Flux Eyes - Geometric triangular shapes
 * "The Architect" - structured, precise, systematic
 * REFACTORED: Minimal Black & White Vibe
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
  
  // Listening state
  const eyeScale = isActive ? 1.05 : 1;
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
        </defs>
        
        {/* Outer geometric frame - Gone, keeping it clean */}
        
        {/* Main triangle sclera */}
        <path
          ref={eyeRef as RefObject<SVGPathElement>}
          d={pathD}
          fill="none"
          stroke="currentColor" 
          strokeWidth="1.5"
          strokeLinejoin="miter" 
          style={{
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.15s steps(4)", // Keep robotic movement
          }}
          className="cursor-pointer text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onWink(side);
          }}
          onMouseEnter={() => onHoverStart(side)}
          onMouseLeave={() => onHoverEnd(side)}
        />
        
        {/* Hexagonal pupil */}
        <g
          ref={pupilRef as React.LegacyRef<SVGGElement>}
          clipPath={`url(#${clipId})`}
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.1s steps(3)",
          }}
        >
          <path
            d={hexPath}
            fill="currentColor"
            className="text-foreground"
          />
          {/* Small white center in pupil for tech vibe */}
          <path
             d={hexPath}
             fill="currentColor"
             transform="scale(0.3)"
             className="text-background"
             style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        </g>
      </g>
    );
  };

  return (
    <g className="flux-eyes">
      {/* Grid lines - barely visible guide */}
      <line
        x1={geo.leftCx + geo.leftRx}
        y1={geo.leftCy}
        x2={geo.rightCx - geo.rightRx}
        y2={geo.rightCy}
        stroke="currentColor"
        strokeWidth="0.5"
        strokeDasharray="2 2"
        className="text-muted-foreground/30"
      />
      
      {renderTriangleEye("left", geo.leftCx, geo.leftCy, geo.leftRx * 2, leftRef, leftPupilRef)}
      {renderTriangleEye("right", geo.rightCx, geo.rightCy, geo.rightRx * 2, rightRef, rightPupilRef)}
    </g>
  );
}
