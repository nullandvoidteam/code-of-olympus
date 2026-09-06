import React, { useState } from 'react'
import { CodeQuestLoginCard } from '../components/auth/CodeQuestLoginCard'
import { CodeQuestRegisterCard } from '../components/auth/CodeQuestRegisterCard'
import { CodeQuestForgotPasswordCard } from '../components/auth/CodeQuestForgotPasswordCard'
import { CodeQuestRpgScene } from '../components/auth/CodeQuestRpgScene'
import { CodeQuestTrailheadScene } from '../components/auth/CodeQuestTrailheadScene'
import { CodeQuestLogo } from '../components/brand/CodeQuestLogo'
import { Wand2, Home } from 'lucide-react'

export type AuthView = 'login' | 'register' | 'forgot-password'

interface AuthPageProps {
  onOpenOnboarding?: () => void
}

export const AuthPage: React.FC<AuthPageProps> = ({ onOpenOnboarding }) => {
  const [authView, setAuthView] = useState<AuthView>('login')

  const bgImage =
    authView === 'login'
      ? '/codequest_onboarding_bg.jpg'
      : authView === 'register'
      ? '/codequest_onboarding_bg.jpg'
      : '/codequest_onboarding_bg.jpg'

  return (
    <div className="relative h-screen w-full bg-[#f4f8f0] text-slate-900 flex flex-col justify-between overflow-y-auto lg:overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* ===== RPG Island Background Scenery ===== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgImage}
          alt=""
          className="w-full h-full object-cover object-center pixelated transition-all duration-700 opacity-30"
        />
        {/* Very light center vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_65%_at_center,_rgba(244,248,240,0.82)_0%,_rgba(244,248,240,0.5)_55%,_rgba(244,248,240,0)_100%)] pointer-events-none" />
      </div>

      {/* Floating Floating Code Runes & Ambient Accents */}
      <div className="hidden lg:flex absolute top-24 right-16 z-10 bg-[#1e293b]/90 border-2 border-sky-400 px-2.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.6)] font-mono font-bold text-xs text-sky-200 items-center justify-center animate-float-delayed pointer-events-none">
        &#123; &#125;
      </div>
      <div className="hidden lg:flex absolute bottom-28 left-12 z-10 bg-[#1e293b]/90 border-2 border-sky-400 px-2.5 py-1.5 rounded-xl shadow-[0_0_15px_rgba(56,189,248,0.6)] font-mono font-bold text-xs text-sky-200 items-center justify-center animate-float-slow pointer-events-none">
        &lt;/&gt;
      </div>

      {/* Top Header Branding & Auth Mode Controls */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('navigate-landing'))}
            className="flex items-center gap-1.5 bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-xs hover:bg-white transition-colors cursor-pointer text-slate-700 font-bold text-xs border border-slate-200/60 hover:border-emerald-300"
          >
            <Home className="w-3.5 h-3.5 text-emerald-600" />
            <span>Home</span>
          </button>
          <div className="bg-white/85 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-xs inline-flex border border-slate-200/50">
            <CodeQuestLogo size="sm" showTagline={false} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auth Mode Toggle Pill */}
          <div className="flex items-center bg-white/90 backdrop-blur-md border border-slate-200/90 p-0.5 rounded-xl shadow-xs">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                authView === 'login'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setAuthView('register')}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                authView === 'register'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Canvas Layout */}
      <main className="relative z-10 w-full max-w-7xl mx-auto flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center px-4 sm:px-8 py-1 sm:py-2">
        {authView === 'register' ? (
          <>
            {/* Left Column on Register: RPG Trailhead Scene */}
            <div className="lg:col-span-7 hidden lg:flex items-center justify-center order-2 lg:order-1 h-full min-h-0">
              <CodeQuestTrailheadScene />
            </div>

            {/* Right Column on Register: Sign-Up Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end order-1 lg:order-2">
              <CodeQuestRegisterCard
                onSwitchToLogin={() => setAuthView('login')}
              />
            </div>
          </>
        ) : (
          <>
            {/* Left Column on Login / Forgot Password: Modern Clean Auth Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              {authView === 'login' ? (
                <CodeQuestLoginCard
                  onSwitchToRegister={() => setAuthView('register')}
                  onForgotPassword={() => setAuthView('forgot-password')}
                />
              ) : (
                <CodeQuestForgotPasswordCard
                  onBackToLogin={() => setAuthView('login')}
                />
              )}
            </div>

            {/* Right Column on Login: 16-Bit Retro RPG Coding Scene with Gamification HUD */}
            <div className="lg:col-span-7 hidden lg:flex items-center justify-center h-full min-h-0">
              <CodeQuestRpgScene />
            </div>
          </>
        )}
      </main>

      {/* Bottom Spacer for padding balance */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto py-2 px-4 text-center shrink-0">
        <span className="text-[10.5px] sm:text-[11px] font-semibold text-slate-600 bg-white/80 backdrop-blur-sm px-3.5 py-1 rounded-full inline-block shadow-xs">
          &copy; {new Date().getFullYear()} CodeQuest. All rights reserved. Level up your coding skills.
        </span>
      </footer>
    </div>
  )
}
