/**
 * Volo Eyes - Single cyclops eye
 * "The Focus" - intense, singular, concentrated
 */

import { RefObject } from "react";
import { EyeProps, EYE_GEOMETRIES } from "./config";
import { getAgentTheme } from "../themes";

export function VoloEyes({
  leftRef,
  leftPupilRef,
  onWink,
  onHoverStart,
  onHoverEnd,
  pupilOffset = { x: 0, y: 0 },
  isActive = false,
}: EyeProps) {
  const geo = EYE_GEOMETRIES.volo!;
  const theme = getAgentTheme("volo")!;
  
  // Single eye at center
  const cx = geo.leftCx;
  const cy = geo.leftCy;
  const rx = geo.leftRx;
  const ry = geo.leftRy;
  
  // Pupil movement range
  const pupilMoveX = rx * 0.35;
  const pupilMoveY = ry * 0.3;
  
  const pupilX = pupilOffset.x * pupilMoveX;
  const pupilY = pupilOffset.y * pupilMoveY;
  
  // Listening state
  const eyeScale = isActive ? 1.06 : 1;
  const pupilScale = isActive ? 1.15 : 1;
  
  const clipId = "volo-clip";
  const gradientId = "volo-pupil-gradient";

  return (
    <g className="volo-eyes">
      <defs>
        <clipPath id={clipId}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
        <radialGradient id={gradientId} cx="35%" cy="35%">
          <stop offset="0%" stopColor={theme.pupilStart} />
          <stop offset="100%" stopColor={theme.pupilEnd} />
        </radialGradient>
        {/* Glow filter */}
        <filter id="volo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feFlood floodColor={theme.glow} floodOpacity="0.6" />
          <feComposite in2="blur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Outer glow ring */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx + 8}
        ry={ry + 8}
        fill="none"
        stroke={theme.glow}
        strokeWidth="2"
        opacity="0.3"
      >
        <animate
          attributeName="opacity"
          values="0.3;0.5;0.3"
          dur="3s"
          repeatCount="indefinite"
        />
      </ellipse>
      
      {/* Main sclera */}
      <ellipse
        ref={leftRef as RefObject<SVGEllipseElement>}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={theme.eyeWhite}
        stroke={theme.accent}
        strokeWidth="2"
        filter="url(#volo-glow)"
        style={{
          transform: `scale(${eyeScale})`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: "transform 0.15s ease-out",
        }}
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onWink("left");
        }}
        onMouseEnter={() => onHoverStart("left")}
        onMouseLeave={() => onHoverEnd("left")}
      />
      
      {/* Inner shadow */}
      <ellipse
        cx={cx}
        cy={cy + 4}
        rx={rx - 4}
        ry={ry - 4}
        fill="none"
        stroke="rgba(0,0,0,0.05)"
        strokeWidth="8"
        clipPath={`url(#${clipId})`}
        style={{ pointerEvents: "none" }}
      />
      
      {/* Pupil group */}
      <g
        ref={leftPupilRef}
        clipPath={`url(#${clipId})`}
        style={{
          transform: `translate(${pupilX}px, ${pupilY}px) scale(${pupilScale})`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: "transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Main pupil */}
        <circle
          cx={cx}
          cy={cy}
          r={geo.pupilRadius!}
          fill={`url(#${gradientId})`}
        />
        {/* Iris ring */}
        <circle
          cx={cx}
          cy={cy}
          r={geo.pupilRadius! + 4}
          fill="none"
          stroke={theme.accent}
          strokeWidth="2"
          opacity="0.4"
        />
        {/* Pulsing inner ring */}
        <circle
          cx={cx}
          cy={cy}
          r={geo.pupilRadius! - 4}
          fill="none"
          stroke={theme.glow}
          strokeWidth="1"
          opacity="0.5"
        >
          <animate
            attributeName="r"
            values={`${geo.pupilRadius! - 4};${geo.pupilRadius! - 2};${geo.pupilRadius! - 4}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Primary highlight */}
        <ellipse
          cx={cx - geo.pupilRadius! * 0.45}
          cy={cy - geo.pupilRadius! * 0.4}
          rx={geo.pupilRadius! * 0.4}
          ry={geo.pupilRadius! * 0.5}
          fill="white"
          opacity="0.9"
        />
        {/* Secondary highlight */}
        <circle
          cx={cx + geo.pupilRadius! * 0.35}
          cy={cy + geo.pupilRadius! * 0.45}
          r={geo.pupilRadius! * 0.2}
          fill="white"
          opacity="0.5"
        />
      </g>
    </g>
  );
}
