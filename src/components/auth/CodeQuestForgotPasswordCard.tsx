import React, { useState } from 'react'
import { Mail, ArrowLeft, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface CodeQuestForgotPasswordCardProps {
  onBackToLogin: () => void
}

export const CodeQuestForgotPasswordCard: React.FC<CodeQuestForgotPasswordCardProps> = ({
  onBackToLogin,
}) => {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setMessage(null)

    if (!email.trim()) {
      setErrorMessage('Please enter your account email.')
      return
    }

    setIsLoading(true)
    const { error, message: successMsg } = await resetPassword(email.trim())
    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message || 'Could not send reset password email.')
    } else {
      setMessage(successMsg || 'Check your email for the recovery link!')
    }
  }

  return (
    <div className="w-full max-w-[450px] bg-white rounded-3xl p-6 sm:p-7 lg:p-8 border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.07)] flex flex-col transition-all text-left">
      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-3.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Login</span>
      </button>

      <div className="flex items-center gap-1.5 text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.18em] mb-1.5">
        <span>✦</span>
        <span>PASSWORD RECOVERY</span>
        <span>✦</span>
      </div>

      <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-[1.16] tracking-tight mb-1.5">
        Reset Your <br />
        <span className="text-emerald-500">Security Key</span>
      </h1>

      <p className="text-slate-500 text-xs sm:text-[13px] font-medium mb-4">
        Enter your registered email and we&apos;ll send you instructions to reset your adventure passcode.
      </p>

      {message ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Reset Link Sent!</span>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">{message}</p>
          <button
            type="button"
            onClick={onBackToLogin}
            className="mt-1 text-xs font-bold text-emerald-700 underline text-left hover:text-emerald-800 cursor-pointer"
          >
            Return to login screen →
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="reset-email"
              className="text-[10.5px] font-bold uppercase tracking-wider text-slate-700"
            >
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="reset-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold text-center animate-shake">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 w-full h-11 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm tracking-wide rounded-xl shadow-[0_6px_20px_rgba(5,150,105,0.28)] hover:shadow-[0_8px_25px_rgba(5,150,105,0.38)] active:translate-y-0.5 active:shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending Instructions...</span>
              </>
            ) : (
              <span>Send Reset Instructions →</span>
            )}
          </button>
        </form>
      )}

      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span>Secured via Supabase Authentication</span>
      </div>
    </div>
  )
}
