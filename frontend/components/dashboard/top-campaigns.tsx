"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Campaign {
  id: number
  name: string
  revenue: number
  clicks: number
  conversions: number
  convRate: string
  cpc: string
  metricsTracked: number
}

interface TopCampaignsProps {
  campaigns: Campaign[]
}

export function TopCampaigns({ campaigns }: TopCampaignsProps) {
  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Campaigns</h3>
      <p className="text-sm text-muted-foreground mb-4">Best performing campaigns by revenue</p>
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 rounded-lg bg-secondary/30 border">
            <Link href={`/dashboard/campaigns/${campaign.id}`} className="block">
              <h4 className="font-medium text-foreground mb-2">{campaign.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">{campaign.metricsTracked} metrics tracked</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">${campaign.revenue.toFixed(2)}</span>
                  <span className="text-muted-foreground ml-1">Revenue</span>
                </div>
                <div>
                  <span className="font-medium">{campaign.clicks.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Clicks</span>
                </div>
                <div>
                  <span className="font-medium">{campaign.conversions}</span>
                  <span className="text-muted-foreground ml-1">Conversions</span>
                </div>
                <div>
                  <span className="font-medium">{campaign.convRate}%</span>
                  <span className="text-muted-foreground ml-1">Conv. Rate</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">${campaign.cpc} per click</p>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  )
}
