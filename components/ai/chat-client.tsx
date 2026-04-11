'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Send,
  Sparkles,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const QUICK_PROMPTS = [
  'Quelle est la procedure de maintenance pour...',
  'Diagnostiquer une panne sur...',
  'Quelles pieces de rechange pour...',
  'Planifier la maintenance preventive de...',
]

const fadeIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-start gap-3"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100">
        <Brain className="size-4 text-stone-500" />
      </div>
      <div className="rounded-xl rounded-tl-sm bg-stone-100 px-4 py-3">
        <div className="flex gap-1.5">
          <motion.span
            className="size-2 rounded-full bg-stone-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
          />
          <motion.span
            className="size-2 rounded-full bg-stone-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
          />
          <motion.span
            className="size-2 rounded-full bg-stone-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      {...fadeIn}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
        isUser ? 'bg-red-600' : 'bg-stone-100'
      }`}>
        {isUser ? (
          <span className="text-xs font-bold text-white">U</span>
        ) : (
          <Brain className="size-4 text-stone-500" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-sm bg-red-600 text-white'
            : 'rounded-tl-sm bg-stone-100 text-stone-800'
        }`}
      >
        {String(message.content || '').split('\n').map((line, i) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} className="font-semibold">
                {line.replace(/\*\*/g, '')}
              </p>
            )
          }
          // Handle bold inline
          const parts = line.split(/(\*\*.*?\*\*)/)
          return (
            <p key={i} className={line === '' ? 'h-2' : ''}>
              {parts.map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j}>{part.replace(/\*\*/g, '')}</strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          )
        })}
      </div>
    </motion.div>
  )
}

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const chatHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      })

      if (!res.ok) throw new Error('Erreur reseau')

      const data = await res.json()
      const aiText = typeof data.response === 'string'
        ? data.response
        : data.response?.response || data.response?.error || 'Reponse indisponible.'

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiText,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Desole, une erreur est survenue. Veuillez reessayer.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100dvh-8rem)] flex-col md:h-[calc(100dvh-6rem)]"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700">
          <Brain className="size-5 text-white" />
        </div>
        <div>
          <h1 className="font-heading text-2xl text-stone-900">Assistant IA Maintenance</h1>
          <p className="text-sm text-stone-500">Posez vos questions sur la maintenance industrielle</p>
        </div>
      </div>

      {/* Chat area */}
      <Card className="flex min-h-0 flex-1 flex-col">
        {/* Messages */}
        <CardContent className="flex-1 space-y-4 overflow-y-auto pt-4">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-stone-100">
                <Sparkles className="size-8 text-stone-400" />
              </div>
              <h3 className="font-heading text-lg text-stone-900">
                Comment puis-je vous aider ?
              </h3>
              <p className="mt-1 max-w-md text-sm text-stone-500">
                Je suis votre assistant IA specialise en maintenance industrielle.
                Posez-moi vos questions ou utilisez les suggestions ci-dessous.
              </p>

              {/* Quick prompts */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator key="typing" />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Quick prompts when chat has started */}
        {messages.length > 0 && messages.length <= 2 && (
          <div className="border-t px-4 py-2">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input bar */}
        <div className="border-t p-3">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tapez votre message..."
              disabled={isLoading}
              className="h-9 w-full min-w-0 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none transition-colors placeholder:text-stone-400 focus:border-red-300 focus:ring-2 focus:ring-red-100 disabled:opacity-50"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  )
}
