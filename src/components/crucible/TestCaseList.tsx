import React from 'react'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export interface TestCaseResult {
  index: number
  label: string
  passed: boolean
  expected?: string
  actual?: string
}

interface TestCaseListProps {
  tests: TestCaseResult[]
}

export const TestCaseList: React.FC<TestCaseListProps> = ({ tests }) => {
  if (!tests.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
        <AlertCircle className="w-8 h-8 opacity-40" />
        <p className="font-semibold text-xs text-slate-400">
          Run or Submit code to evaluate test cases
        </p>
      </div>
    )
  }

  const passed = tests.filter((t) => t.passed).length
  const total = tests.length
  const allPassed = passed === total

  return (
    <div className="flex flex-col gap-3 select-text">
      {/* Summary pill */}
      <div
        className={`flex items-center justify-between py-2.5 px-4 rounded-xl border ${
          allPassed
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : passed > 0
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}
      >
        <span className="font-bold text-xs">
          {allPassed
            ? '✓ All test cases passed successfully!'
            : `${passed} of ${total} test cases passed`}
        </span>
        <span className="text-xs font-mono font-black">
          {Math.round((passed / total) * 100)}%
        </span>
      </div>

      {/* Individual test cases */}
      <div className="flex flex-col gap-2.5">
        {tests.map((tc) => (
          <div
            key={tc.index}
            className={`rounded-xl border overflow-hidden transition-all ${
              tc.passed
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-rose-950/20 border-rose-500/30'
            }`}
          >
            {/* Test header */}
            <div className="flex items-center justify-between px-3.5 py-2.5">
              <div className="flex items-center gap-2.5">
                {tc.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="font-semibold text-xs text-slate-200">
                  Case {tc.index + 1}{tc.label ? `: ${tc.label}` : ''}
                </span>
              </div>
              <span
                className={`text-[11px] font-black uppercase tracking-wider ${
                  tc.passed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {tc.passed ? 'Passed' : 'Failed'}
              </span>
            </div>

            {/* Diff output for failed tests */}
            {!tc.passed && (tc.expected || tc.actual) && (
              <div className="px-3.5 pb-3 flex flex-col gap-2 pt-1 border-t border-rose-500/20 text-xs">
                {tc.expected !== undefined && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Expected Output:
                    </span>
                    <pre className="p-2 rounded-lg bg-black/40 font-mono text-xs text-emerald-300 overflow-x-auto m-0">
                      {tc.expected}
                    </pre>
                  </div>
                )}
                {tc.actual !== undefined && (
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Your Output:
                    </span>
                    <pre className="p-2 rounded-lg bg-black/40 font-mono text-xs text-rose-300 overflow-x-auto m-0">
                      {tc.actual || '(empty)'}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
