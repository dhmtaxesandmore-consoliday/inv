import React from 'react';

// Highly detailed top-down SVG for the worker at their desk
// Takes color theme and name/role for badges
export const AgentDesk = ({ color = '#3b82f6', isAnimating = true, delay = '0s' }) => {
  return (
    <div className="agent-container" style={{ position: 'relative', width: '120px', height: '140px' }}>
      {/* Name Bubble (like in the reference) */}
      <div 
        className="name-bubble" 
        style={{
          position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
          background: '#fff', color: '#000', padding: '2px 8px', borderRadius: '10px',
          fontSize: '10px', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: '4px'
        }}
      >
        <span style={{ width: '6px', height: '6px', background: color, borderRadius: '50%' }}></span>
        Agent
      </div>

      <svg viewBox="0 0 120 140" width="100%" height="100%" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.4))' }}>
        <defs>
          <linearGradient id="deskWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5A2B" />
            <stop offset="100%" stopColor="#5C3A21" />
          </linearGradient>
          <linearGradient id="monitorGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="chairBase" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>

        {/* --- FLOOR SHADOW --- */}
        <ellipse cx="60" cy="90" rx="45" ry="40" fill="rgba(0,0,0,0.3)" />

        {/* --- DESK --- */}
        {/* Legs / Underframe */}
        <rect x="15" y="20" width="8" height="60" fill="#222" rx="2" />
        <rect x="97" y="20" width="8" height="60" fill="#222" rx="2" />
        <rect x="15" y="40" width="90" height="4" fill="#333" />
        {/* Desk Top */}
        <rect x="10" y="25" width="100" height="30" fill="url(#deskWood)" rx="4" />
        {/* Desk Edge Highlight */}
        <rect x="10" y="53" width="100" height="4" fill="#4A2F1D" rx="1" />
        
        {/* --- DESK PROPS --- */}
        {/* Mousepad */}
        <rect x="75" y="32" width="20" height="18" fill="#111" rx="2" transform="rotate(-5 85 40)" />
        {/* Mouse */}
        <ellipse cx="85" cy="42" rx="4" ry="6" fill="#ccd" transform="rotate(-15 85 42)" />
        {/* Keyboard */}
        <rect x="35" y="35" width="35" height="12" fill="#222" rx="2" />
        {/* Coffee Mug */}
        <circle cx="25" cy="40" r="5" fill="#e2e8f0" />
        <circle cx="25" cy="40" r="3" fill="#3b2f2f" />
        {/* Paper/Notes */}
        <rect x="22" y="28" width="10" height="12" fill="#fef08a" transform="rotate(15 27 34)" />

        {/* --- MONITOR --- */}
        {/* Stand */}
        <rect x="45" y="10" width="30" height="15" fill="#333" />
        {/* Screen Bezel */}
        <rect x="30" y="5" width="60" height="10" fill="#111" rx="2" />
        {/* Screen Panel */}
        <rect x="32" y="6" width="56" height="8" fill="#0f172a" rx="1" />
        {/* Monitor Screen Glow (spills onto desk) */}
        <path d="M 32 14 L 88 14 L 100 40 L 20 40 Z" fill="url(#monitorGlow)" opacity="0.4" />

        {/* --- CHAIR --- */}
        {/* Base / Wheels */}
        <circle cx="60" cy="100" r="18" fill="url(#chairBase)" />
        <circle cx="60" cy="82" r="3" fill="#444" />
        <circle cx="75" cy="92" r="3" fill="#444" />
        <circle cx="70" cy="112" r="3" fill="#444" />
        <circle cx="50" cy="112" r="3" fill="#444" />
        <circle cx="45" cy="92" r="3" fill="#444" />
        {/* Seat back (seen from behind/top) */}
        <rect x="45" y="105" width="30" height="15" rx="5" fill="#1e293b" />
        {/* Seat cushion */}
        <rect x="42" y="85" width="36" height="25" rx="8" fill="#0f172a" />

        {/* --- CHARACTER --- */}
        <g className="person" transform="translate(0, 0)">
          {/* Shoulders / Body */}
          <rect x="42" y="70" width="36" height="20" rx="10" fill={color} />
          
          {/* Arms animating (Typing) */}
          <g style={isAnimating ? { animation: `typeHands 0.5s infinite alternate ease-in-out ${delay}` } : {}}>
            {/* Left Arm */}
            <path d="M 45 75 Q 35 60 40 45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <circle cx="40" cy="45" r="4" fill="#fca5a5" /> {/* Hand */}
          </g>
          
          <g style={isAnimating ? { animation: `typeHandsRight 0.4s infinite alternate ease-in-out ${delay}` } : {}}>
            {/* Right Arm */}
            <path d="M 75 75 Q 85 60 80 45" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
            <circle cx="80" cy="45" r="4" fill="#fca5a5" /> {/* Hand */}
          </g>

          {/* Head */}
          <circle cx="60" cy="72" r="11" fill="#fca5a5" />
          
          {/* Hair / Headpiece */}
          <path d="M 49 72 A 11 11 0 0 1 71 72" fill="#1e293b" />
          
          {/* Headset Band */}
          <path d="M 47 72 A 13 13 0 0 1 73 72" fill="none" stroke="#222" strokeWidth="2" />
          {/* Headset Ear cups */}
          <rect x="45" y="68" width="4" height="8" rx="2" fill="#000" />
          <rect x="71" y="68" width="4" height="8" rx="2" fill="#000" />
          
          {/* Sunglasses (Classic Hacker Agent look) */}
          <rect x="52" y="65" width="6" height="3" rx="1" fill="#000" />
          <rect x="62" y="65" width="6" height="3" rx="1" fill="#000" />
          <path d="M 58 66 L 62 66" stroke="#000" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

// CSS Keyframes to inject globally or handle via classes
const styles = `
  @keyframes typeHands {
    0% { transform: translateY(0px) rotate(0deg); }
    100% { transform: translateY(-4px) rotate(-2deg); }
  }
  @keyframes typeHandsRight {
    0% { transform: translateY(-2px) rotate(2deg); }
    100% { transform: translateY(3px) rotate(0deg); }
  }
`;
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export const PlantProp = () => (
  <svg viewBox="0 0 50 50" width="50" height="50">
    <circle cx="25" cy="25" r="15" fill="#8B4513" /> {/* Pot */}
    <circle cx="25" cy="25" r="12" fill="#3D2314" /> {/* Soil */}
    {/* Leaves */}
    <ellipse cx="25" cy="15" rx="5" ry="10" fill="#22c55e" transform="rotate(45 25 15)" />
    <ellipse cx="15" cy="25" rx="10" ry="5" fill="#16a34a" transform="rotate(-30 15 25)" />
    <ellipse cx="35" cy="25" rx="10" ry="5" fill="#15803d" transform="rotate(30 35 25)" />
    <ellipse cx="25" cy="35" rx="5" ry="10" fill="#22c55e" transform="rotate(-45 25 35)" />
    <circle cx="25" cy="25" r="6" fill="#14532d" /> {/* Center bush */}
  </svg>
);

export const WaterCoolerProp = () => (
  <svg viewBox="0 0 40 40" width="40" height="40">
    <rect x="10" y="10" width="20" height="15" rx="2" fill="#f8fafc" /> {/* Base */}
    <circle cx="20" cy="10" r="8" fill="#38bdf8" opacity="0.8" /> {/* Bottle */}
    <circle cx="20" cy="8" r="6" fill="#7dd3fc" opacity="0.6" /> {/* Water reflection */}
    <rect x="14" y="22" width="4" height="2" fill="#ef4444" /> {/* Hot tap */}
    <rect x="22" y="22" width="4" height="2" fill="#3b82f6" /> {/* Cold tap */}
  </svg>
);

export const BoardProp = ({ text = "TODO", color = "#ea580c" }) => (
  <svg viewBox="0 0 100 30" width="200" height="60" style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))' }}>
    <rect x="0" y="0" width="100" height="30" fill="#e2e8f0" rx="2" /> {/* Board */}
    <rect x="2" y="2" width="96" height="26" fill="#ffffff" rx="1" /> {/* Drawing area */}
    {/* Stand / Wall Mounts */}
    <rect x="10" y="0" width="4" height="3" fill="#94a3b8" />
    <rect x="86" y="0" width="4" height="3" fill="#94a3b8" />
    {/* Markers drawn loosely */}
    <circle cx="10" cy="26" r="1.5" fill="#ef4444" />
    <circle cx="14" cy="26" r="1.5" fill="#3b82f6" />
    <circle cx="18" cy="26" r="1.5" fill="#22c55e" />
    {/* Text/Charts */}
    <path d="M 30 15 Q 50 5 70 20 L 70 25 L 30 25 Z" fill={color} opacity="0.2" />
    <polyline points="30,15 50,5 70,20 85,10" fill="none" stroke={color} strokeWidth="2" />
    <text x="5" y="12" fontSize="5" fill="#333" fontFamily="Arial" fontWeight="bold">{text}</text>
  </svg>
);

export const ServerRackProp = () => (
  <svg viewBox="0 0 60 80" width="60" height="80">
    {/* Rack shadow */}
    <ellipse cx="30" cy="70" rx="35" ry="10" fill="rgba(0,0,0,0.5)" />
    {/* Rack Outer */}
    <rect x="5" y="5" width="50" height="65" rx="3" fill="#1e293b" />
    <rect x="8" y="8" width="44" height="59" fill="#0f172a" />
    
    {/* Server Units inside */}
    {[12, 22, 32, 42, 52].map(y => (
      <g key={y}>
        <rect x="10" y={y} width="40" height="8" rx="1" fill="#334155" />
        <rect x="12" y={y+2} width="10" height="4" rx="1" fill="#1e293b" />
        <circle cx="45" cy={y+4} r="1.5" fill="#22c55e">
          <animate attributeName="opacity" values="1;0.2;1" dur={`${1 + Math.random()}s`} repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy={y+4} r="1.5" fill="#3b82f6" />
      </g>
    ))}
  </svg>
);
