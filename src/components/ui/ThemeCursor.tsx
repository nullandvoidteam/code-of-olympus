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
        width: 44,
        height: 44,
        transformOrigin: '22px 22px',
        transform: `translate(-22px, -22px) scale(${scale})`,
        transition: 'transform 90ms ease-out',
      }}
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="cursorWebGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E62429" />
            <stop offset="50%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#0066FF" />
          </linearGradient>
          <filter id="cursorGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#E62429" floodOpacity="0.8" />
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#00D2FF" floodOpacity="0.6" />
          </filter>
        </defs>

        {/* Spider-Sense Tingle Radar Wave (Active on hover) */}
        {isHover && (
          <g className="animate-tingle-arc" style={{ transformOrigin: '22px 14px' }}>
            <path
              d="M 12 12 Q 22 4 32 12"
              stroke="#FFE600"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 6px #FFE600)' }}
            />
            <path
              d="M 16 16 Q 22 9 28 16"
              stroke="#FF3338"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'drop-shadow(0 0 4px #FF3338)' }}
            />
          </g>
        )}

        {/* Outer Circular Web Netting Reticle */}
        <circle
          cx="22"
          cy="22"
          r={isHover ? 16 : 14}
          stroke="url(#cursorWebGrad)"
          strokeWidth="1.6"
          strokeDasharray={isHover ? "4 2" : "none"}
          filter="url(#cursorGlow)"
          style={{
            transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: '22px 22px',
          }}
        />

        {/* Web Concentric Inner Ring */}
        <circle
          cx="22"
          cy="22"
          r="7"
          stroke="#00D2FF"
          strokeWidth="1"
          strokeOpacity="0.75"
        />

        {/* Web Crosshair Spokes (N, S, E, W) */}
        <line x1="22" y1="2" x2="22" y2="10" stroke="#E62429" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="22" y1="34" x2="22" y2="42" stroke="#E62429" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="2" y1="22" x2="10" y2="22" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="34" y1="22" x2="42" y2="22" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" />

        {/* Diagonal Web Strands */}
        <line x1="12" y1="12" x2="17" y2="17" stroke="#00D2FF" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="32" y1="12" x2="27" y2="17" stroke="#00D2FF" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="12" y1="32" x2="17" y2="27" stroke="#00D2FF" strokeWidth="1" strokeOpacity="0.6" />
        <line x1="32" y1="32" x2="27" y2="27" stroke="#00D2FF" strokeWidth="1" strokeOpacity="0.6" />

        {/* Center Targeting Dot & Bio-Electric Core */}
        <circle
          cx="22"
          cy="22"
          r={isClick ? 5 : 2.5}
          fill={isClick ? "#FFE600" : "#E62429"}
          style={{
            filter: isClick ? 'drop-shadow(0 0 10px #FFE600)' : 'drop-shadow(0 0 4px #00D2FF)',
            transition: 'all 0.1s ease',
          }}
        />

        {/* Click Web Blast Burst */}
        {isClick && (
          <g>
            <line x1="22" y1="22" x2="6" y2="6" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="22" x2="38" y2="6" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="22" x2="6" y2="38" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
            <line x1="22" y1="22" x2="38" y2="38" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" />
            <circle cx="22" cy="22" r="18" stroke="#FFE600" strokeWidth="2" opacity="0.9" />
          </g>
        )}
      </svg>
    </div>
  )
}

