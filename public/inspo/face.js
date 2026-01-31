import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  ':root': {
    '--bg-base': '#F5F5F7',
    '--text-main': '#1F2937',
    '--text-sub': '#6B7280',
    '--accent-primary': '#F59E0B',
    '--accent-soft': '#FEF3C7',
    '--glass-bg': 'rgba(255, 255, 255, 0.65)',
    '--glass-border': 'rgba(255, 255, 255, 0.5)',
    '--eye-white': '#ffffff',
    '--eye-shadow': 'rgba(0,0,0,0.1)',
    '--pupil-grad-start': '#F59E0B',
    '--pupil-grad-end': '#D97706',
    '--glow-color': 'rgba(245, 158, 11, 0.4)'
  }
};

const App = () => {
  const [currentAgent, setCurrentAgent] = useState('lumina');
  const [isListening, setIsListening] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isIdle, setIsIdle] = useState(true);
  const eyeContainerRef = useRef(null);
  const idleTimerRef = useRef(null);

  const agents = {
    lumina: {
      name: 'Lumina',
      role: 'Creative Companion',
      theme: {
        base: '#F5F5F7',
        text: '#1F2937',
        accent: '#F59E0B',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.8) 0%, rgba(245, 245, 247, 0) 50%), radial-gradient(circle at 80% 20%, rgba(253, 186, 116, 0.3) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(252, 211, 77, 0.2) 0%, transparent 40%)',
        pupilStart: '#1F2937',
        pupilEnd: '#111827',
        glow: '#fbbf24',
        eyeWhite: '#ffffff'
      },
      layout: 'layout-lumina',
      mouth: 'M 75 160 Q 100 170 125 160',
      mouthListening: 'M 75 155 Q 100 180 125 155',
      welcome: "Good morning, Alex.",
      sub: "I'm ready to create.",
      darkMode: false,
      dotColor: 'bg-amber-400'
    },
    volo: {
      name: 'Volo',
      role: 'The Focus',
      theme: {
        base: '#ECFEFF',
        text: '#0E7490',
        accent: '#06B6D4',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(207, 250, 254, 0.8) 0%, rgba(236, 254, 255, 0) 50%), radial-gradient(circle at 20% 20%, rgba(34, 211, 238, 0.3) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.2) 0%, transparent 40%)',
        pupilStart: '#164E63',
        pupilEnd: '#0c2d3a',
        glow: '#22d3ee',
        eyeWhite: '#ffffff'
      },
      layout: 'layout-volo',
      mouth: 'M 85 165 Q 100 165 115 165',
      mouthListening: 'M 82 162 Q 100 168 118 162',
      welcome: "Target acquired.",
      sub: "Let's narrow it down.",
      darkMode: false,
      dotColor: 'bg-cyan-400'
    },
    myst: {
      name: 'Myst',
      role: 'The Visionary',
      theme: {
        base: '#FAF5FF',
        text: '#6B21A8',
        accent: '#C026D3',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(243, 232, 255, 0.8) 0%, rgba(250, 245, 255, 0) 50%), radial-gradient(circle at 80% 20%, rgba(216, 180, 254, 0.3) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(192, 38, 211, 0.2) 0%, transparent 40%)',
        pupilStart: '#581C87',
        pupilEnd: '#3b0764',
        glow: '#d8b4fe',
        eyeWhite: '#fefcff'
      },
      layout: 'layout-myst',
      mouth: 'M 70 155 Q 100 145 130 155',
      mouthListening: 'M 68 158 Q 85 148 100 145 Q 115 148 132 158',
      welcome: "I see possibilities.",
      sub: "Look beyond the veil.",
      darkMode: false,
      dotColor: 'bg-fuchsia-500'
    },
    zane: {
      name: 'Zane',
      role: 'The Maverick',
      theme: {
        base: '#FFF1F2',
        text: '#9F1239',
        accent: '#E11D48',
        gradient: 'radial-gradient(circle at 40% 60%, rgba(255, 228, 230, 0.8) 0%, rgba(255, 241, 242, 0) 50%), radial-gradient(circle at 90% 10%, rgba(251, 113, 133, 0.3) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(244, 63, 94, 0.2) 0%, transparent 40%)',
        pupilStart: '#881337',
        pupilEnd: '#4c0519',
        glow: '#fb7185',
        eyeWhite: '#ffffff'
      },
      layout: 'layout-zane',
      mouth: 'M 75 160 Q 100 165 115 155',
      mouthListening: 'M 72 158 Q 85 172 100 165 Q 115 172 118 158',
      welcome: "Break the rules.",
      sub: "Make it weird.",
      darkMode: false,
      dotColor: 'bg-rose-500'
    },
    flux: {
      name: 'Flux',
      role: 'The Architect',
      theme: {
        base: '#EEF2FF',
        text: '#3730A3',
        accent: '#6366F1',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(224, 231, 255, 0.8) 0%, rgba(238, 242, 255, 0) 50%), radial-gradient(circle at 80% 20%, rgba(129, 140, 248, 0.3) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 40%)',
        pupilStart: '#312E81',
        pupilEnd: '#1e1b4b',
        glow: '#818cf8',
        eyeWhite: '#ffffff'
      },
      layout: 'layout-flux',
      mouth: 'M 80 160 L 100 165 L 120 160',
      mouthListening: 'M 75 158 L 88 168 L 100 175 L 112 168 L 125 158',
      welcome: "Structure defined.",
      sub: "Building parameters.",
      darkMode: false,
      dotColor: 'bg-indigo-500'
    },
    echo: {
      name: 'Echo',
      role: 'The Essence',
      theme: {
        base: '#09090b',
        text: '#F4F4F5',
        accent: '#64748B',
        gradient: 'radial-gradient(circle at 50% 50%, rgba(39, 39, 42, 0.8) 0%, rgba(9, 9, 11, 0) 50%), radial-gradient(circle at 80% 20%, rgba(148, 163, 184, 0.1) 0%, transparent 40%)',
        pupilStart: '#cbd5e1',
        pupilEnd: '#94a3b8',
        glow: '#94a3b8',
        eyeWhite: '#18181b'
      },
      layout: 'layout-echo',
      mouth: 'M 85 160 Q 100 160 115 160',
      mouthListening: 'M 82 158 Q 100 170 118 158',
      welcome: "Silence speaks.",
      sub: "Less is more.",
      darkMode: true,
      dotColor: 'bg-slate-500'
    }
  };

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        overflow: hidden;
      }

      @keyframes rotateBg {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-12px) scale(1.01); }
      }

      @keyframes blink {
        0%, 46%, 54%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.05); }
      }

      @keyframes microBlink {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(0.95); }
      }

      @keyframes pupilMove {
        0%, 100% { transform: translate(0, 0); }
        20% { transform: translate(10px, -5px); }
        40% { transform: translate(-8px, 8px); }
        60% { transform: translate(-5px, -5px); }
        80% { transform: translate(8px, 5px); }
      }

      @keyframes glowPulse {
        0%, 100% { filter: drop-shadow(0 0 20px var(--glow-color)) drop-shadow(0 4px 8px rgba(0,0,0,0.08)); }
        50% { filter: drop-shadow(0 0 35px var(--glow-color)) drop-shadow(0 6px 12px rgba(0,0,0,0.12)); }
      }

      @keyframes wave {
        0%, 100% { transform: scaleY(1); }
        50% { transform: scaleY(1.8); }
      }

      .ambient-bg {
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        animation: rotateBg 20s linear infinite;
        z-index: 0;
        pointer-events: none;
        opacity: 0.8;
        transition: opacity 1s ease;
      }

      .glass-panel {
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
        transition: all 0.5s ease;
      }

      .glass-pill {
        background: rgba(255, 255, 255, 0.65);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.5);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      }

      .glass-pill:active {
        transform: scale(0.96);
      }

      .eye-container {
        animation: float 6s ease-in-out infinite;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .eye-container:hover {
        transform: scale(1.05);
      }

      .eye-blink {
        animation: blink 5s infinite ease-in-out, microBlink 2s infinite ease-in-out;
        will-change: transform;
      }

      .pupil {
        transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
        will-change: transform;
      }

      .pupil-idle {
        animation: pupilMove 10s infinite ease-in-out;
      }

      .mouth {
        fill: none;
        stroke-width: 3;
        stroke-linecap: round;
        stroke-linejoin: round;
        opacity: 0.6;
        transition: d 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
      }

      .face-layout {
        transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0;
        pointer-events: none;
      }

      .face-layout.active {
        opacity: 1;
        pointer-events: all;
        transform: scale(1);
      }

      .agent-dot {
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .agent-dot.active {
        transform: scale(1.4);
      }

      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      .focus-ring:focus-within {
        box-shadow: 0 0 0 2px var(--bg-base), 0 0 0 4px var(--accent-primary);
      }

      .glow-layer {
        animation: glowPulse 4s infinite ease-in-out;
      }

      body.dark-mode .glass-panel {
        background: rgba(20, 20, 25, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      body.dark-mode .glass-pill {
        background: rgba(20, 20, 25, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const agent = agents[currentAgent];
    document.documentElement.style.setProperty('--bg-base', agent.theme.base);
    document.documentElement.style.setProperty('--text-main', agent.theme.text);
    document.documentElement.style.setProperty('--accent-primary', agent.theme.accent);
    document.documentElement.style.setProperty('--eye-white', agent.theme.eyeWhite);
    document.documentElement.style.setProperty('--glow-color', agent.theme.glow);
    document.documentElement.style.setProperty('--text-sub', agent.darkMode ? '#A1A1AA' : '#6B7280');

    if (agent.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    document.body.style.backgroundColor = agent.theme.base;
    document.body.style.color = agent.theme.text;
  }, [currentAgent]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (eyeContainerRef.current) {
        const rect = eyeContainerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 200;
        const intensity = Math.min(distance / maxDistance, 1);
        
        const x = (deltaX / maxDistance) * 12 * intensity;
        const y = (deltaY / maxDistance) * 10 * intensity;

        setMousePosition({ x, y });
        setIsIdle(false);

        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
        }

        idleTimerRef.current = setTimeout(() => {
          setIsIdle(true);
        }, 2000);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  const selectAgent = (id) => {
    setCurrentAgent(id);
    setIsListening(false);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const agent = agents[currentAgent];
  const pupilStyle = isIdle 
    ? {} 
    : { transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${1 + Math.min(Math.sqrt(mousePosition.x * mousePosition.x + mousePosition.y * mousePosition.y) / 200, 1) * 0.05})` };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative transition-all duration-700" style={{ backgroundColor: agent.theme.base, color: agent.theme.text }}>
      <div className="ambient-bg" style={{ background: agent.theme.gradient }}></div>

      <div className="w-full h-full max-w-[440px] flex flex-col relative z-10 overflow-hidden">
        <header className="w-full pt-14 pb-4 px-8 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${agent.dotColor} transition-colors duration-500`} style={{ boxShadow: '0 0 8px currentColor' }}></div>
              <span className="text-sm font-semibold tracking-wide uppercase opacity-90 transition-all duration-500">{agent.name}</span>
            </div>
            <span className="text-xs font-medium opacity-50 transition-all duration-500">{agent.role}</span>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-black/5 transition-colors backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </header>

        <main className="flex-1 flex flex-col relative">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[45vh] relative">
            <div className="absolute w-64 h-64 blur-[80px] rounded-full opacity-60 transition-colors duration-1000" style={{ backgroundColor: agent.theme.glow }}></div>

            <div ref={eyeContainerRef} className="relative w-72 h-72 eye-container z-10" style={isListening ? { transform: 'scale(1.05)' } : {}}>
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl glow-layer">
                <defs>
                  <linearGradient id="pupilGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={agent.theme.pupilStart} />
                    <stop offset="100%" stopColor={agent.theme.pupilEnd} />
                  </linearGradient>
                  
                  <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                    <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                    <feFlood floodColor="#000000" floodOpacity="0.08" result="color" />
                    <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />
                    <feComposite in="shadow" in2="SourceAlpha" operator="in" result="innerShadow" />
                    <feMerge>
                      <feMergeNode in="SourceGraphic" />
                      <feMergeNode in="innerShadow" />
                    </feMerge>
                  </filter>
                  
                  <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.1" />
                    </feComponentTransfer>
                    <feMerge> 
                      <feMergeNode />
                      <feMergeNode in="SourceGraphic" /> 
                    </feMerge>
                  </filter>

                  <clipPath id="clip-classic-left"><rect x="35" y="70" width="60" height="80" rx="30" /></clipPath>
                  <clipPath id="clip-classic-right"><rect x="105" y="70" width="60" height="80" rx="30" /></clipPath>
                  <clipPath id="clip-cyclops"><circle cx="100" cy="95" r="45" /></clipPath>
                  <clipPath id="clip-tri-top"><circle cx="100" cy="70" r="22" /></clipPath>
                  <clipPath id="clip-tri-left"><circle cx="65" cy="115" r="22" /></clipPath>
                  <clipPath id="clip-tri-right"><circle cx="135" cy="115" r="22" /></clipPath>
                  <clipPath id="clip-asym-left"><circle cx="65" cy="95" r="20" /></clipPath>
                  <clipPath id="clip-asym-right"><ellipse cx="125" cy="95" rx="40" ry="50" /></clipPath>
                  <clipPath id="clip-geo-left"><path d="M65 65 L90 115 L40 115 Z" /></clipPath>
                  <clipPath id="clip-geo-right"><path d="M135 65 L160 115 L110 115 Z" /></clipPath>
                  <clipPath id="clip-mini-left"><circle cx="70" cy="100" r="12" /></clipPath>
                  <clipPath id="clip-mini-right"><circle cx="130" cy="100" r="12" /></clipPath>
                </defs>

                {/* Lumina Layout */}
                <g className={`face-layout ${currentAgent === 'lumina' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '65px 110px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <rect x="35" y="70" width="60" height="80" rx="30" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-classic-left)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="65" cy="110" r="18" fill="url(#pupilGradient)" />
                        <circle cx="65" cy="110" r="17" fill="url(#pupilGradient)" opacity="0.3">
                          <animate attributeName="r" values="17;19;17" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <ellipse cx="58" cy="103" rx="6" ry="7" fill="white" opacity="0.95" />
                        <circle cx="71" cy="117" r="2.5" fill="white" opacity="0.6" />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '135px 110px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <rect x="105" y="70" width="60" height="80" rx="30" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-classic-right)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="135" cy="110" r="18" fill="url(#pupilGradient)" />
                        <circle cx="135" cy="110" r="17" fill="url(#pupilGradient)" opacity="0.3">
                          <animate attributeName="r" values="17;19;17" dur="4s" repeatCount="indefinite" />
                        </circle>
                        <ellipse cx="128" cy="103" rx="6" ry="7" fill="white" opacity="0.95" />
                        <circle cx="141" cy="117" r="2.5" fill="white" opacity="0.6" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* Volo Layout */}
                <g className={`face-layout ${currentAgent === 'volo' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '100px 95px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="100" cy="95" r="45" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-cyclops)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="100" cy="95" r="24" fill="url(#pupilGradient)" />
                        <circle cx="100" cy="95" r="22" fill="url(#pupilGradient)" opacity="0.3">
                          <animate attributeName="r" values="22;25;22" dur="5s" repeatCount="indefinite" />
                        </circle>
                        <ellipse cx="90" cy="85" rx="8" ry="10" fill="white" opacity="0.95" />
                        <circle cx="110" cy="105" r="4" fill="white" opacity="0.6" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* Myst Layout */}
                <g className={`face-layout ${currentAgent === 'myst' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '100px 70px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="100" cy="70" r="22" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-tri-top)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="100" cy="70" r="10" fill="url(#pupilGradient)" />
                        <circle cx="97" cy="67" r="3" fill="white" opacity="0.9" />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '65px 115px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="65" cy="115" r="22" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-tri-left)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="65" cy="115" r="10" fill="url(#pupilGradient)" />
                        <circle cx="62" cy="112" r="3" fill="white" opacity="0.9" />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '135px 115px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="135" cy="115" r="22" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-tri-right)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="135" cy="115" r="10" fill="url(#pupilGradient)" />
                        <circle cx="132" cy="112" r="3" fill="white" opacity="0.9" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* Zane Layout */}
                <g className={`face-layout ${currentAgent === 'zane' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '65px 95px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="65" cy="95" r="20" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-asym-left)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="65" cy="95" r="8" fill="url(#pupilGradient)" />
                        <circle cx="63" cy="93" r="2" fill="white" opacity="0.9" />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '125px 95px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <ellipse cx="125" cy="95" rx="40" ry="50" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-asym-right)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="125" cy="95" r="22" fill="url(#pupilGradient)" />
                        <ellipse cx="118" cy="88" rx="6" ry="8" fill="white" opacity="0.9" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* Flux Layout */}
                <g className={`face-layout ${currentAgent === 'flux' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '65px 90px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <path d="M65 60 L95 115 L35 115 Z" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-geo-left)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <path d="M65 80 L72 84 L72 92 L65 96 L58 92 L58 84 Z" fill="url(#pupilGradient)" />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '135px 90px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <path d="M135 60 L165 115 L105 115 Z" fill={agent.theme.eyeWhite} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round" filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-geo-right)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <path d="M135 80 L142 84 L142 92 L135 96 L128 92 L128 84 Z" fill="url(#pupilGradient)" />
                      </g>
                    </g>
                  </g>
                </g>

                {/* Echo Layout */}
                <g className={`face-layout ${currentAgent === 'echo' ? 'active' : ''}`}>
                  <g className="eye-blink" style={{ transformOrigin: '70px 100px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="70" cy="100" r="12" fill={agent.theme.eyeWhite} filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-mini-left)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="70" cy="100" r="5" fill={agent.theme.text} />
                      </g>
                    </g>
                  </g>
                  <g className="eye-blink" style={{ transformOrigin: '130px 100px', animation: isListening ? 'microBlink 1.5s infinite ease-in-out' : undefined, transform: isListening ? 'scaleY(1.12)' : undefined }}>
                    <circle cx="130" cy="100" r="12" fill={agent.theme.eyeWhite} filter="url(#innerShadow)" />
                    <g clipPath="url(#clip-mini-right)">
                      <g className={`pupil ${isIdle ? 'pupil-idle' : ''}`} style={pupilStyle}>
                        <circle cx="130" cy="100" r="5" fill={agent.theme.text} />
                      </g>
                    </g>
                  </g>
                </g>

                <path 
                  d={isListening ? agent.mouthListening : agent.mouth}
                  className="mouth" 
                  filter="url(#softShadow)"
                  stroke={agent.theme.text}
                  style={{ opacity: isListening ? 0.8 : 0.6 }}
                />
              </svg>
            </div>

            <div className="mt-4 text-center px-6 transition-all duration-700 ease-out z-20">
              <h2 className="text-2xl font-light tracking-tight opacity-90">{agent.welcome}</h2>
              <p className="text-sm mt-2 font-medium tracking-wide opacity-50">{agent.sub}</p>
            </div>
          </div>

          <div className="w-full px-4 mb-6 z-20">
            <div className="glass-pill p-2 rounded-full flex justify-between items-center w-full max-w-[340px] mx-auto overflow-hidden">
              {Object.keys(agents).map((agentId) => (
                <button
                  key={agentId}
                  onClick={() => selectAgent(agentId)}
                  className="agent-btn w-10 h-10 rounded-full flex items-center justify-center relative group"
                  aria-label={agents[agentId].name}
                >
                  <div 
                    className={`agent-dot w-3 h-3 rounded-full ${agents[agentId].dotColor} group-hover:scale-125 ${currentAgent === agentId ? 'active' : ''}`}
                    style={currentAgent === agentId ? { boxShadow: `0 0 0 2px ${agent.theme.base}, 0 0 0 4px ${agent.theme.accent}` } : {}}
                  ></div>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full px-6 pb-8 z-20">
            <div className="glass-panel w-full rounded-[32px] p-2 flex items-center gap-2 focus-ring transition-all duration-300">
              <div className="flex-1 flex items-center gap-3 px-2">
                <div 
                  className="flex items-center gap-1 h-10 flex-1 transition-opacity duration-300"
                  style={{ opacity: isListening ? 1 : 0 }}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="wave-bar w-1 bg-current rounded-full"
                      style={{
                        height: `${[8, 16, 24, 18, 12, 20, 14][i]}px`,
                        animation: `wave 0.8s ease-in-out ${i * 0.1}s infinite`,
                        opacity: [0.6, 0.7, 0.8, 0.7, 0.6, 0.75, 0.65][i]
                      }}
                    />
                  ))}
                </div>
                <span 
                  className="text-base font-normal transition-opacity duration-300"
                  style={{ 
                    opacity: isListening ? 0 : 0.4,
                    color: agent.theme.text
                  }}
                >
                  Tap to speak
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={toggleListening}
                  className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ 
                    backgroundColor: agent.theme.accent,
                    transform: isListening ? 'scale(1.1)' : 'scale(1)'
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" x2="12" y1="19" y2="22"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="w-full flex justify-center mt-6">
              <div className="w-32 h-1 bg-gray-400/30 rounded-full"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;