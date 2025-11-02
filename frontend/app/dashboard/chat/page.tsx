"use client"

import { ChatInterface } from "@/components/ai/chat-interface"

export default function ChatPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Ask questions about your campaigns and get insights</p>
      </div>
      <div className="flex-1 min-h-0">
        <ChatInterface className="h-full" />
      </div>
    </div>
  )
}
