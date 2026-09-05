import React from 'react'

interface SpiderNetDecalProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  className?: string
  size?: number
  glow?: boolean
}

/**
 * Geometric Spider Web Corner Netting
 * Adds authentic comic & gaming Spider-Man web corner detailing.
 */
export const SpiderNetDecal: React.FC<SpiderNetDecalProps> = ({
  position = 'top-right',
  className = '',
  size = 80,
  glow = true,
}) => {
  const rotationMap = {
    'top-right': 'rotate(0deg)',
    'bottom-right': 'rotate(90deg)',
    'bottom-left': 'rotate(180deg)',
    'top-left': 'rotate(270deg)',
  }

  const positionClasses = {
    'top-right': 'top-0 right-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-left': 'top-0 left-0',
  }

  return (
    <div
      className={`absolute ${positionClasses[position]} pointer-events-none z-10 select-none overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        transform: rotationMap[position],
        transformOrigin: 'top right',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-web-shimmer"
      >
        <defs>
          <linearGradient id="webGrad" x1="100" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E62429" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#00D2FF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#0066FF" stopOpacity="0.6" />
          </linearGradient>
          {glow && (
            <filter id="webGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#00D2FF" floodOpacity="0.7" />
            </filter>
          )}
        </defs>

        {/* Primary Radial Spokes radiating from (100, 0) */}
        <line x1="100" y1="0" x2="0" y2="0" stroke="url(#webGrad)" strokeWidth="1.4" filter={glow ? 'url(#webGlow)' : undefined} />
        <line x1="100" y1="0" x2="10" y2="35" stroke="url(#webGrad)" strokeWidth="1.2" />
        <line x1="100" y1="0" x2="35" y2="65" stroke="url(#webGrad)" strokeWidth="1.2" />
        <line x1="100" y1="0" x2="65" y2="90" stroke="url(#webGrad)" strokeWidth="1.2" />
        <line x1="100" y1="0" x2="100" y2="100" stroke="url(#webGrad)" strokeWidth="1.4" filter={glow ? 'url(#webGlow)' : undefined} />

        {/* Concentric Spiral Sagging Web Arcs */}
        {/* Tier 1 (Tight inner loop) */}
        <path
          d="M 85,0 Q 88,10 90,15 Q 95,12 100,15"
          stroke="url(#webGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Tier 2 */}
        <path
          d="M 68,0 Q 72,18 78,28 Q 88,30 94,36 Q 97,33 100,36"
          stroke="url(#webGrad)"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        {/* Tier 3 */}
        <path
          d="M 48,0 Q 56,26 62,42 Q 74,47 82,56 Q 92,57 100,60"
          stroke="url(#webGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Tier 4 */}
        <path
          d="M 26,0 Q 38,36 46,58 Q 62,64 71,76 Q 86,81 100,84"
          stroke="url(#webGrad)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Tier 5 (Outer boundary loop) */}
        <path
          d="M 4,0 Q 20,46 32,74 Q 50,83 62,94 Q 78,98 100,100"
          stroke="url(#webGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />

        {/* Little Dewdrop / Bio-electric Web Nodes */}
        <circle cx="62" cy="42" r="1.8" fill="#FFE600" />
        <circle cx="78" cy="28" r="1.5" fill="#00F0FF" />
        <circle cx="46" cy="58" r="1.8" fill="#FFE600" />
        <circle cx="71" cy="76" r="1.8" fill="#00F0FF" />
      </svg>
    </div>
  )
}

/**
 * Iconic Spider-Man Geometric Chest Emblem
 */
export const SpiderEmblemIcon: React.FC<{
  className?: string
  size?: number
  glowColor?: string
}> = ({
  className = '',
  size = 36,
  glowColor = 'rgba(230, 36, 41, 0.8)',
}) => {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ filter: `drop-shadow(0 0 10px ${glowColor})` }}
    >
      <defs>
        <linearGradient id="spiderBodyGrad" x1="50" y1="10" x2="50" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF3338" />
          <stop offset="50%" stopColor="#E62429" />
          <stop offset="100%" stopColor="#990000" />
        </linearGradient>
        <linearGradient id="spiderLegGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00D2FF" />
          <stop offset="60%" stopColor="#E62429" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
      </defs>

      {/* Spider Head & Abdomen Body */}
      {/* Head */}
      <polygon points="50,22 45,28 50,33 55,28" fill="url(#spiderBodyGrad)" />
      {/* Thorax */}
      <polygon points="50,34 43,42 50,54 57,42" fill="url(#spiderBodyGrad)" />
      {/* Abdomen (Elongated sharp stinger) */}
      <polygon points="50,56 46,65 50,86 54,65" fill="url(#spiderBodyGrad)" />

      {/* 8 Geometric Spider Legs */}
      {/* Top Left Leg 1 */}
      <polyline points="47,38 32,24 16,14 12,20" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Top Right Leg 1 */}
      <polyline points="53,38 68,24 84,14 88,20" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Mid-Top Left Leg 2 */}
      <polyline points="46,43 28,34 10,36 6,45" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Mid-Top Right Leg 2 */}
      <polyline points="54,43 72,34 90,36 94,45" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Mid-Bottom Left Leg 3 */}
      <polyline points="47,48 30,56 16,72 14,84" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Mid-Bottom Right Leg 3 */}
      <polyline points="53,48 70,56 84,72 86,84" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {/* Bottom Left Leg 4 */}
      <polyline points="48,58 35,72 26,88 28,96" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Bottom Right Leg 4 */}
      <polyline points="52,58 65,72 74,88 72,96" stroke="url(#spiderLegGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
