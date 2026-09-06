import React, { useState } from 'react'
import type { ExecutionResult } from '../../lib/execution'
import type { TestCaseResult } from './TestCaseList'
import { TestCaseList } from './TestCaseList'
import { CheckCircle2, XCircle, Clock, Terminal, AlertTriangle, ShieldCheck, Flame, Loader2 } from 'lucide-react'

type ConsoleTab = 'tests' | 'output' | 'errors'

interface ExecutionConsoleProps {
  result: ExecutionResult | null
  isRunning: boolean
  isSubmitting?: boolean
  tests: TestCaseResult[]
  executionTimeMs?: number
  themeKey?: string
}

export const ExecutionConsole: React.FC<ExecutionConsoleProps> = ({
  result,
  isRunning,
  isSubmitting = false,
  tests,
  executionTimeMs,
  themeKey = 'classic',
}) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('tests')

  const isGow = themeKey === 'gow'
  const isSpiderman = themeKey === 'spiderman'

  const isError = result ? result.status !== 'success' : false
  const hasOutput = Boolean(result?.stdout)
  const hasError = Boolean(result?.stderr)
  const allPassed = tests.length > 0 && tests.every((t) => t.passed)
  const passedCount = tests.filter((t) => t.passed).length

  const panelBg = isGow
    ? '#140D0D'
    : isSpiderman
    ? '#0D1424'
    : '#0F172A'

  const borderCol = isGow
    ? 'rgba(245, 158, 11, 0.2)'
    : isSpiderman
    ? 'rgba(14, 165, 233, 0.25)'
    : 'rgba(51, 65, 85, 0.5)'

  return (
    <div className="flex flex-col h-full overflow-hidden select-none" style={{ background: panelBg }}>
      {/* ── Execution Status Bar ────────────────────────────────── */}
      <div
        className="px-4 py-3 flex items-center justify-between shrink-0 border-b backdrop-blur-md"
        style={{ borderColor: borderCol, background: 'rgba(255, 255, 255, 0.02)' }}
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isRunning || isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span className="font-bold text-xs text-amber-400">
                {isSubmitting ? 'Evaluating & Submitting...' : 'Executing Test Suite...'}
              </span>
            </div>
          ) : result ? (
            isError ? (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                <XCircle className="w-4 h-4" />
                <span>Execution Failed</span>
              </div>
            ) : allPassed ? (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>All Tests Passed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>{passedCount}/{tests.length} Passed</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
              <Terminal className="w-3.5 h-3.5" />
              <span>Ready for Testing</span>
            </div>
          )}
        </div>

        {/* Execution time */}
        {executionTimeMs !== undefined && !isRunning && result && (
          <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" />
            {executionTimeMs}ms
          </span>
        )}
      </div>

      {/* ── Tab navigation ─────────────────────────────────────── */}
      <div
        className="flex items-center px-3 pt-2 gap-1 shrink-0 border-b"
        style={{ borderColor: borderCol, background: 'rgba(0, 0, 0, 0.15)' }}
      >
        {([
          { key: 'tests', label: `Test Cases ${tests.length > 0 ? `(${passedCount}/${tests.length})` : ''}` },
          { key: 'output', label: 'Console Output' },
          { key: 'errors', label: hasError ? 'Error Log (!)' : 'Error Log' },
        ] as { key: ConsoleTab; label: string }[]).map(({ key, label }) => {
          const isActive = activeTab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className="px-3.5 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2"
              style={{
                background: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                color: isActive
                  ? key === 'errors' && hasError
                    ? '#F43F5E'
                    : '#F8FAFC'
                  : '#64748B',
                borderColor: isActive
                  ? key === 'errors' && hasError
                    ? '#F43F5E'
                    : isGow
                    ? '#DC2626'
                    : isSpiderman
                    ? '#0284C7'
                    : '#10B981'
                  : 'transparent',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Content panels ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
        {/* TESTS TAB */}
        {activeTab === 'tests' && (
          <TestCaseList tests={tests} />
        )}

        {/* OUTPUT TAB */}
        {activeTab === 'output' && (
          <div>
            {isRunning ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Capturing standard output...</span>
              </div>
            ) : hasOutput ? (
              <pre
                className="text-xs font-mono leading-relaxed p-3.5 rounded-xl border overflow-x-auto text-emerald-300"
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderColor: borderCol,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {result?.stdout}
              </pre>
            ) : result ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-xs">
                <span>Program executed with no console output.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                <Terminal className="w-8 h-8 opacity-40" />
                <span className="text-xs font-semibold">Run your code to see console logs</span>
              </div>
            )}
          </div>
        )}

        {/* ERROR LOG TAB */}
        {activeTab === 'errors' && (
          <div>
            {isRunning ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-xs">
                <span>Checking runtime diagnostics...</span>
              </div>
            ) : hasError ? (
              <div className="rounded-xl p-3.5 border bg-rose-500/10 border-rose-500/30 overflow-x-auto">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-400">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>{result?.status?.toUpperCase().replace('_', ' ')}</span>
                </div>
                <pre className="text-xs font-mono text-rose-200 whitespace-pre-wrap break-words m-0">
                  {result?.stderr}
                </pre>
              </div>
            ) : result ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-emerald-400 text-xs">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-semibold text-slate-300">Clean execution. Zero runtime exceptions.</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
                <span>Error details will appear here if code throws an error</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
