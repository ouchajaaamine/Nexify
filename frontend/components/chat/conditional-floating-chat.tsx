"use client"

import { usePathname } from "next/navigation"
import FloatingChat from "./floating-chat"

export default function ConditionalFloatingChat() {
  const pathname = usePathname()
  
  if (pathname === "/login") {
    return null
  }
  
  return <FloatingChat />
}
