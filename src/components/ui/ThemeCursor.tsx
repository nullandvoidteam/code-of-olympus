import React, { useEffect, useRef, useState } from 'react'
import type { ThemeKey } from '../../context/ThemeContext'
import { BladeOfChaosCursor } from './BladeOfChaosCursor'

type CursorState = 'idle' | 'hover' | 'click'

export const ThemeCursor: React.FC<{ theme: ThemeKey }> = ({ theme }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setCursorState] = useState<CursorState>('idle')

  useEffect(() => {
    // Light theme uses the default browser cursor.
    if (theme === 'light') return

    const onMove = (e: MouseEvent) => {
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
        if (containerRef.current.style.opacity !== '1') {
          containerRef.current.style.opacity = '1'
        }
      }
    }

    const onEnterInteractive = () => setCursorState('hover')
    const onLeaveInteractive = () => setCursorState('idle')

    const onMouseDown = () => {
      setCursorState('click')
      setTimeout(() => setCursorState('idle'), 150)
    }
    const onMouseUp = () => setCursorState('idle')

    const attachHoverListeners = () => {
      document
        .querySelectorAll('button, a, [role="button"], label, select, input, textarea, [data-cursor="pointer"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onEnterInteractive)
          el.addEventListener('mouseleave', onLeaveInteractive)
        })
    }

    const onMouseLeaveWindow = () => {
      if (containerRef.current) {
        containerRef.current.style.opacity = '0'
      }
    }

    const onMouseEnterWindow = () => {
      if (containerRef.current) {
        containerRef.current.style.opacity = '1'
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeaveWindow)
    document.addEventListener('mouseenter', onMouseEnterWindow)

    attachHoverListeners()
    const observer = new MutationObserver(attachHoverListeners)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeaveWindow)
      document.removeEventListener('mouseenter', onMouseEnterWindow)
      observer.disconnect()
    }
  }, [theme])



  if (theme === 'light') {
    return null // use default system cursor
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="hidden sm:block"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0,
        willChange: 'transform',
      }}
    >
      {(theme === 'classic' || theme === 'gow') && <ClassicSVG state={state} />}
      {theme === 'space' && <SpaceSVG state={state} />}
      {theme === 'spiderman' && <SpiderWebCursor state={state} />}
    </div>
  )
}

const ClassicSVG = ({ state }: { state: CursorState }) => {
  const scale = state === 'click' ? 0.9 : 1.0;
  
  const idleCursor = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAzElEQVRYR+2X0Q6AIAhF5f8/2jYXZkwEjNSVvVUjDpcrGgT7FUkI2D9xRfQETwNIiWO85wfINfQUEyxBG2ArsLwC0jioGt5zFcwF4OYDPi/mBYKm4t0U8ATgRm3ThFoAqkhNgWkA0jJLvaOVSs7j3qMnSgXWBMiWPXe94QqMBMBc1VZIvaTu5u5pQewq0EqNZvIEMCmxAawK0DNkay9QmfFNAJUXfgGgUkLaE7j/h8fnASkxHTz0DGIBMCnBeeM7AArpUd3mz2x3C7wADglA8BcWMZhZAAAAAElFTkSuQmCC';
  const hoverCursor = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABFklEQVRYR9WXURLDIAhE6/0PbSdOtUpcd1Gnpv1KGpTHBpCE1/cXq+vrMph7dGvXZTtpfW10DCA5jrH1H0Jhs5E0hnZdCR+vb5S8Nn8mQCeS9BdSalYJqMBjAGzq59xAESN7VFVUgV8AZB/dZBR7QTFDCqGquvUBVVoEtgIwpQRzmANSFHgWQKExHdIrPeuMvQNDarXe6nC/AutgV3JW+6bgqQLeV8FekRtgV+ToDKEKnACYKsfZjjkam7a0ZpYTytwmgainpC3HvwBocgKOxqRjehoR9DFKNFYtOwCGYCszobeCbl26N6yyQ6g8X/Wex/rBPsNEV6qAMaJPMynIHQCoSqS9JSMmwef51LflTgCRszU7DvAGiV6mHWfsaVUAAAAASUVORK5CYII=';

  return (
    <div
      style={{
        width: 32,
        height: 32,
        transformOrigin: 'top left',
        transform: `translate(-2px, -2px) scale(${scale})`,
        transition: 'transform 80ms ease',
      }}
    >
      <img 
        src={state === 'idle' ? idleCursor : hoverCursor} 
        alt="cursor" 
        style={{ width: '100%', height: '100%', imageRendering: 'pixelated' }} 
      />
    </div>
  )
}

const SpaceSVG = ({ state }: { state: CursorState }) => {
  const scale = state === 'click' ? 0.8 : state === 'hover' ? 1.2 : 1.0;
  return (
    <div
      style={{
        width: 40,
        height: 40,
        transformOrigin: '20px 20px',
        transform: `translate(-20px, -20px) scale(${scale})`,
        transition: 'transform 100ms ease',
      }}
    >
      <svg viewBox="0 0 40 40" fill="none" stroke="#22d3ee" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }}>
        <circle cx="20" cy="20" r={state === 'hover' ? "8" : "12"} style={{ transition: 'all 0.2s' }} />
        <line x1="20" y1="0" x2="20" y2="12" />
        <line x1="20" y1="28" x2="20" y2="40" />
        <line x1="0" y1="20" x2="12" y2="20" />
        <line x1="28" y1="20" x2="40" y2="20" />
        {state === 'click' && <circle cx="20" cy="20" r="4" fill="#22d3ee" />}
      </svg>
    </div>
  )
}

const SpiderWebCursor = ({ state }: { state: CursorState }) => {
  const scale = state === 'click' ? 0.85 : state === 'hover' ? 1.25 : 1.0
  const isHover = state === 'hover'
  const isClick = state === 'click'

  return (
    <div
      style={{
        width: 50,
        height: 50,
        transformOrigin: '25px 25px',
        transform: `translate(-25px, -25px) scale(${scale})`,
        transition: 'transform 80ms ease-out',
      }}
    >
      <svg
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="silkGrad" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF3338" />
            <stop offset="50%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <filter id="webNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="1.8" floodColor="#FF2A34" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00D2FF" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Spider-Sense Tingle Radar Wave (Active on hover) */}
        {isHover && (
          <g className="animate-tingle-arc" style={{ transformOrigin: '25px 12px' }}>
            <path
              d="M 12 12 Q 25 2 38 12"
              stroke="#FFE600"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 8px #FFE600)' }}
            />
            <path
              d="M 17 16 Q 25 8 33 16"
              stroke="#FF3338"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 6px #FF3338)' }}
            />
          </g>
        )}

        {/* ── COMPLETE GEOMETRIC SPIDER WEB (8 Primary Radial Spokes) ── */}
        <g filter="url(#webNeonGlow)">
          {/* Vertical & Horizontal Spokes */}
          <line x1="25" y1="2" x2="25" y2="48" stroke="url(#silkGrad)" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="2" y1="25" x2="48" y2="25" stroke="url(#silkGrad)" strokeWidth="1.6" strokeLinecap="round" />
          {/* Diagonal Spokes */}
          <line x1="8.7" y1="8.7" x2="41.3" y2="41.3" stroke="url(#silkGrad)" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="8.7" y1="41.3" x2="41.3" y2="8.7" stroke="url(#silkGrad)" strokeWidth="1.4" strokeLinecap="round" />

          {/* Concentric Spiral Silk Loops (Tier 1 - Inner Octagonal Web) */}
          <polygon
            points="25,17 30.6,19.4 33,25 30.6,30.6 25,33 19.4,30.6 17,25 19.4,19.4"
            stroke="#00F0FF"
            strokeWidth="1.2"
            strokeOpacity="0.85"
            fill="none"
          />

          {/* Concentric Spiral Silk Loops (Tier 2 - Mid Octagonal Web) */}
          <polygon
            points="25,10 35.6,14.4 40,25 35.6,35.6 25,40 14.4,35.6 10,25 14.4,14.4"
            stroke="url(#silkGrad)"
            strokeWidth="1.4"
            strokeOpacity="0.9"
            fill="none"
          />

          {/* Concentric Spiral Silk Loops (Tier 3 - Outer Sagging Silk Arcs) */}
          <path
            d="M 25 3 Q 32 8 40.5 9.5 Q 38 18 47 25 Q 38 32 40.5 40.5 Q 32 38 25 47 Q 18 38 9.5 40.5 Q 12 32 3 25 Q 12 18 9.5 9.5 Q 18 12 25 3"
            stroke="#FF2A34"
            strokeWidth="1.4"
            fill="rgba(0, 102, 255, 0.04)"
          />
        </g>

        {/* Little Bio-Electric Spider Resting at Center */}
        <g>
          {/* Spider Thorax & Head */}
          <ellipse cx="25" cy="25" rx="3.2" ry="4" fill="#FFE600" />
          <circle cx="25" cy="22" r="2.2" fill="#FF2A34" />
          {/* Spider Legs */}
          <line x1="23" y1="23" x2="19" y2="18" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="27" y1="23" x2="31" y2="18" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="25" x2="18" y2="25" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="27" y1="25" x2="32" y2="25" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="23" y1="27" x2="19" y2="32" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="27" y1="27" x2="31" y2="32" stroke="#FFE600" strokeWidth="1.2" strokeLinecap="round" />
        </g>

        {/* Click Web Shoot Blast */}
        {isClick && (
          <g>
            <circle cx="25" cy="25" r="24" stroke="#00F0FF" strokeWidth="2.5" strokeDasharray="3 3" opacity="0.95" />
            <line x1="25" y1="25" x2="25" y2="-10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <circle cx="25" cy="25" r="6" fill="#FFE600" style={{ filter: 'drop-shadow(0 0 12px #FFE600)' }} />
          </g>
        )}
      </svg>
    </div>
  )
}

