import React from 'react'

/**
 * High-detail Spider-Man Mask Comic Sticker
 */
export const SpiderMaskSticker: React.FC<{
  size?: number
  className?: string
  glow?: boolean
  rotate?: number
  style?: React.CSSProperties
}> = ({ size = 64, className = '', glow = true, rotate = 0, style = {} }) => {
  return (
    <div
      className={`inline-block select-none transition-transform duration-300 hover:scale-110 ${className}`}
      style={{
        width: size,
        height: size,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: glow ? 'drop-shadow(0 4px 16px rgba(230,36,41,0.65)) drop-shadow(0 0 8px rgba(0,210,255,0.4))' : 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
        ...style,
      }}
      aria-label="Spider-Man Mask Sticker"
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <radialGradient id="maskRedGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#FF3338" />
            <stop offset="55%" stopColor="#E62429" />
            <stop offset="100%" stopColor="#8A0005" />
          </radialGradient>
          <linearGradient id="lensGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#93C5FD" />
          </linearGradient>
          <linearGradient id="rimGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#090A0F" />
          </linearGradient>
        </defs>

        {/* Outer White Comic Sticker Border */}
        <path
          d="M50 4 C24 4 12 28 14 56 C16 78 36 94 50 98 C64 94 84 78 86 56 C88 28 76 4 50 4 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Red Suit Mask Head */}
        <path
          d="M50 7 C26 7 15 30 17 56 C19 76 38 91 50 95 C62 91 81 76 83 56 C85 30 74 7 50 7 Z"
          fill="url(#maskRedGrad)"
        />

        {/* Webbing Lines on Mask */}
        {/* Central Vertical Spine */}
        <line x1="50" y1="7" x2="50" y2="95" stroke="#1A0000" strokeWidth="1.6" strokeOpacity="0.85" />
        {/* Radial Spokes */}
        <path d="M50 50 L18 20" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />
        <path d="M50 50 L82 20" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />
        <path d="M50 50 L15 50" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />
        <path d="M50 50 L85 50" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />
        <path d="M50 50 L22 78" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />
        <path d="M50 50 L78 78" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.8" />

        {/* Webbing Concentric Arcs */}
        {/* Forehead */}
        <path d="M30 20 Q50 32 70 20" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.85" fill="none" />
        <path d="M22 34 Q50 48 78 34" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.85" fill="none" />
        {/* Cheeks & Chin */}
        <path d="M25 66 Q50 52 75 66" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.85" fill="none" />
        <path d="M34 82 Q50 72 66 82" stroke="#1A0000" strokeWidth="1.4" strokeOpacity="0.85" fill="none" />

        {/* Left Eye Lens Rim (Black frame) */}
        <polygon
          points="20,44 44,48 40,64 22,54"
          fill="url(#rimGrad)"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Left Eye Lens (White glowing reflective interior) */}
        <polygon
          points="22,46 42,49.5 38.5,62 24,53"
          fill="url(#lensGrad)"
        />

        {/* Right Eye Lens Rim (Black frame) */}
        <polygon
          points="80,44 56,48 60,64 78,54"
          fill="url(#rimGrad)"
          stroke="#000"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Right Eye Lens (White glowing reflective interior) */}
        <polygon
          points="78,46 58,49.5 61.5,62 76,53"
          fill="url(#lensGrad)"
        />

        {/* Top Gloss Highlights on Forehead */}
        <ellipse cx="50" cy="18" rx="14" ry="4" fill="#FFFFFF" fillOpacity="0.25" />
      </svg>
    </div>
  )
}

/**
 * Comic "THWIP!" Web-Shooter Sound Effect Sticker
 */
export const ThwipSticker: React.FC<{
  size?: number
  className?: string
  glow?: boolean
  rotate?: number
  style?: React.CSSProperties
}> = ({ size = 70, className = '', glow = true, rotate = 0, style = {} }) => {
  return (
    <div
      className={`inline-block select-none transition-transform duration-300 hover:rotate-6 hover:scale-110 ${className}`}
      style={{
        width: size * 1.5,
        height: size,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: glow
          ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.45)) drop-shadow(0 0 10px rgba(0,210,255,0.5))'
          : 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))',
        ...style,
      }}
      aria-label="THWIP Web Sticker"
    >
      <svg viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Comic Action Starburst Background */}
        <polygon
          points="75,5 92,28 120,18 116,46 145,55 122,72 135,95 102,88 88,98 75,82 58,98 46,86 15,95 26,70 5,55 32,46 28,18 56,28"
          fill="#FFE600"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        {/* Inner Red Burst */}
        <polygon
          points="75,12 88,32 112,24 108,48 132,56 114,70 124,88 98,82 86,90 75,76 62,90 52,80 26,88 34,68 18,56 40,48 36,24 60,32"
          fill="#E62429"
        />

        {/* Web Shooters Silk Filaments */}
        <line x1="140" y1="55" x2="160" y2="40" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <line x1="145" y1="60" x2="165" y2="70" stroke="#00D2FF" strokeWidth="2.5" strokeLinecap="round" />

        {/* "THWIP!" Comic Bold Typography */}
        <text
          x="75"
          y="64"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fontFamily="'Impact', 'Arial Black', sans-serif"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.5"
          paintOrder="stroke fill"
          letterSpacing="1px"
          transform="rotate(-4 75 50)"
        >
          THWIP!
        </text>
      </svg>
    </div>
  )
}

/**
 * Comic "SPIDER-SENSE!" Warning Pulse Sticker
 */
export const SpiderSenseSticker: React.FC<{
  size?: number
  className?: string
  rotate?: number
  style?: React.CSSProperties
}> = ({ size = 64, className = '', rotate = 0, style = {} }) => {
  return (
    <div
      className={`inline-block select-none animate-spider-sense ${className}`}
      style={{
        width: size * 1.6,
        height: size,
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        filter: 'drop-shadow(0 0 14px #FFE600) drop-shadow(0 0 24px rgba(230,36,41,0.5))',
        ...style,
      }}
      aria-label="Spider-Sense Sticker"
    >
      <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Comic Warning Waves Arcs */}
        <path
          d="M30 40 Q80 10 130 40"
          stroke="#FFE600"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M45 50 Q80 25 115 50"
          stroke="#FF3338"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 58 Q80 40 100 58"
          stroke="#00D2FF"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Badge Capsule */}
        <rect
          x="15"
          y="56"
          width="130"
          height="36"
          rx="18"
          fill="#0B0E1E"
          stroke="#FFE600"
          strokeWidth="3"
        />
        <text
          x="80"
          y="80"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontFamily="'Arial Black', sans-serif"
          fill="#FFE600"
          letterSpacing="1.5px"
        >
          ⚡ SPIDER-SENSE
        </text>
      </svg>
    </div>
  )
}

/**
 * Friendly Neighborhood Spider Badge Sticker
 */
export const FriendlyNeighborhoodBadge: React.FC<{
  className?: string
}> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-lg backdrop-blur-md select-none transition-all hover:scale-105 ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(230,36,41,0.25) 0%, rgba(0,102,255,0.2) 100%)',
        borderColor: '#FF3338',
        boxShadow: '0 0 16px rgba(230,36,41,0.3)',
      }}
    >
      <SpiderMaskSticker size={22} glow={false} />
      <span className="text-[11px] font-black tracking-wider uppercase text-white font-mono">
        Friendly Neighborhood <span style={{ color: '#00F0FF' }}>Dev</span>
      </span>
    </div>
  )
}
