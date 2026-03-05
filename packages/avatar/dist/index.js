import { forwardRef, useCallback, useRef, useImperativeHandle, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';

// src/Avatar.tsx
function Eyes({
  leftRef,
  rightRef,
  variant,
  onWink,
  onHoverStart,
  onHoverEnd,
  eyeClass = ""
}) {
  if (variant === "tron") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "rect",
        {
          ref: leftRef,
          x: "106",
          y: "69",
          width: "64",
          height: "36",
          rx: "4",
          ry: "4",
          fill: "currentColor",
          className: eyeClass,
          onClick: (e) => {
            e.stopPropagation();
            onWink("left");
          },
          onMouseEnter: () => onHoverStart("left"),
          onMouseLeave: () => onHoverEnd("left")
        }
      ),
      /* @__PURE__ */ jsx(
        "rect",
        {
          ref: rightRef,
          x: "350",
          y: "69",
          width: "64",
          height: "36",
          rx: "4",
          ry: "4",
          fill: "currentColor",
          className: eyeClass,
          onClick: (e) => {
            e.stopPropagation();
            onWink("right");
          },
          onMouseEnter: () => onHoverStart("right"),
          onMouseLeave: () => onHoverEnd("right")
        }
      )
    ] });
  }
  if (variant === "analogue") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "ellipse",
        {
          ref: leftRef,
          cx: "170",
          cy: "105",
          rx: "32",
          ry: "18",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "3",
          filter: "url(#pencil)",
          className: eyeClass,
          onClick: (e) => {
            e.stopPropagation();
            onWink("left");
          },
          onMouseEnter: () => onHoverStart("left"),
          onMouseLeave: () => onHoverEnd("left")
        }
      ),
      /* @__PURE__ */ jsx(
        "ellipse",
        {
          ref: rightRef,
          cx: "350",
          cy: "105",
          rx: "32",
          ry: "18",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "3",
          filter: "url(#pencil)",
          className: eyeClass,
          onClick: (e) => {
            e.stopPropagation();
            onWink("right");
          },
          onMouseEnter: () => onHoverStart("right"),
          onMouseLeave: () => onHoverEnd("right")
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "ellipse",
      {
        ref: leftRef,
        cx: "170",
        cy: "105",
        rx: "32",
        ry: "18",
        fill: "currentColor",
        className: eyeClass,
        onClick: (e) => {
          e.stopPropagation();
          onWink("left");
        },
        onMouseEnter: () => onHoverStart("left"),
        onMouseLeave: () => onHoverEnd("left")
      }
    ),
    /* @__PURE__ */ jsx(
      "ellipse",
      {
        ref: rightRef,
        cx: "350",
        cy: "105",
        rx: "32",
        ry: "18",
        fill: "currentColor",
        className: eyeClass,
        onClick: (e) => {
          e.stopPropagation();
          onWink("right");
        },
        onMouseEnter: () => onHoverStart("right"),
        onMouseLeave: () => onHoverEnd("right")
      }
    )
  ] });
}

// src/face/themes.ts
var VARIANT_COLORS = {
  minimal: "#FF6B6B",
  tron: "#06B6D4",
  analogue: "#FBBF24"
};
var VARIANT_GLOW = {
  minimal: "rgba(255, 107, 107, 0.6)",
  tron: "rgba(6, 182, 212, 0.7)",
  analogue: "rgba(251, 191, 36, 0.6)"
};
function applyAgentTheme(variant, accentColor, target) {
  if (typeof document === "undefined") return;
  const root = target ?? document.documentElement;
  const color = accentColor ?? VARIANT_COLORS[variant];
  const glow = accentColor ? `${accentColor}99` : VARIANT_GLOW[variant];
  root.style.setProperty("--face-color", color);
  root.style.setProperty("--face-glow", glow);
  root.style.setProperty(
    "--face-bg-tint",
    variant === "tron" ? "rgba(0, 200, 255, 0.03)" : variant === "analogue" ? "rgba(251, 191, 36, 0.04)" : "rgba(255, 107, 107, 0.04)"
  );
}
function getMouthStyle(variant) {
  switch (variant) {
    case "tron":
      return { strokeLinecap: "square", shapeRendering: "crispEdges" };
    case "analogue":
      return { strokeLinecap: "round", shapeRendering: "geometricPrecision" };
    default:
      return { strokeLinecap: "round", shapeRendering: "auto" };
  }
}
function Mouth({
  mouthRef,
  groupRef,
  spectrumGroupRef,
  spectrumBarsRef,
  onClick,
  onHoverStart,
  onHoverEnd,
  variant = "minimal"
}) {
  const style = getMouthStyle(variant);
  return /* @__PURE__ */ jsxs("g", { ref: groupRef, transform: "translate(260,175)", children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        ref: mouthRef,
        d: "M -33 0 Q 0 0 33 0",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: variant === "tron" ? "4" : variant === "analogue" ? "3" : "4",
        strokeLinecap: style.strokeLinecap,
        shapeRendering: style.shapeRendering,
        filter: variant === "analogue" ? "url(#pencil)" : void 0,
        style: { cursor: "pointer" },
        onClick: (e) => {
          e.stopPropagation();
          onClick();
        },
        onMouseEnter: onHoverStart,
        onMouseLeave: onHoverEnd
      }
    ),
    /* @__PURE__ */ jsx("g", { ref: spectrumGroupRef, opacity: "0", children: Array.from({ length: 9 }).map((_, i) => /* @__PURE__ */ jsx(
      "rect",
      {
        ref: (el) => {
          if (el) spectrumBarsRef.current[i] = el;
        },
        x: -88 + i * 22,
        y: -18,
        width: "8",
        height: "30",
        rx: variant === "tron" ? "0" : "4",
        fill: "currentColor",
        style: { transformOrigin: "center bottom" }
      },
      i
    )) })
  ] });
}

// src/face/Ears.tsx
function Ears() {
  return null;
}

// src/face/eyes/config.ts
var EYE_GEOMETRIES = {};
var DEFAULT_EMOTION = {
  joy: 0.3,
  sadness: 0,
  surprise: 0.1,
  anger: 0,
  curiosity: 0.2
};
var Avatar = forwardRef(function Avatar2({
  emotion = DEFAULT_EMOTION,
  className = "",
  speaking = false,
  voiceLevel = 0,
  audioLevels,
  variant = "minimal",
  color,
  // backward-compat alias
  accentColor,
  size = 260,
  interactive = true,
  onEyeClick,
  onMouthClick,
  onLongPress,
  onStateChange,
  interactions
}, ref) {
  const displayColor = color ?? accentColor ?? VARIANT_COLORS[variant];
  const generateMouthPath = useCallback(
    (width, curve) => {
      const half = width / 2;
      switch (variant) {
        case "tron": {
          const y = curve / 2;
          return `M ${-half} 0 L ${-half / 2} 0 L ${-half / 2} ${y} L ${half / 2} ${y} L ${half / 2} 0 L ${half} 0`;
        }
        default:
          return `M ${-half} 0 Q 0 ${curve} ${half} 0`;
      }
    },
    [variant]
  );
  const containerRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const topEyeRef = useRef(null);
  const mouthRef = useRef(null);
  const mouthGroupRef = useRef(null);
  const svgBoxRef = useRef(null);
  const spectrumGroupRef = useRef(null);
  const spectrumBarsRef = useRef([]);
  const breathingTL = useRef();
  const turbulenceRef = useRef(null);
  const boilTickerRef = useRef(null);
  const longPressTimerRef = useRef(
    null
  );
  const isLongPressActiveRef = useRef(false);
  const deepEmotionTweenRef = useRef(null);
  const blinkTimerRef = useRef(null);
  const glanceTimerRef = useRef(null);
  const idleMouthTweenRef = useRef(null);
  const latestEyeTargetsRef = useRef({ rx: 32, ry: 18, cy: 105, tilt: 0 });
  const latestMouthRef = useRef({ width: 65, curve: 0, tilt: 0 });
  function triggerHaptic(pattern) {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
  function startBreathing() {
    breathingTL.current?.kill();
    breathingTL.current = gsap.timeline({ repeat: -1 });
    if (variant === "tron") {
      breathingTL.current.to(containerRef.current, {
        filter: "brightness(1.03) contrast(1.01)",
        duration: 1.8,
        yoyo: true,
        repeat: -1,
        ease: "steps(4)"
      });
    } else if (variant === "analogue") {
      if (turbulenceRef.current) {
        const ticker = (time) => {
          if (!turbulenceRef.current) return;
          const freq = 0.015 + Math.sin(time * 0.5) * 5e-3;
          turbulenceRef.current.setAttribute(
            "baseFrequency",
            `${freq} ${freq * 1.5}`
          );
        };
        boilTickerRef.current = ticker;
        gsap.ticker.add(ticker);
      }
      breathingTL.current.to(containerRef.current, {
        scale: 1.012,
        rotation: 0.3,
        duration: 3.2,
        ease: "sine.inOut"
      }).to(containerRef.current, {
        scale: 1,
        rotation: 0,
        duration: 3.5,
        ease: "sine.inOut"
      });
    } else {
      breathingTL.current.to(containerRef.current, {
        scale: 1.015,
        duration: 2.4,
        ease: "sine.inOut"
      }).to(containerRef.current, {
        scale: 1,
        duration: 2.8,
        ease: "sine.inOut"
      });
    }
  }
  function animateEye(target, params, duration, ease = "power2.out", delay = 0, cxOrigin) {
    if (!target) return;
    const { rx, ry, cy, tilt = 0, scale = 1, xOffset = 0 } = params;
    let finalEase = ease;
    if (variant === "tron" && ease.startsWith("power"))
      finalEase = "steps(5)";
    else if (variant === "analogue" && ease.startsWith("power"))
      finalEase = "steps(12)";
    const tag = target.tagName.toLowerCase();
    if (tag === "rect") {
      gsap.to(target, {
        attr: {
          width: rx * 2,
          height: ry * 2,
          x: cxOrigin - rx + xOffset,
          y: cy - ry,
          rx: 4,
          ry: 4
        },
        rotation: tilt,
        scale,
        duration,
        ease: finalEase,
        delay,
        transformOrigin: "center center"
      });
    } else if (tag === "path") {
      const geom = EYE_GEOMETRIES[variant] ?? EYE_GEOMETRIES["minimal"];
      const baseCy = geom?.leftCy ?? 105;
      gsap.to(target, {
        y: cy - baseCy,
        x: xOffset,
        rotation: tilt,
        scale,
        duration,
        ease: finalEase,
        delay,
        transformOrigin: "center center"
      });
    } else if (tag === "circle") {
      const r = (rx + ry) / 2;
      gsap.to(target, {
        attr: { r, cy, cx: cxOrigin + xOffset },
        rotation: tilt,
        scale,
        duration,
        ease: finalEase,
        delay,
        transformOrigin: "center center"
      });
    } else {
      gsap.to(target, {
        attr: { rx, ry, cy, cx: cxOrigin + xOffset },
        rotation: tilt,
        scale,
        duration,
        ease: finalEase,
        delay,
        transformOrigin: "center center"
      });
    }
  }
  function animateEmotion(state) {
    const { joy, sadness, surprise, anger, curiosity } = state;
    const alertness = surprise + curiosity * 0.7 + joy * 0.3;
    const intensity = Math.max(joy, sadness, surprise, anger, curiosity);
    const baseEyeWidth = 32;
    const baseEyeHeight = 18;
    const eyeWidth = baseEyeWidth + surprise * 15 - anger * 12 - sadness * 8 + Math.sin(intensity * Math.PI) * 3;
    const eyeHeight = baseEyeHeight + surprise * 12 - (sadness * 14 + anger * 10) + joy * Math.sin(joy * Math.PI) * 4;
    const eyeTilt = curiosity * 14 - anger * 12 + joy * 3 * Math.sin(joy * Math.PI * 2);
    const eyeY = sadness * 12 - surprise * 6 + anger * 4 + Math.cos(intensity * Math.PI) * 2;
    const mouthCurve = 35 * Math.sin(joy * Math.PI * 0.8) - 45 * Math.pow(sadness, 1.2) - 25 * Math.pow(anger, 0.8);
    const mouthTilt = curiosity * 10 - anger * 8 + Math.sin(curiosity * Math.PI) * 4;
    const mouthWidth = 65 + surprise * 25 - sadness * 20 - anger * 15 + alertness * 8;
    const stagger = 0.08;
    animateEye(
      leftEyeRef.current,
      {
        rx: Math.max(4, eyeWidth),
        ry: Math.max(2, eyeHeight),
        cy: 105 + eyeY,
        tilt: -eyeTilt
      },
      0.75,
      "power2.out",
      0,
      200
    );
    animateEye(
      rightEyeRef.current,
      {
        rx: Math.max(4, eyeWidth),
        ry: Math.max(2, eyeHeight),
        cy: 105 + eyeY,
        tilt: eyeTilt
      },
      0.75,
      "power2.out",
      stagger,
      320
    );
    latestEyeTargetsRef.current = {
      rx: Math.max(4, eyeWidth),
      ry: Math.max(2, eyeHeight),
      cy: 105 + eyeY,
      tilt: eyeTilt
    };
    if (mouthRef.current) {
      gsap.to(mouthRef.current, {
        attr: { d: generateMouthPath(mouthWidth, mouthCurve) },
        duration: 0.8,
        ease: "power2.out",
        delay: stagger * 2
      });
    }
    if (mouthGroupRef.current) {
      gsap.to(mouthGroupRef.current, {
        rotation: mouthTilt,
        duration: 0.8,
        ease: "power2.out",
        svgOrigin: "260 175",
        delay: stagger * 2
      });
    }
    latestMouthRef.current = {
      width: mouthWidth,
      curve: mouthCurve,
      tilt: mouthTilt
    };
  }
  function performBlink() {
    const target = latestEyeTargetsRef.current;
    const blinkDur = variant === "tron" ? 0.05 : 0.08;
    const ryClosed = variant === "tron" ? 0.5 : 2;
    [leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
      const cx = i === 0 ? 200 : 320;
      animateEye(
        eye,
        {
          rx: target.rx,
          ry: ryClosed,
          cy: target.cy,
          tilt: i === 0 ? -target.tilt : target.tilt
        },
        blinkDur,
        variant === "tron" ? "steps(2)" : "power1.in",
        0,
        cx
      );
    });
    const reopenDelay = blinkDur + (variant === "tron" ? 0.05 : 0);
    [leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
      const cx = i === 0 ? 200 : 320;
      animateEye(
        eye,
        {
          rx: target.rx,
          ry: target.ry,
          cy: target.cy,
          tilt: i === 0 ? -target.tilt : target.tilt
        },
        0.12,
        variant === "tron" ? "steps(3)" : "power2.out",
        reopenDelay,
        cx
      );
    });
  }
  function performGlance() {
    const deltaTilt = gsap.utils.random(-2, 2);
    const deltaY = gsap.utils.random(-1.5, 1.5);
    [leftEyeRef, rightEyeRef].forEach(({ current }, i) => {
      if (!current) return;
      const rotationDelta = i === 0 ? deltaTilt : -deltaTilt;
      if (variant === "tron") {
        gsap.to(current, {
          rotation: `+=${rotationDelta}`,
          attr: { y: `+=${deltaY}` },
          duration: 0.1,
          yoyo: true,
          repeat: 1,
          ease: "steps(3)"
        });
      } else {
        gsap.to(current, {
          rotation: `+=${rotationDelta}`,
          attr: { cy: `+=${deltaY}` },
          duration: 0.35,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut"
        });
      }
    });
  }
  function startIdleMouthWave() {
    const state = { offset: 0 };
    idleMouthTweenRef.current = gsap.to(state, {
      offset: 4,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      onUpdate: () => {
        const m = latestMouthRef.current;
        const d = generateMouthPath(m.width, m.curve + state.offset);
        if (mouthRef.current)
          gsap.set(mouthRef.current, { attr: { d } });
      }
    });
  }
  function performWink(eye) {
    triggerHaptic(10);
    if (eye === "top") {
      if (topEyeRef.current) {
        const target2 = latestEyeTargetsRef.current;
        animateEye(
          topEyeRef.current,
          { ...target2, scale: 0.1 },
          0.1,
          "power2.in",
          0,
          260
        );
        animateEye(
          topEyeRef.current,
          { ...target2, scale: 1 },
          0.15,
          "back.out(2)",
          0.1,
          260
        );
      }
      return;
    }
    onEyeClick?.(eye);
    const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
    const target = latestEyeTargetsRef.current;
    const cx = eye === "left" ? 200 : 320;
    animateEye(
      eyeRef.current,
      {
        rx: target.rx,
        ry: 2,
        cy: target.cy,
        tilt: eye === "left" ? -target.tilt : target.tilt,
        scale: 0.7
      },
      0.1,
      variant === "tron" ? "steps(2)" : "power2.in",
      0,
      cx
    );
    animateEye(
      eyeRef.current,
      {
        rx: target.rx,
        ry: target.ry,
        cy: target.cy,
        tilt: eye === "left" ? -target.tilt : target.tilt,
        scale: 1
      },
      0.15,
      variant === "tron" ? "steps(3)" : "back.out(2)",
      0.1,
      cx
    );
  }
  function performSurprise() {
    triggerHaptic([40, 50, 20]);
    const target = latestEyeTargetsRef.current;
    [leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
      const cx = i === 0 ? 200 : 320;
      if (!eye) return;
      animateEye(
        eye,
        {
          rx: target.rx + 15,
          ry: target.ry + 10,
          cy: target.cy,
          scale: 1.1
        },
        0.2,
        "back.out(2)",
        0,
        cx
      );
      animateEye(
        eye,
        { rx: target.rx, ry: target.ry, cy: target.cy, scale: 1 },
        0.3,
        "elastic.out(1, 0.5)",
        0.2,
        cx
      );
    });
    if (mouthRef.current && mouthGroupRef.current) {
      const m = latestMouthRef.current;
      gsap.timeline().to(
        mouthRef.current,
        {
          attr: { d: generateMouthPath(m.width + 20, 15) },
          duration: 0.2,
          ease: "back.out(2)"
        },
        0
      ).to(
        mouthRef.current,
        {
          attr: { d: generateMouthPath(m.width, m.curve) },
          duration: 0.4,
          ease: "power2.out"
        },
        0.5
      );
      gsap.to(mouthGroupRef.current, {
        y: -5,
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }
  }
  function performBoop() {
    triggerHaptic(15);
    if (containerRef.current) {
      gsap.timeline().to(containerRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.in"
      }).to(containerRef.current, {
        scale: 1.05,
        duration: 0.15,
        ease: "back.out(3)"
      }).to(containerRef.current, {
        scale: 1,
        duration: 0.2,
        ease: "elastic.out(1, 0.4)"
      });
    }
  }
  function performDeepEmotion() {
    isLongPressActiveRef.current = true;
    triggerHaptic(50);
    onLongPress?.();
    if (containerRef.current) {
      deepEmotionTweenRef.current = gsap.to(containerRef.current, {
        x: "+=2",
        y: "-=2",
        yoyo: true,
        repeat: -1,
        duration: 0.05,
        ease: "none"
      });
    }
    const target = latestEyeTargetsRef.current;
    [leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
      const cx = i === 0 ? 200 : 320;
      animateEye(
        eye,
        { rx: target.rx + 8, ry: target.ry + 8, cy: 105, scale: 1.15 },
        0.4,
        "back.out(1.5)",
        0,
        cx
      );
    });
  }
  function stopDeepEmotion() {
    deepEmotionTweenRef.current?.kill();
    deepEmotionTweenRef.current = null;
    isLongPressActiveRef.current = false;
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: 0,
        y: 0,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    const target = latestEyeTargetsRef.current;
    [leftEyeRef.current, rightEyeRef.current].forEach((eye, i) => {
      const cx = i === 0 ? 200 : 320;
      animateEye(
        eye,
        { rx: target.rx, ry: target.ry, cy: target.cy, scale: 1 },
        0.3,
        "power2.out",
        0,
        cx
      );
    });
  }
  function handleEyeHover(eye) {
    if (eye === "top") {
      if (topEyeRef.current)
        animateEye(
          topEyeRef.current,
          { ...latestEyeTargetsRef.current, scale: 1.1 },
          0.2,
          "back.out(1.5)",
          0,
          260
        );
      return;
    }
    const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
    const cx = eye === "left" ? 200 : 320;
    const target = latestEyeTargetsRef.current;
    animateEye(
      eyeRef.current,
      {
        rx: Math.max(4, target.rx + 3),
        ry: Math.max(3, target.ry + 6),
        cy: target.cy,
        scale: 1.05,
        tilt: eye === "left" ? -target.tilt : target.tilt
      },
      0.2,
      "back.out(1.5)",
      0,
      cx
    );
  }
  function handleEyeHoverEnd(eye) {
    if (eye === "top") {
      if (topEyeRef.current)
        animateEye(
          topEyeRef.current,
          { ...latestEyeTargetsRef.current, scale: 1 },
          0.25,
          "power2.out",
          0,
          260
        );
      return;
    }
    const eyeRef = eye === "left" ? leftEyeRef : rightEyeRef;
    const cx = eye === "left" ? 200 : 320;
    const target = latestEyeTargetsRef.current;
    animateEye(
      eyeRef.current,
      {
        rx: target.rx,
        ry: target.ry,
        cy: target.cy,
        scale: 1,
        tilt: eye === "left" ? -target.tilt : target.tilt
      },
      0.25,
      "power2.out",
      0,
      cx
    );
  }
  function handleMouthHover() {
    if (mouthGroupRef.current)
      gsap.to(mouthGroupRef.current, {
        scale: 1.05,
        rotation: `+=${gsap.utils.random(-2, 2)}`,
        duration: 0.2,
        ease: "back.out(1.5)"
      });
  }
  function handleMouthHoverEnd() {
    if (mouthGroupRef.current)
      gsap.to(mouthGroupRef.current, {
        scale: 1,
        rotation: latestMouthRef.current.tilt,
        duration: 0.3,
        ease: "power2.out"
      });
  }
  function handlePointerDown() {
    if (!interactive) return;
    longPressTimerRef.current = setTimeout(() => performDeepEmotion(), 500);
  }
  function handlePointerUp() {
    if (!interactive) return;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressActiveRef.current) {
      stopDeepEmotion();
    } else {
      performBoop();
    }
  }
  function handlePointerCancel() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressActiveRef.current) stopDeepEmotion();
  }
  function handlePointerMove(e) {
    if (!interactive || !containerRef.current) return;
    if (!svgBoxRef.current) {
      const el = containerRef.current.querySelector("svg");
      svgBoxRef.current = el ?? null;
    }
    const svgEl = svgBoxRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const faceCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height * (140 / 280)
    };
    const clientX = "clientX" in e ? e.clientX : e.touches[0]?.clientX ?? 0;
    const clientY = "clientY" in e ? e.clientY : e.touches[0]?.clientY ?? 0;
    const mx = clientX - faceCenter.x;
    const my = clientY - faceCenter.y;
    const nx = Math.max(-1, Math.min(1, mx / (rect.width * 0.3)));
    const ny = Math.max(-1, Math.min(1, my / (rect.height * 0.3)));
    const r = Math.hypot(nx, ny);
    const target = latestEyeTargetsRef.current;
    const eyeTiltDelta = nx * 12;
    const eyeYDelta = ny * 8;
    const eyeScale = 1 + Math.abs(nx) * 0.05;
    if (!isLongPressActiveRef.current) {
      animateEye(
        leftEyeRef.current,
        {
          rx: target.rx,
          ry: target.ry,
          cy: target.cy + eyeYDelta,
          tilt: -target.tilt - eyeTiltDelta,
          scale: eyeScale
        },
        0.4,
        "power3.out",
        0,
        200
      );
      animateEye(
        rightEyeRef.current,
        {
          rx: target.rx,
          ry: target.ry,
          cy: target.cy + eyeYDelta,
          tilt: target.tilt + eyeTiltDelta,
          scale: eyeScale
        },
        0.4,
        "power3.out",
        0,
        320
      );
    }
    if (mouthGroupRef.current) {
      gsap.to(mouthGroupRef.current, {
        rotation: latestMouthRef.current.tilt + nx * 10,
        duration: 0.45,
        ease: "power3.out"
      });
    }
    if (!isLongPressActiveRef.current) {
      const repulsionThreshold = 0.4;
      let repX = 0, repY = 0;
      if (r < repulsionThreshold && r > 0) {
        const force = (1 - r / repulsionThreshold) * 25;
        repX = -nx * force;
        repY = -ny * force;
      }
      gsap.to(containerRef.current, {
        x: nx * 8 + repX,
        y: ny * 6 + repY,
        rotation: nx * 2,
        duration: 0.5,
        ease: "power3.out"
      });
    }
  }
  function handlePointerLeave() {
    handlePointerCancel();
    const t = latestEyeTargetsRef.current;
    animateEye(
      leftEyeRef.current,
      { rx: t.rx, ry: t.ry, cy: t.cy, tilt: -t.tilt, scale: 1 },
      0.6,
      "power3.out",
      0,
      200
    );
    animateEye(
      rightEyeRef.current,
      { rx: t.rx, ry: t.ry, cy: t.cy, tilt: t.tilt, scale: 1 },
      0.6,
      "power3.out",
      0,
      320
    );
    if (mouthGroupRef.current)
      gsap.to(mouthGroupRef.current, {
        rotation: latestMouthRef.current.tilt,
        duration: 0.6,
        ease: "power3.out"
      });
    if (containerRef.current)
      gsap.to(containerRef.current, {
        x: 0,
        y: 0,
        rotation: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.5)"
      });
  }
  useImperativeHandle(
    ref,
    () => ({
      setEmotion: (state) => animateEmotion(state),
      wink: (eye) => performWink(eye),
      surprise: () => performSurprise(),
      boop: () => performBoop(),
      feedAudio: (levels) => {
        if (!mouthRef.current) return;
        const base = latestMouthRef.current;
        const { bass, lowMid, mid } = levels;
        const targetCurve = base.curve + lowMid * 55 + bass * 15;
        const targetWidth = base.width + mid * 12 - lowMid * 8;
        gsap.to(mouthRef.current, {
          attr: { d: generateMouthPath(targetWidth, targetCurve) },
          duration: 0.04,
          ease: "none",
          overwrite: "auto"
        });
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [generateMouthPath]
  );
  useEffect(() => {
    applyAgentTheme(variant, displayColor);
  }, [variant, displayColor]);
  useEffect(() => {
    animateEmotion(emotion);
  }, [emotion]);
  useEffect(() => {
    startBreathing();
    startIdleMouthWave();
    const scheduleBlink = () => {
      const delay = gsap.utils.random(2.5, 6);
      blinkTimerRef.current = gsap.delayedCall(delay, () => {
        performBlink();
        scheduleBlink();
      });
    };
    scheduleBlink();
    const scheduleGlance = () => {
      const delay = gsap.utils.random(4, 12);
      glanceTimerRef.current = gsap.delayedCall(delay, () => {
        performGlance();
        scheduleGlance();
      });
    };
    scheduleGlance();
    return () => {
      breathingTL.current?.kill();
      blinkTimerRef.current?.kill();
      glanceTimerRef.current?.kill();
      idleMouthTweenRef.current?.kill();
      if (boilTickerRef.current)
        gsap.ticker.remove(boilTickerRef.current);
    };
  }, [variant]);
  useEffect(() => {
    if (!mouthRef.current) return;
    const hasAudioLevels = audioLevels && audioLevels.overall > 0.01;
    const hasVoiceLevel = speaking && voiceLevel > 0.01;
    if (!hasAudioLevels && !hasVoiceLevel) return;
    const base = latestMouthRef.current;
    let targetCurve = base.curve;
    let targetWidth = base.width;
    let mouthJitter = 0;
    if (hasAudioLevels && audioLevels) {
      const { bass, lowMid, mid, highMid } = audioLevels;
      targetCurve += lowMid * 55 + bass * 15;
      targetWidth += mid * 12 - lowMid * 8;
      mouthJitter = (highMid - 0.3) * 3;
    } else {
      targetCurve += voiceLevel * 60;
    }
    gsap.to(mouthRef.current, {
      attr: { d: generateMouthPath(targetWidth, targetCurve) },
      duration: 0.04,
      ease: "none",
      overwrite: "auto"
    });
    if (mouthGroupRef.current && hasAudioLevels && Math.abs(mouthJitter) > 0.1) {
      gsap.to(mouthGroupRef.current, {
        rotation: base.tilt + mouthJitter,
        duration: 0.06,
        ease: "none",
        overwrite: "auto"
      });
    }
  }, [voiceLevel, speaking, audioLevels, generateMouthPath]);
  useEffect(() => {
    if (!audioLevels || audioLevels.overall < 0.05) return;
    if (!leftEyeRef.current || !rightEyeRef.current) return;
    const { bass, highMid, presence } = audioLevels;
    const target = latestEyeTargetsRef.current;
    const scalePulse = 1 + (bass - 0.3) * 0.03;
    const yPulse = highMid * 1.5;
    [
      { ref: leftEyeRef, cx: 200 },
      { ref: rightEyeRef, cx: 320 }
    ].forEach(({ ref: ref2, cx }) => {
      animateEye(
        ref2.current,
        {
          rx: target.rx,
          ry: target.ry,
          cy: target.cy - yPulse,
          scale: scalePulse
        },
        0.05,
        "none",
        0,
        cx
      );
    });
    if (presence > 0.6 && Math.random() < 0.02) performGlance();
  }, [audioLevels]);
  useEffect(() => {
    if (!audioLevels || !containerRef.current) return;
    if (audioLevels.overall < 0.1) return;
    gsap.to(containerRef.current, {
      scale: 1 + audioLevels.bass * 8e-3,
      duration: 0.08,
      ease: "none",
      overwrite: "auto"
    });
  }, [audioLevels]);
  useEffect(() => {
    if (!interactions?.length) return;
    const latest = interactions[interactions.length - 1];
    if (latest.emotion) {
      animateEmotion({ ...DEFAULT_EMOTION, ...latest.emotion });
    }
  }, [interactions]);
  useEffect(() => {
    onStateChange?.({
      emotion,
      isSpeaking: !!(speaking || audioLevels && audioLevels.overall > 0.05),
      variant
    });
  }, [emotion, speaking, audioLevels, variant, onStateChange]);
  const aspectRatio = 520 / 280;
  const svgWidth = size * aspectRatio;
  const eyeClass = `transition-colors duration-300`;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: containerRef,
      className,
      style: {
        display: "inline-block",
        width: svgWidth,
        height: size,
        color: displayColor,
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
        WebkitUserSelect: "none"
      },
      onMouseMove: handlePointerMove,
      onTouchMove: handlePointerMove,
      onMouseLeave: handlePointerLeave,
      onMouseDown: handlePointerDown,
      onTouchStart: handlePointerDown,
      onMouseUp: handlePointerUp,
      onTouchEnd: handlePointerUp,
      children: /* @__PURE__ */ jsxs(
        "svg",
        {
          viewBox: "80 26 360 250",
          width: svgWidth,
          height: size,
          xmlns: "http://www.w3.org/2000/svg",
          style: { overflow: "visible" },
          children: [
            /* @__PURE__ */ jsxs("defs", { children: [
              /* @__PURE__ */ jsxs(
                "filter",
                {
                  id: "pencil",
                  x: "-20%",
                  y: "-20%",
                  width: "140%",
                  height: "140%",
                  children: [
                    /* @__PURE__ */ jsx(
                      "feTurbulence",
                      {
                        ref: turbulenceRef,
                        type: "turbulence",
                        baseFrequency: "0.015 0.025",
                        numOctaves: "4",
                        seed: "2",
                        result: "noise"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "feDisplacementMap",
                      {
                        in: "SourceGraphic",
                        in2: "noise",
                        scale: "2.5",
                        xChannelSelector: "R",
                        yChannelSelector: "G"
                      }
                    )
                  ]
                }
              ),
              variant === "tron" && /* @__PURE__ */ jsx(
                "pattern",
                {
                  id: "scanlines",
                  x: "0",
                  y: "0",
                  width: "1",
                  height: "3",
                  patternUnits: "userSpaceOnUse",
                  children: /* @__PURE__ */ jsx(
                    "rect",
                    {
                      width: "1",
                      height: "1",
                      fill: "rgba(0,0,0,0.08)"
                    }
                  )
                }
              )
            ] }),
            variant === "tron" ? /* @__PURE__ */ jsx(
              "rect",
              {
                x: "100",
                y: "30",
                width: "320",
                height: "240",
                rx: "12",
                ry: "12",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "3",
                opacity: "0.25"
              }
            ) : variant === "analogue" ? /* @__PURE__ */ jsx(
              "ellipse",
              {
                cx: "260",
                cy: "150",
                rx: "170",
                ry: "135",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                opacity: "0.15",
                filter: "url(#pencil)"
              }
            ) : /* @__PURE__ */ jsx(
              "ellipse",
              {
                cx: "260",
                cy: "150",
                rx: "172",
                ry: "138",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2",
                opacity: "0.12"
              }
            ),
            /* @__PURE__ */ jsx(Ears, {}),
            /* @__PURE__ */ jsx(
              Eyes,
              {
                leftRef: leftEyeRef,
                rightRef: rightEyeRef,
                variant,
                onWink: (eye) => {
                  performWink(eye);
                  onEyeClick?.(eye);
                },
                onHoverStart: handleEyeHover,
                onHoverEnd: handleEyeHoverEnd,
                eyeClass
              }
            ),
            /* @__PURE__ */ jsx(
              "circle",
              {
                cx: "260",
                cy: "148",
                r: variant === "tron" ? 2 : 3,
                fill: "currentColor",
                opacity: "0.4",
                shapeRendering: variant === "tron" ? "crispEdges" : "auto"
              }
            ),
            /* @__PURE__ */ jsx(
              Mouth,
              {
                mouthRef,
                groupRef: mouthGroupRef,
                spectrumGroupRef,
                spectrumBarsRef,
                variant,
                onClick: () => {
                  onMouthClick?.();
                  handleMouthHover();
                },
                onHoverStart: handleMouthHover,
                onHoverEnd: handleMouthHoverEnd
              }
            ),
            variant === "tron" && /* @__PURE__ */ jsx(
              "rect",
              {
                x: "80",
                y: "26",
                width: "360",
                height: "250",
                fill: "url(#scanlines)",
                pointerEvents: "none",
                opacity: "0.5"
              }
            )
          ]
        }
      )
    }
  );
});
Avatar.displayName = "Avatar";
var DEFAULT_OPTIONS = {
  fftSize: 256,
  smoothingTimeConstant: 0.6,
  autoStart: true
};
var ZERO_LEVELS = {
  bass: 0,
  lowMid: 0,
  mid: 0,
  highMid: 0,
  presence: 0,
  overall: 0,
  frequencyData: null
};
function useAudioAnalysis(options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const frequencyDataRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [levels, setLevels] = useState(ZERO_LEVELS);
  const [error, setError] = useState(null);
  const initializeContext = useCallback(() => {
    if (audioContextRef.current) return audioContextRef.current;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = opts.fftSize;
      analyser.smoothingTimeConstant = opts.smoothingTimeConstant;
      analyserRef.current = analyser;
      frequencyDataRef.current = new Uint8Array(
        analyser.frequencyBinCount
      );
      return ctx;
    } catch {
      setError("Web Audio API not supported");
      return null;
    }
  }, [opts.fftSize, opts.smoothingTimeConstant]);
  const extractBands = useCallback(() => {
    const analyser = analyserRef.current;
    const frequencyData = frequencyDataRef.current;
    if (!analyser || !frequencyData) return ZERO_LEVELS;
    analyser.getByteFrequencyData(
      frequencyData
    );
    const binCount = analyser.frequencyBinCount;
    const sampleRate = audioContextRef.current?.sampleRate ?? 44100;
    const binWidth = sampleRate / opts.fftSize;
    const getAvg = (minHz, maxHz) => {
      const minBin = Math.floor(minHz / binWidth);
      const maxBin = Math.min(Math.ceil(maxHz / binWidth), binCount - 1);
      if (minBin >= maxBin) return 0;
      let sum = 0;
      for (let i = minBin; i <= maxBin; i++) sum += frequencyData[i];
      return sum / ((maxBin - minBin + 1) * 255);
    };
    let rmsSum = 0;
    for (let i = 0; i < binCount; i++) {
      const n = frequencyData[i] / 255;
      rmsSum += n * n;
    }
    const overall = Math.sqrt(rmsSum / binCount);
    return {
      bass: getAvg(60, 250),
      lowMid: getAvg(250, 500),
      mid: getAvg(500, 2e3),
      highMid: getAvg(2e3, 4e3),
      presence: getAvg(4e3, 8e3),
      overall,
      frequencyData: new Uint8Array(frequencyData)
    };
  }, [opts.fftSize]);
  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
  }, []);
  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setLevels(ZERO_LEVELS);
  }, []);
  const analysisLoop = useCallback(() => {
    setLevels(extractBands());
    animationFrameRef.current = requestAnimationFrame(analysisLoop);
  }, [extractBands]);
  const connectMicrophone = useCallback(async () => {
    const ctx = initializeContext();
    if (!ctx) return false;
    try {
      if (ctx.state === "suspended") await ctx.resume();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      sourceNodeRef.current = source;
      if (opts.autoStart) startAnalysis();
      return true;
    } catch {
      setError("Microphone access denied or unavailable");
      return false;
    }
  }, [initializeContext, opts.autoStart, startAnalysis]);
  const connectElement = useCallback(
    (element) => {
      const ctx = initializeContext();
      if (!ctx) return false;
      try {
        if (ctx.state === "suspended") ctx.resume();
        const source = ctx.createMediaElementSource(element);
        source.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        sourceNodeRef.current = source;
        if (opts.autoStart) startAnalysis();
        return true;
      } catch {
        setError("Failed to connect audio element");
        return false;
      }
    },
    [initializeContext, opts.autoStart, startAnalysis]
  );
  const connectFile = useCallback(
    async (file) => {
      const ctx = initializeContext();
      if (!ctx) return null;
      try {
        if (ctx.state === "suspended") await ctx.resume();
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        const bufferSource = ctx.createBufferSource();
        bufferSource.buffer = audioBuffer;
        bufferSource.connect(analyserRef.current);
        analyserRef.current.connect(ctx.destination);
        if (opts.autoStart) startAnalysis();
        return bufferSource;
      } catch {
        setError("Failed to decode audio file");
        return null;
      }
    },
    [initializeContext, opts.autoStart, startAnalysis]
  );
  const connectExternalAnalyser = useCallback(
    (externalAnalyser) => {
      analyserRef.current = externalAnalyser;
      audioContextRef.current = externalAnalyser.context;
      frequencyDataRef.current = new Uint8Array(
        externalAnalyser.frequencyBinCount
      );
      if (opts.autoStart) startAnalysis();
      return true;
    },
    [opts.autoStart, startAnalysis]
  );
  const disconnect = useCallback(() => {
    stopAnalysis();
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
  }, [stopAnalysis]);
  useEffect(() => {
    if (isAnalyzing) {
      animationFrameRef.current = requestAnimationFrame(analysisLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing, analysisLoop]);
  useEffect(() => {
    return () => {
      disconnect();
      audioContextRef.current?.close();
      audioContextRef.current = null;
    };
  }, [disconnect]);
  return {
    levels,
    isAnalyzing,
    error,
    connectMicrophone,
    connectElement,
    connectFile,
    connectExternalAnalyser,
    disconnect,
    startAnalysis,
    stopAnalysis
  };
}
function useVoiceSynthesis(options = {}) {
  const { ttsEndpoint = "/api/tts", onAudioStart, onAudioEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const speak = useCallback(
    async (text, voiceId) => {
      try {
        setIsSpeaking(true);
        onAudioStart?.();
        const response = await fetch(ttsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId })
        });
        if (!response.ok) throw new Error("TTS request failed");
        const arrayBuffer = await response.arrayBuffer();
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        sourceRef.current?.stop();
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        if (!analyserRef.current || analyserRef.current.context !== ctx) {
          analyserRef.current = ctx.createAnalyser();
          analyserRef.current.fftSize = 2048;
        }
        const analyser = analyserRef.current;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
        source.start(0);
        source.onended = () => {
          setIsSpeaking(false);
          onAudioEnd?.();
        };
        return analyser;
      } catch (err) {
        console.error("[useVoiceSynthesis]", err);
        setIsSpeaking(false);
        onAudioEnd?.();
        return null;
      }
    },
    [ttsEndpoint, onAudioStart, onAudioEnd]
  );
  const stop = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsSpeaking(false);
  }, []);
  return {
    speak,
    stop,
    isSpeaking,
    /** Expose analyser so callers can wire it into `useAudioAnalysis.connectExternalAnalyser` */
    analyserRef
  };
}

export { Avatar, Ears, Eyes, Mouth, VARIANT_COLORS, VARIANT_GLOW, applyAgentTheme, getMouthStyle, useAudioAnalysis, useVoiceSynthesis };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map