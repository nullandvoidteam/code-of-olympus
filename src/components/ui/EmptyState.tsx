import React from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Data Found",
  message = "There's nothing here yet. Check back later or try exploring somewhere else!",
  icon,
  action,
  className
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <motion.div 
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="mb-6 text-slate-300 bg-slate-50 p-6 rounded-full border-4 border-dashed border-slate-200"
      >
        {icon || <Inbox size={56} strokeWidth={1.5} />}
      </motion.div>
      <h3 className="text-xl font-bold text-slate-800 font-pixel tracking-wide mb-3 uppercase">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mb-6 leading-relaxed">{message}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
