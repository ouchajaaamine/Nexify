"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: string
}

export function StatsCard({ title, value, icon: Icon, trend }: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const numericValue = typeof value === "string" ? Number.parseFloat(value.replace(/[^0-9.-]+/g, "")) : value

  useEffect(() => {
    if (isNaN(numericValue)) return

    const duration = 1000
    const steps = 30
    const increment = numericValue / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= numericValue) {
        setDisplayValue(numericValue)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [numericValue])

  const formatValue = () => {
    if (typeof value === "string" && value.includes("$")) {
      return `$${displayValue.toLocaleString()}`
    }
    if (typeof value === "string" && value.includes("%")) {
      return `${displayValue}%`
    }
    return displayValue.toLocaleString()
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-foreground">{formatValue()}</h3>
          {trend && <p className="mt-1 text-sm text-primary">{trend}</p>}
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </Card>
  )
}
