"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import dynamic from "next/dynamic"

const ChatModal = dynamic(() => import("./chat-modal"), { ssr: false })

export default function FloatingChat({ initialCampaignId }: { initialCampaignId?: number }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ChatModal open={open} onClose={() => setOpen(false)} initialCampaignId={initialCampaignId} />

      <button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg text-primary-foreground hover:scale-105 transition-transform"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </>
  )
}
