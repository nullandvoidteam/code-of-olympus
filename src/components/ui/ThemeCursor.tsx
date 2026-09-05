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
