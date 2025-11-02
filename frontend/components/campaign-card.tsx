"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, DollarSign } from "lucide-react"

interface CampaignCardProps {
  campaign: {
    id: number
    name: string
    budget: string
    startDate: string
    endDate: string
    status: string
    clicks?: number
    conversions?: number
    revenue?: string
  }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const statusColors = {
    active: "default",
    paused: "secondary",
    completed: "outline",
    draft: "secondary",
  } as const

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{campaign.name}</h3>
            <Badge variant={statusColors[campaign.status as keyof typeof statusColors]} className="mt-2">
              {campaign.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Budget: {campaign.budget}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {campaign.clicks !== undefined && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Clicks</p>
              <p className="text-lg font-semibold text-foreground">{campaign.clicks}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conversions</p>
              <p className="text-lg font-semibold text-foreground">{campaign.conversions}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-semibold text-primary">{campaign.revenue}</p>
            </div>
          </div>
        )}

        <Link href={`/dashboard/campaigns/${campaign.id}`}>
          <Button className="w-full bg-transparent" variant="outline">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  )
}
