"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, Zap, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Metric {
  id: number
  name: string
  value: string
  clicks: number
  conversions: number
  revenue: string
  timestamp: string
  campaignId: number
}

interface MetricsOverviewProps {
  metrics: Metric[]
  campaigns: any[]
}

export function MetricsOverview({ metrics, campaigns }: MetricsOverviewProps) {
  // Calculate aggregate stats from metrics
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0)
  const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0)

  // Get top 3 campaigns by revenue from campaign data directly
  const topCampaigns = campaigns
    .filter(c => c.revenue && c.revenue > 0)
    .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
    .slice(0, 3)
    .map(c => ({
      id: c.id,
      name: c.name,
      revenue: c.revenue || 0
    }))

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-200/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{totalClicks.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-200/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{totalConversions.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {((totalConversions / totalClicks) * 100).toFixed(2)}% conversion rate
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>


      {topCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performing Campaigns
            </CardTitle>
            <CardDescription>Best performing campaigns by revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 border border-border rounded-lg hover:bg-accent/50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                      <p className="text-xs text-muted-foreground">Campaign data</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatCurrency(campaign.revenue || 0)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
