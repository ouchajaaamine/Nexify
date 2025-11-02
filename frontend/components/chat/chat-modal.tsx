"use client"

import { useEffect, useRef, useState } from "react"
import { X, Send } from "lucide-react"
import { sendChatMessage } from "@/lib/api"

export default function ChatModal({ open, onClose, initialCampaignId }: { open: boolean; onClose: () => void; initialCampaignId?: number }) {
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string; ts?: string }[]>([])
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  async function send() {
    const trimmed = text.trim()
    if (!trimmed) return
    const ts = new Date().toISOString()
    setMessages((m) => [...m, { from: "user", text: trimmed, ts }])
    setText("")
    setLoading(true)
    try {
      const res = await sendChatMessage(trimmed, initialCampaignId)
      const bot = res?.answer || res?.response || "No response"
      setMessages((m) => [...m, { from: "bot", text: bot, ts: new Date().toISOString() }])
    } catch (e) {
      setMessages((m) => [...m, { from: "bot", text: "Error contacting chat service.", ts: new Date().toISOString() }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-3xl h-[80vh] rounded-xl bg-popover shadow-2xl ring-1 ring-border/60 overflow-hidden">

        <div className="flex items-center justify-between px-6 py-3 border-b border-border/60 bg-gradient-to-r from-background/60 to-background/40">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-primary/10 p-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-primary"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-12.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Assistant</h3>
              <p className="text-xs text-muted-foreground">Ask about campaigns, revenue, or quick tips</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="p-2 rounded hover:bg-muted/30" aria-label="Close chat">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>


        <div ref={listRef} className="px-6 py-4 overflow-y-auto h-[calc(80vh-180px)] space-y-4 bg-gradient-to-b from-popover to-transparent">
          {messages.length === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-12">
              <p className="mb-2">No messages yet</p>
              <p className="text-xs">Try asking: "How's campaign X performing this month?"</p>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${m.from === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card text-foreground rounded-bl-none"}`}>
                <div className="whitespace-pre-wrap">{m.text}</div>
                {m.ts && <div className="text-[11px] text-muted-foreground mt-2 text-right">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
              </div>
            </div>
          ))}
        </div>


        <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-t from-background/80 to-background/60">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Type your message and press Enter to send. Use Shift+Enter for a new line."
              className="flex-1 min-h-[44px] max-h-32 resize-none rounded-md border px-3 py-2 bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              onClick={send}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
              aria-label="Send message"
            >
              {loading ? <span className="animate-pulse">…</span> : <><Send className="h-4 w-4" />Send</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
