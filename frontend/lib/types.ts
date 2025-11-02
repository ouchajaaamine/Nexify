export type CampaignStatus = "draft" | "active" | "paused" | "completed"

export interface Campaign {
  id: number
  name: string
  budget: string
  startDate: string
  endDate: string
  status: CampaignStatus
  createdAt: string
  updatedAt: string
  metrics?: string[]
  affiliates?: string[]
  revenue?: number  // Added revenue field from backend
  roi?: number      // Added ROI field from backend
}

export interface Metric {
  id: number
  campaignId: number
  clicks: number
  conversions: number
  revenue: string
  date: string
  timestamp: string  // ISO date string from backend
  name: string
  value: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Affiliate {
  id: number
  name: string
  email: string
  campaigns: string[]
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface ChatResponse {
  response: string
  timestamp: string
  campaignId: number
}
