import React, { useState } from 'react'
import { Mail, Lock, User, AtSign, Eye, EyeOff, ShieldCheck, Loader2, GraduationCap, ShieldAlert } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../lib/supabase'

interface CodeQuestRegisterCardProps {
  onSwitchToLogin: () => void
}

export const CodeQuestRegisterCard: React.FC<CodeQuestRegisterCardProps> = ({
  onSwitchToLogin,
}) => {
  const { signUp } = useAuth()
  const [role, setRole] = useState<UserRole>('student')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Dynamic Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Enter a password', color: 'bg-slate-200', textColor: 'text-slate-400' }
    if (pass.length < 6) return { score: 1, label: 'Weak (min 6 chars)', color: 'bg-rose-500', textColor: 'text-rose-500' }
    if (pass.length < 10) return { score: 2, label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500' }
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600' }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!username.trim()) {
      setErrorMessage('Please choose a username.')
      return
    }

    if (!email.trim()) {
      setErrorMessage('Please provide a valid email.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    setIsLoading(true)
    const { error } = await signUp({
      email: email.trim(),
      password,
      role,
      username: username.trim(),
      fullName: fullName.trim(),
    })
    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message || 'Could not create account. Please try again.')
    } else {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      })
      setSuccessMessage('Character created successfully! Welcome to CodeQuest.')
    }
  }

  return (
    <div className="w-full max-w-[440px] bg-white rounded-3xl p-5 sm:p-6 lg:p-7 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.07)] flex flex-col transition-all text-left">
      {/* Small emerald header tag */}
      <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.18em] mb-1.5">
        <span>✦</span>
        <span>BEGIN YOUR ADVENTURE</span>
        <span>✦</span>
      </div>

      {/* Main Heading */}
      <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 leading-[1.16] tracking-tight mb-1.5">
        Create Your <br />
        <span className="text-emerald-500 relative inline-block">
          Developer Profile
          {/* Sparkles */}
          <span className="absolute -top-2.5 -right-5 text-amber-400 text-xs animate-pulse select-none">
            ✦
          </span>
          <span className="absolute -bottom-0.5 -right-3 text-emerald-400 text-[10px] animate-twinkle select-none">
            ✨
          </span>
        </span>
      </h1>

      {/* Subtitle */}
      <p className="text-slate-500 text-xs sm:text-[13px] font-medium mb-3">
        Choose your username, build real things, and level up as you learn.
      </p>

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Full Name Input */}
        <div className="flex flex-col gap-0.5 text-left">
          <label
            htmlFor="register-fullname"
            className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
          >
            FULL NAME
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="register-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
          </div>
        </div>

        {/* Username Input */}
        <div className="flex flex-col gap-0.5 text-left">
          <label
            htmlFor="register-username"
            className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
          >
            USERNAME <span className="text-emerald-500">*</span>
          </label>
          <div className="relative flex items-center">
            <AtSign className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="register-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="flex flex-col gap-0.5 text-left">
          <label
            htmlFor="register-email"
            className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
          >
            EMAIL <span className="text-emerald-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-0.5 text-left">
          <label
            htmlFor="register-password"
            className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
          >
            PASSWORD <span className="text-emerald-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Strength Status Bar */}
          {password && (
            <div className="flex items-center gap-2 mt-1 px-0.5">
              <span className={`text-[9.5px] font-bold uppercase ${strength.textColor}`}>
                {strength.label}
              </span>
              <div className="flex-1 flex gap-1 h-1.5 bg-slate-100 rounded-full">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
            {errorMessage}
          </div>
        )}

        {/* Success Notification */}
        {successMessage && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-bold text-center">
            {successMessage}
          </div>
        )}

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`mt-1.5 w-full h-10.5 sm:h-11 text-white font-bold text-sm tracking-wide rounded-xl active:translate-y-0.5 active:shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
            role === 'admin'
              ? 'bg-purple-600 hover:bg-purple-500 active:bg-purple-700 shadow-[0_4px_14px_rgba(147,51,234,0.25)]'
              : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-[0_6px_20px_rgba(5,150,105,0.28)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.38)]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Character...</span>
            </>
          ) : (
            <>
              <span>Create My {role === 'admin' ? 'Admin Account' : 'Character'}</span>
              <span className="text-base">→</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-2.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200/80" />
        </div>
        <span className="relative bg-white px-3 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
          OR
        </span>
      </div>

      {/* Footer link to Login */}
      <div className="text-center text-xs text-slate-600">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors cursor-pointer"
        >
          Log in
        </button>
      </div>

      {/* Terms footnote */}
      <div className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>
          By continuing, you agree to our Terms & Privacy Policy.
        </span>
      </div>
    </div>
  )
}
