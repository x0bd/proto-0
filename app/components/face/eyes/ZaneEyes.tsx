/**
 * Zane Eyes - Asymmetric layout (small left, large right)
 * "The Maverick" - unconventional, playful, rebellious
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function ZaneEyes({
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
  const geo = EYE_GEOMETRIES.zane!;
  const theme = getAgentTheme("zane")!;
  
  // Listening state
  const eyeScale = isActive ? 1.08 : 1;
  const pupilScale = isActive ? 1.12 : 1;

  // Small left eye
  const renderSmallEye = () => {
    const cx = geo.leftCx;
    const cy = geo.leftCy;
    const r = geo.leftRx;
    const pupilR = geo.pupilRadius!;
    
    const pupilMoveX = r * 0.3;
    const pupilMoveY = r * 0.3;
    const pupilX = pupilOffset.x * pupilMoveX;
    const pupilY = pupilOffset.y * pupilMoveY;
    
    return (
      <g key="left">
        <defs>
          <clipPath id="zane-clip-left">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
          <radialGradient id="zane-pupil-gradient-left" cx="30%" cy="30%">
            <stop offset="0%" stopColor={theme.pupilStart} />
            <stop offset="100%" stopColor={theme.pupilEnd} />
          </radialGradient>
        </defs>
        
        {/* Small sclera */}
        <circle
          ref={leftRef as RefObject<SVGCircleElement>}
          cx={cx}
          cy={cy}
          r={r}
          fill={theme.eyeWhite}
          stroke={theme.accent}
          strokeWidth="1.5"
          style={{
            filter: `drop-shadow(0 0 8px ${theme.glow})`,
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.2s ease-out",
          }}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onWink("left");
          }}
          onMouseEnter={() => onHoverStart("left")}
          onMouseLeave={() => onHoverEnd("left")}
        />
        
        {/* Small pupil */}
        <g
          ref={leftPupilRef}
          clipPath="url(#zane-clip-left)"
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={pupilR}
            fill="url(#zane-pupil-gradient-left)"
          />
          <circle
            cx={cx - pupilR * 0.3}
            cy={cy - pupilR * 0.3}
            r={pupilR * 0.3}
            fill="white"
            opacity="0.9"
          />
        </g>
      </g>
    );
  };

  // Large right eye
  const renderLargeEye = () => {
    const cx = geo.rightCx;
    const cy = geo.rightCy;
    const rx = geo.rightRx;
    const ry = geo.rightRy;
    const pupilR = geo.pupilRadius! * 2.5; // Larger pupil for big eye
    
    const pupilMoveX = rx * 0.3;
    const pupilMoveY = ry * 0.25;
    const pupilX = pupilOffset.x * pupilMoveX;
    const pupilY = pupilOffset.y * pupilMoveY;
    
    return (
      <g key="right">
        <defs>
          <clipPath id="zane-clip-right">
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
          </clipPath>
          <radialGradient id="zane-pupil-gradient-right" cx="35%" cy="35%">
            <stop offset="0%" stopColor={theme.pupilStart} />
            <stop offset="100%" stopColor={theme.pupilEnd} />
          </radialGradient>
        </defs>
        
        {/* Large sclera */}
        <ellipse
          ref={rightRef as RefObject<SVGEllipseElement>}
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          fill={theme.eyeWhite}
          stroke={theme.accent}
          strokeWidth="2"
          style={{
            filter: `drop-shadow(0 0 15px ${theme.glow})`,
            transform: `scale(${eyeScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.2s ease-out",
          }}
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onWink("right");
          }}
          onMouseEnter={() => onHoverStart("right")}
          onMouseLeave={() => onHoverEnd("right")}
        />
        
        {/* Inner shadow */}
        <ellipse
          cx={cx}
          cy={cy + 4}
          rx={rx - 5}
          ry={ry - 5}
          fill="none"
          stroke="rgba(0,0,0,0.04)"
          strokeWidth="10"
          clipPath="url(#zane-clip-right)"
          style={{ pointerEvents: "none" }}
        />
        
        {/* Large pupil */}
        <g
          ref={rightPupilRef}
          clipPath="url(#zane-clip-right)"
          style={{
            transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={pupilR}
            fill="url(#zane-pupil-gradient-right)"
          />
          {/* Rebellious off-center inner ring */}
          <circle
            cx={cx + 3}
            cy={cy - 2}
            r={pupilR - 4}
            fill="none"
            stroke={theme.glow}
            strokeWidth="1.5"
            opacity="0.4"
          />
          {/* Primary highlight */}
          <ellipse
            cx={cx - pupilR * 0.35}
            cy={cy - pupilR * 0.35}
            rx={pupilR * 0.3}
            ry={pupilR * 0.4}
            fill="white"
            opacity="0.9"
          />
          {/* Secondary highlight */}
          <circle
            cx={cx + pupilR * 0.3}
            cy={cy + pupilR * 0.4}
            r={pupilR * 0.15}
            fill="white"
            opacity="0.5"
          />
        </g>
      </g>
    );
  };

  return (
    <g className="zane-eyes">
      {renderSmallEye()}
      {renderLargeEye()}
    </g>
  );
}
