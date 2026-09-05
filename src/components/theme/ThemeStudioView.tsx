import React from 'react'
import {
  Palette,
  Check,
  Swords,
  Sliders,
  Flame,
  Gamepad2,
  Rocket,
  Sun,
} from 'lucide-react'
import { useTheme, type ThemeKey } from '../../context/ThemeContext'

interface ThemePreset {
  id: ThemeKey
  name: string
  subtitle: string
  icon: React.ElementType
  accentColor: string
  secondaryColor: string
  previewGradient: string
  glowColor: string
  description: string
  features: string[]
  supportsFx: boolean
}

export const ThemeStudioView: React.FC = () => {
  const {
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
  } = useTheme()

  const presets: ThemePreset[] = [
    {
      id: 'gow',
      name: 'God of War: Ragnarök',
      subtitle: 'Charred Basalt & Spartan Wrath',
      icon: Flame,
      accentColor: '#FF3D00',
      secondaryColor: '#DC2626',
      previewGradient: 'linear-gradient(135deg, #180A0A 0%, #3D1C1C 50%, #FF3D00 100%)',
      glowColor: 'rgba(255, 61, 0, 0.4)',
      description: 'The definitive mythical Spartan aesthetic. Charred stone slabs, Leviathan frost edges, and molten crimson embers.',
      features: ['Blades of Chaos Cursor', 'Spartan Rage HUD', 'Elder Futhark Runes', 'Cinzel Mythology Typography'],
      supportsFx: true,
    },
    {
      id: 'classic',
      name: 'Classic Gamified',
      subtitle: 'Old CodeDex Retro Warmth',
      icon: Gamepad2,
      accentColor: '#10B981',
      secondaryColor: '#FBBF24',
      previewGradient: 'linear-gradient(135deg, #FBF9F4 0%, #ECE7DF 50%, #10B981 100%)',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      description: 'Original CodeDex nostalgic gamified design. Warm ivory parchment, vibrant emerald accents, pixel badges, and retro gaming vibes.',
      features: ['Warm Parchment Surfaces', 'Emerald XP Badges', 'Retro Pixel Fonts', 'Tactile 3D Buttons'],
      supportsFx: false,
    },
    {
      id: 'space',
      name: 'Cosmic Space Explorer',
      subtitle: 'Nebula Void & Cyber Starlight',
      icon: Rocket,
      accentColor: '#6366F1',
      secondaryColor: '#00E5FF',
      previewGradient: 'linear-gradient(135deg, #060813 0%, #14193B 50%, #6366F1 100%)',
      glowColor: 'rgba(99, 102, 241, 0.4)',
      description: 'Professional futuristic cosmic coding aesthetic. Deep indigo/purple space void, electric cyan starlight, and sleek cybernetic panels.',
      features: ['Deep Cosmic Void', 'Starlight Radiance', 'Cybernetic Navigation', 'Futuristic Clean Typography'],
      supportsFx: true,
    },
    {
      id: 'light',
      name: 'Minimal Light',
      subtitle: 'Clean Slate & Focused Code',
      icon: Sun,
      accentColor: '#0284C7',
      secondaryColor: '#334155',
      previewGradient: 'linear-gradient(135deg, #FFFFFF 0%, #F1F5F9 50%, #0284C7 100%)',
      glowColor: 'rgba(2, 132, 199, 0.2)',
      description: 'Ultra-clean professional light theme. Crisp white surfaces, high-contrast readable slate typography, and restrained sky-blue highlights.',
      features: ['Crisp White Surfaces', 'High-Contrast Slate Text', 'Restrained Blue Highlights', 'Distraction-Free UI'],
      supportsFx: false,
    },
  ]

  const activePresetConfig = presets.find(p => p.id === theme) || presets[0]

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 pb-20 select-none animate-in fade-in duration-300 text-left">
      {/* ── 1. HERO BANNER: THEME FORGE ── */}
      <div
        className="relative border-2 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-2xl transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--theme-surface-card-alt) 0%, var(--theme-surface-card) 50%, var(--theme-bg-canvas) 100%)',
          borderColor: 'var(--theme-border-strong)',
        }}
      >
        <div
          className="absolute top-0 right-1/4 w-96 h-36 blur-[90px] pointer-events-none"
          style={{ background: 'var(--theme-glow-ambient)' }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: 'linear-gradient(90deg, transparent, var(--theme-accent-glow), transparent)' }}
        />

        <div className="relative z-10 flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shadow-sm animate-pulse"
              style={{ background: 'var(--theme-accent-glow)' }}
            />
            <span
              style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-accent-glow)' }}
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
            >
              CHAMBER OF MYTHIC VISIONS • THEME SYSTEM
            </span>
          </div>

          <h1
            style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
            className="text-2xl sm:text-4xl font-black tracking-wider uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]"
          >
            Visual Themes & Real-time FX
          </h1>

          <p
            className="text-xs sm:text-sm leading-relaxed max-w-xl"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Select between the 4 custom visual realms. Switching updates the entire platform instantly and saves your preference across reloads.
          </p>
        </div>
      </div>

      {/* ── 2. PRESET SELECTION GRID (ALL 4 THEMES) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" style={{ color: 'var(--theme-accent-glow)' }} />
          <h2
            style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
            className="font-bold text-base tracking-wider uppercase"
          >
            Available Themes ({presets.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {presets.map((preset) => {
            const isSelected = theme === preset.id
            return (
              <div
                key={preset.id}
                onClick={() => setTheme(preset.id)}
                className="relative rounded-2xl p-6 border-2 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-5 group overflow-hidden"
                style={{
                  background: 'var(--theme-surface-card)',
                  borderColor: isSelected ? 'var(--theme-accent-glow)' : 'var(--theme-border-default)',
                  boxShadow: isSelected ? '0 0 24px var(--theme-glow-ambient)' : 'var(--theme-shadow-card)',
                }}
              >
                {/* Active Badge */}
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold"
                    style={{
                      background: 'var(--theme-surface-card-alt)',
                      borderColor: 'var(--theme-accent-glow)',
                      color: 'var(--theme-accent-glow)',
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--theme-accent-glow)' }} />
                    <span style={{ fontFamily: 'var(--theme-font-heading)' }}>ACTIVE</span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border shadow-inner"
                    style={{ background: preset.previewGradient, borderColor: 'var(--theme-border-default)' }}
                  >
                    <preset.icon className="w-7 h-7 text-white drop-shadow-md" />
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <h3
                      style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                      className="font-bold text-base transition-colors"
                    >
                      {preset.name}
                    </h3>
                    <span
                      style={{ color: preset.accentColor, fontFamily: 'var(--theme-font-heading)' }}
                      className="text-xs font-bold uppercase tracking-wider"
                    >
                      {preset.subtitle}
                    </span>
                    <p
                      className="text-xs mt-1 leading-relaxed"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {preset.description}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <div
                  className="grid grid-cols-2 gap-2 pt-3 border-t text-xs"
                  style={{ borderColor: 'var(--theme-border-subtle)' }}
                >
                  {preset.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5" style={{ color: 'var(--theme-text-secondary)' }}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" style={{ color: 'var(--theme-accent-cyan)' }} />
                      <span className="text-[11px]">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Activation Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTheme(preset.id)
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border shadow-md active:scale-95"
                  style={{
                    fontFamily: 'var(--theme-font-heading)',
                    background: isSelected ? 'var(--theme-btn-primary-gradient)' : 'var(--theme-btn-secondary-bg)',
                    borderColor: isSelected ? 'var(--theme-btn-primary-border)' : 'var(--theme-btn-secondary-border)',
                    color: isSelected ? '#FFFFFF' : 'var(--theme-text-muted)',
                  }}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>{isSelected ? 'CURRENTLY APPLIED' : 'APPLY THEME'}</span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. VISUAL FX MODIFIERS (Active for themes that support them) ── */}
      <div
        className="rounded-2xl p-6 sm:p-7 border shadow-lg flex flex-col gap-5"
        style={{
          background: 'var(--theme-surface-card)',
          borderColor: 'var(--theme-border-default)',
        }}
      >
        <div
          className="flex items-center justify-between border-b pb-3"
          style={{ borderColor: 'var(--theme-border-subtle)' }}
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4" style={{ color: 'var(--theme-accent-glow)' }} />
            <h2
              style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
              className="font-bold text-base tracking-wider uppercase"
            >
              Interactive FX Controls
            </h2>
          </div>
          <span className="text-xs font-mono" style={{ color: 'var(--theme-text-muted)' }}>
            Active theme: <strong style={{ color: 'var(--theme-accent-glow)' }}>{activePresetConfig.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Blade of Chaos Hardware Cursor */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--theme-surface-card-alt)',
              borderColor: 'var(--theme-border-default)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0"
                style={{
                  background: 'var(--theme-accent-primary-dim)',
                  borderColor: 'var(--theme-border-strong)',
                }}
              >
                🗡️
              </div>
              <div className="flex flex-col">
                <span
                  style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Hardware Blade Cursor
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  Real-time 0ms hardware tracked cursor blade
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={bladeCursorActive}
              onChange={(e) => setBladeCursorActive(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Ambient Glow */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--theme-surface-card-alt)',
              borderColor: 'var(--theme-border-default)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0"
                style={{
                  background: 'var(--theme-accent-primary-dim)',
                  borderColor: 'var(--theme-border-strong)',
                }}
              >
                ✨
              </div>
              <div className="flex flex-col">
                <span
                  style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Ambient Peripheral Glow
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  Pulsing background aura and lighting
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={ambientGlow}
              onChange={(e) => setAmbientGlow(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Confetti / Particle FX */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--theme-surface-card-alt)',
              borderColor: 'var(--theme-border-default)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0"
                style={{
                  background: 'var(--theme-accent-primary-dim)',
                  borderColor: 'var(--theme-border-strong)',
                }}
              >
                🎉
              </div>
              <div className="flex flex-col">
                <span
                  style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Victory Confetti & Sparks
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  Celebrate challenge and quest completions
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={bloodSplatterEnabled}
              onChange={(e) => setBloodSplatterEnabled(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Sound FX */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'var(--theme-surface-card-alt)',
              borderColor: 'var(--theme-border-default)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg border flex items-center justify-center text-lg shrink-0"
                style={{
                  background: 'var(--theme-accent-primary-dim)',
                  borderColor: 'var(--theme-border-strong)',
                }}
              >
                🔊
              </div>
              <div className="flex flex-col">
                <span
                  style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                  className="font-bold text-xs uppercase tracking-wider"
                >
                  Acoustic Audio Feedback
                </span>
                <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>
                  Sound cues on leveling and task completion
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={rageSoundEffects}
              onChange={(e) => setRageSoundEffects(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Watermark slider (only shown for themes with watermark) */}
        {activePresetConfig.supportsFx && (
          <div
            className="p-4 rounded-xl border flex flex-col gap-2 mt-1"
            style={{
              background: 'var(--theme-surface-card-alt)',
              borderColor: 'var(--theme-border-default)',
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span
                style={{ fontFamily: 'var(--theme-font-heading)', color: 'var(--theme-text-primary)' }}
                className="font-bold uppercase tracking-wider"
              >
                Background Watermark Prominence
              </span>
              <span
                className="font-mono font-bold"
                style={{ color: 'var(--theme-accent-glow)' }}
              >
                {omegaWatermarkOpacity}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={omegaWatermarkOpacity}
              onChange={(e) => setOmegaWatermarkOpacity(Number(e.target.value))}
              className="w-full cursor-pointer accent-emerald-500"
            />
          </div>
        )}
      </div>
    </div>
  )
}
