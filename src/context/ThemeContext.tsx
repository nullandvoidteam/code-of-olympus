import React, { createContext, useContext, useState, useEffect } from 'react'

export type ThemeKey = 'gow' | 'classic' | 'space' | 'light'

interface ThemeContextType {
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  bladeCursorActive: boolean
  setBladeCursorActive: (active: boolean) => void
  ambientGlow: boolean
  setAmbientGlow: (active: boolean) => void
  bloodSplatterEnabled: boolean
  setBloodSplatterEnabled: (active: boolean) => void
  rageSoundEffects: boolean
  setRageSoundEffects: (active: boolean) => void
  omegaWatermarkOpacity: number
  setOmegaWatermarkOpacity: (opacity: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'crucible_theme_key'
const FX_STORAGE_KEY = 'crucible_theme_fx'

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey | null
      return saved && ['gow', 'classic', 'space', 'light'].includes(saved) ? saved : 'gow'
    } catch {
      return 'gow'
    }
  })

  const [bladeCursorActive, setBladeCursorActive] = useState<boolean>(true)
  const [ambientGlow, setAmbientGlow] = useState<boolean>(true)
  const [bloodSplatterEnabled, setBloodSplatterEnabled] = useState<boolean>(true)
  const [rageSoundEffects, setRageSoundEffects] = useState<boolean>(true)
  const [omegaWatermarkOpacity, setOmegaWatermarkOpacity] = useState<number>(12)

  // Load FX settings
  useEffect(() => {
    try {
      const savedFx = localStorage.getItem(FX_STORAGE_KEY)
      if (savedFx) {
        const parsed = JSON.parse(savedFx)
        if (typeof parsed.bladeCursorActive === 'boolean') setBladeCursorActive(parsed.bladeCursorActive)
        if (typeof parsed.ambientGlow === 'boolean') setAmbientGlow(parsed.ambientGlow)
        if (typeof parsed.bloodSplatterEnabled === 'boolean') setBloodSplatterEnabled(parsed.bloodSplatterEnabled)
        if (typeof parsed.rageSoundEffects === 'boolean') setRageSoundEffects(parsed.rageSoundEffects)
        if (typeof parsed.omegaWatermarkOpacity === 'number') setOmegaWatermarkOpacity(parsed.omegaWatermarkOpacity)
      }
    } catch {}
  }, [])

  // Persist FX settings
  useEffect(() => {
    try {
      localStorage.setItem(
        FX_STORAGE_KEY,
        JSON.stringify({
          bladeCursorActive,
          ambientGlow,
          bloodSplatterEnabled,
          rageSoundEffects,
          omegaWatermarkOpacity,
        })
      )
    } catch {}
  }, [bladeCursorActive, ambientGlow, bloodSplatterEnabled, rageSoundEffects, omegaWatermarkOpacity])

  // Apply theme to document root dataset
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {}
  }, [theme])

  // Sync custom hardware cursor class
  useEffect(() => {
    try {
      if (bladeCursorActive) {
        document.documentElement.classList.add('custom-cursor')
      } else {
        document.documentElement.classList.remove('custom-cursor')
      }
    } catch {}
  }, [bladeCursorActive])

  // Sync watermark opacity token
  useEffect(() => {
    try {
      document.documentElement.style.setProperty('--theme-watermark-opacity', `${omegaWatermarkOpacity / 100}`)
    } catch {}
  }, [omegaWatermarkOpacity])

  const setTheme = (nextTheme: ThemeKey) => {
    setThemeState(nextTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        bladeCursorActive,
        setBladeCursorActive,
        ambientGlow,
        setAmbientGlow,
        bloodSplatterEnabled,
        setBloodSplatterEnabled,
        rageSoundEffects,
        setRageSoundEffects,
        omegaWatermarkOpacity,
        setOmegaWatermarkOpacity,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
