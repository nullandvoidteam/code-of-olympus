import React from 'react'
import { motion } from 'framer-motion'
import { ShieldAlert, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { GamifiedButton } from './GamifiedButton'

export interface ErrorStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  onRetry?: () => void
  action?: React.ReactNode
  className?: string
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We encountered an unexpected error while loading this content.",
  icon,
  onRetry,
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="mb-6 text-rose-500 bg-rose-50 p-6 rounded-3xl border-4 border-rose-200"
      >
        {icon || <ShieldAlert size={56} strokeWidth={1.5} />}
      </motion.div>
      <h3 className="text-xl font-bold text-rose-600 font-pixel tracking-wide mb-3 uppercase">{title}</h3>
      <p className="text-sm text-slate-600 max-w-md mb-8 leading-relaxed">{message}</p>
      
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {onRetry && (
          <GamifiedButton variant="secondary" onClick={onRetry} className="gap-2">
            <RefreshCw size={16} />
            Try Again
          </GamifiedButton>
        )}
        {action}
      </div>
    </div>
  )
}

export default ErrorState
