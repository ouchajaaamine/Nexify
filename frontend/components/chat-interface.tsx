"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { sendChatMessage } from "@/lib/api"
import { Card } from "@/components/ui/card"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

interface ChatInterfaceProps {
  campaignId?: number
  className?: string
}

export function ChatInterface({ campaignId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const response = await sendChatMessage(content, campaignId)
      const assistantMessage: Message = {
        role: "assistant",
        content: response.response,
        timestamp: response.timestamp,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={`flex flex-col bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start a conversation with the AI assistant
          </div>
        )}
        {messages.map((message, index) => (
          <ChatMessage key={index} {...message} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
              <div className="h-4 w-4 animate-pulse rounded-full bg-secondary-foreground/50" />
            </div>
            <div className="text-sm text-muted-foreground">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-border p-4">
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </Card>
  )
}
