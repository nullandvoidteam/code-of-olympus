import React, { useState, useEffect, useRef } from 'react'
import { LumiPixelBot } from '../brand/PixelArtAvatars'
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { askLumi, getLumiConfig, type LumiChatMessage } from '../../lib/lumiAi'

export const LumiAIFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMsg, setInputMsg] = useState('')
  const [messages, setMessages] = useState<LumiChatMessage[]>([
    {
      role: 'lumi',
      text: "Beep boop! 🤖 I'm Lumi, your personal coding mentor. Ask me questions, navigate the platform, or ask what to do next!",
      time: 'Just now',
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const [activeModel, setActiveModel] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const quickPrompts = [
    'What should I do next? 🎯',
    'Where do I find projects? 🛠️',
    'Explain Python loops simply 🐍',
    'How do I test in The Crucible? ⚔️',
  ]

  useEffect(() => {
    const config = getLumiConfig()
    setActiveModel(config.activeModelName)
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Custom event listener so other components can trigger Lumi with a prompt
  useEffect(() => {
    const handleOpenLumiEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>
      setIsOpen(true)
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt)
      }
    }

    window.addEventListener('open-lumi', handleOpenLumiEvent)
    return () => {
      window.removeEventListener('open-lumi', handleOpenLumiEvent)
    }
  }, [messages])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMsg).trim()
    if (!text || isTyping) return

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMessage: LumiChatMessage = {
      role: 'user',
      text,
      time: currentTime,
    }

    const nextHistory = [...messages, userMessage]
    setMessages(nextHistory)
    if (!textToSend) setInputMsg('')
    setIsTyping(true)

    try {
      const response = await askLumi(text, nextHistory)
      if (response.modelName && response.modelName !== 'None') {
        setActiveModel(response.modelName)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'lumi',
          text: response.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'lumi',
          text: "🤖 Oops! Encountered an issue connecting to AI. Please verify your API key in `.env`.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        role: 'lumi',
        text: "Beep boop! 🤖 Chat reset. How can I help you conquer your next quest?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  // Format message text with markdown code block support
  const renderMessageContent = (content: string) => {
    const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index))
      }
      const lang = match[1] || 'code'
      const code = match[2].trimEnd()
      parts.push(
        <div key={match.index} className="my-1.5 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 font-mono text-[11px]">
          <div className="bg-slate-800 px-2 py-0.5 text-[9px] text-slate-400 uppercase tracking-wider font-bold flex justify-between items-center">
            <span>{lang}</span>
          </div>
          <pre className="p-2 overflow-x-auto whitespace-pre leading-snug">
            <code>{code}</code>
          </pre>
        </div>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex))
    }

    return parts.map((part, i) =>
      typeof part === 'string' ? (
        <span key={i} className="whitespace-pre-wrap">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <>
      {/* 1. Floating Trigger Button */}
      <div className={cn("fixed bottom-20 md:bottom-6 right-6 z-40 select-none", isOpen ? "hidden sm:block" : "block")}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "group flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] active:bg-emerald-800 text-white shadow-[0_6px_20px_rgba(16,185,129,0.35)] border border-emerald-400/80 transition-all duration-300 cursor-pointer",
            isOpen && "scale-95 bg-slate-900 border-slate-700 hover:bg-slate-800"
          )}
          title="Ask Lumi AI Mentor"
        >
          <img src="/extracted/lumi_bot.png" alt="Lumi" className="w-6 h-6 object-contain" />
          <span className="font-bold text-xs tracking-wide pr-0.5">
            {isOpen ? 'Close' : 'Ask Lumi'}
          </span>
          {!isOpen && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          )}
        </button>
      </div>

      {/* 2. Slide-out Interactive AI Mentor Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] w-full h-[100dvh] bg-white shadow-2xl flex flex-col overflow-hidden text-left animate-in fade-in slide-in-from-bottom-5 duration-200 sm:bottom-20 sm:right-6 sm:w-96 sm:h-[540px] sm:inset-auto sm:z-50 sm:rounded-3xl sm:border-2 sm:border-[#ece7df]">
          {/* Drawer Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <LumiPixelBot size={28} glowing={false} />
              <div>
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>Lumi AI Mentor</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-400/30 text-emerald-100 text-[8px] font-pixel uppercase tracking-wide">
                    {activeModel || 'ONLINE'}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-100/80 font-medium flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Code of Olympus AI Guide</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#faf8f4]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex flex-col max-w-[88%] text-xs",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-2.5 rounded-2xl leading-relaxed shadow-xs",
                    m.role === 'user'
                      ? "bg-emerald-600 text-white rounded-br-xs"
                      : "bg-white text-stone-800 border border-[#ece7df] rounded-bl-xs font-sans"
                  )}
                >
                  {renderMessageContent(m.text)}
                </div>
                <span className="text-[9px] text-stone-400 mt-0.5 px-1 font-mono">{m.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="mr-auto flex items-center gap-1.5 p-2 rounded-2xl bg-white border border-[#ece7df] text-emerald-600 text-xs shadow-xs">
                <span className="text-[10px] font-medium text-stone-400">Lumi is thinking</span>
                <span className="animate-bounce">●</span>
                <span className="animate-bounce delay-100">●</span>
                <span className="animate-bounce delay-200">●</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-2 bg-white border-t border-[#ece7df] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 text-[10.5px] font-semibold shrink-0 transition-colors cursor-pointer border border-emerald-200/60"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="p-2.5 bg-white border-t border-[#ece7df] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="Ask Lumi (code, courses, next steps...)"
              className="flex-1 h-9 px-3 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim() || isTyping}
              className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
