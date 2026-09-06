import React, { useRef, useCallback } from 'react'
import { RotateCcw, Play, CheckCircle2, Loader2, Code2, Sparkles, Terminal } from 'lucide-react'

const LANG_EXT: Record<string, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  go: 'go',
  rust: 'rs',
}

const LANG_COLORS: Record<string, string> = {
  python: '#38BDF8',
  javascript: '#FACC15',
  typescript: '#60A5FA',
  java: '#FB923C',
  cpp: '#A78BFA',
  default: '#10B981',
}

interface CodeEditorPaneProps {
  code: string
  language: string
  isRunning: boolean
  isSubmitting?: boolean
  themeKey?: string
  onCodeChange: (code: string) => void
  onRun: () => void
  onSubmit: () => void
  onReset: () => void
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  code,
  language,
  isRunning,
  isSubmitting = false,
  themeKey = 'classic',
  onCodeChange,
  onRun,
  onSubmit,
  onReset,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineScrollRef = useRef<HTMLDivElement>(null)

  const ext = LANG_EXT[language?.toLowerCase()] ?? 'py'
  const langColor = LANG_COLORS[language?.toLowerCase()] ?? LANG_COLORS.default
  const lines = code.split('\n')
  const lineCount = lines.length

  const isGow = themeKey === 'gow'
  const isSpiderman = themeKey === 'spiderman'

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const s = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const next = code.substring(0, s) + '    ' + code.substring(end)
      onCodeChange(next)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = s + 4
          textareaRef.current.selectionEnd = s + 4
        }
      }, 0)
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const s = e.currentTarget.selectionStart
      const lineStart = code.lastIndexOf('\n', s - 1) + 1
      const currentLine = code.substring(lineStart, s)
      const indent = currentLine.match(/^(\s*)/)?.[1] ?? ''
      const extraIndent = currentLine.trimEnd().endsWith(':') || currentLine.trimEnd().endsWith('{') ? '    ' : ''
      const ins = '\n' + indent + extraIndent
      const next = code.substring(0, s) + ins + code.substring(s)
      onCodeChange(next)
      setTimeout(() => {
        if (textareaRef.current) {
          const pos = s + ins.length
          textareaRef.current.selectionStart = pos
          textareaRef.current.selectionEnd = pos
        }
      }, 0)
    }
  }, [code, onCodeChange])

  const syncScroll = () => {
    if (lineScrollRef.current && textareaRef.current) {
      lineScrollRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  // Theme palettes
  const headerBg = isGow
    ? 'rgba(24, 14, 14, 0.95)'
    : isSpiderman
    ? 'rgba(15, 23, 42, 0.95)'
    : 'rgba(15, 23, 42, 0.92)'

  const editorBg = isGow
    ? '#130B0B'
    : isSpiderman
    ? '#090D16'
    : '#0B0F19'

  const gutterBg = isGow
    ? '#0E0707'
    : isSpiderman
    ? '#060910'
    : '#080C14'

  const borderCol = isGow
    ? 'rgba(245, 158, 11, 0.2)'
    : isSpiderman
    ? 'rgba(14, 165, 233, 0.25)'
    : 'rgba(51, 65, 85, 0.45)'

  return (
    <div className="flex flex-col h-full overflow-hidden select-none" style={{ background: editorBg }}>
      {/* ── Window Chrome ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-2.5 shrink-0 border-b backdrop-blur-md"
        style={{ background: headerBg, borderColor: borderCol }}
      >
        {/* File tab */}
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: borderCol,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: langColor, boxShadow: `0 0 8px ${langColor}` }} />
            <span className="font-mono font-bold text-xs text-slate-200">
              solution.{ext}
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline-flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            {language?.toUpperCase() || 'CODE'}
          </span>
        </div>

        {/* Controls: Reset, Run Code, Submit Solution */}
        <div className="flex items-center gap-2">
          {/* Reset */}
          <button
            type="button"
            onClick={onReset}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all hover:bg-white/10 active:scale-[0.97] text-slate-300 border disabled:opacity-50"
            style={{ borderColor: borderCol }}
            title="Reset code template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Run / Test Code */}
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all text-white border active:scale-[0.97] disabled:opacity-60 shadow-sm"
            style={{
              background: isGow
                ? 'linear-gradient(135deg, #78350F 0%, #B45309 100%)'
                : isSpiderman
                ? 'linear-gradient(135deg, #0369A1 0%, #0284C7 100%)'
                : 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
              borderColor: isGow
                ? 'rgba(245, 158, 11, 0.5)'
                : isSpiderman
                ? 'rgba(14, 165, 233, 0.6)'
                : 'rgba(71, 85, 105, 0.8)',
            }}
            title="Run code against sample test cases"
          >
            {isRunning && !isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
            ) : (
              <Play className="w-3.5 h-3.5 text-sky-400 fill-current" />
            )}
            <span>{isRunning && !isSubmitting ? 'Testing...' : 'Run Tests'}</span>
          </button>

          {/* Submit Solution */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-2 px-5 py-1.5 rounded-lg font-black tracking-wide text-xs uppercase text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-60 shadow-lg"
            style={{
              background: isGow
                ? 'linear-gradient(135deg, #DC2626 0%, #EA580C 50%, #D97706 100%)'
                : isSpiderman
                ? 'linear-gradient(135deg, #E11D48 0%, #2563EB 100%)'
                : 'linear-gradient(135deg, #059669 0%, #10B981 50%, #06B6D4 100%)',
              boxShadow: isGow
                ? '0 0 20px rgba(220, 38, 38, 0.45)'
                : isSpiderman
                ? '0 0 20px rgba(225, 29, 72, 0.45)'
                : '0 0 20px rgba(16, 185, 129, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
            title="Submit solution and record XP to Supabase"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Editor body ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative" style={{ background: editorBg }}>
        {/* Line numbers gutter */}
        <div
          ref={lineScrollRef}
          className="select-none overflow-hidden shrink-0 border-r"
          style={{
            width: '46px',
            background: gutterBg,
            borderColor: borderCol,
            paddingTop: '16px',
            paddingBottom: '16px',
            overflowY: 'hidden',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className="text-right pr-3 font-mono text-xs tabular-nums text-slate-500 font-semibold"
              style={{ lineHeight: '22px' }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code textarea */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => {
            onCodeChange(e.target.value)
            syncScroll()
          }}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className="flex-1 resize-none outline-none bg-transparent py-4 px-4 font-mono select-text"
          style={{
            color: '#F1F5F9',
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '13.5px',
            lineHeight: '22px',
            caretColor: isGow ? '#FF3D00' : isSpiderman ? '#38BDF8' : '#10B981',
            tabSize: 4,
          }}
        />
      </div>

      {/* ── Status bar ──────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-1.5 shrink-0 border-t text-xs font-mono"
        style={{ background: gutterBg, borderColor: borderCol }}
      >
        <div className="flex items-center gap-3 text-slate-400">
          <span className="font-semibold text-slate-300">
            {language?.toUpperCase() ?? 'PYTHON'}
          </span>
          <span>•</span>
          <span>{lineCount} lines</span>
          <span>•</span>
          <span className="text-emerald-400 font-sans font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Supabase Live Synced
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}
