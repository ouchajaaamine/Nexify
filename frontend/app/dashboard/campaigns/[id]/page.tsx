"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { fetchCampaign, API_BASE_URL } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChatInterface } from "@/components/ai/chat-interface"
import { ArrowLeft, DollarSign, TrendingUp, Users, Activity, Calendar, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

export default function CampaignDetailPage() {
  const params = useParams()
  const campaignId = Number.parseInt(params.id as string)
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any[]>([])
  const [affiliates, setAffiliates] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      try {
        const campaignData = await fetchCampaign(campaignId)
        setCampaign(campaignData)

        const totalRevenueNum = Number(campaignData.totalRevenue ?? campaignData.revenue ?? 0)
        const roiPercentageNum = Number(campaignData.roiPercentage ?? campaignData.roi ?? 0)

        setCampaign((prev: any) => ({
          ...prev,
          totalRevenue: totalRevenueNum,
          roiPercentage: roiPercentageNum,
          revenue: totalRevenueNum,
          revenueNumber: totalRevenueNum,
          roiNumber: roiPercentageNum,
        }))

        const fetchIri = async (iri: string) => {
          try {
            const url = iri.startsWith('http') ? iri : `${API_BASE_URL}${iri}`
            const res = await fetch(url)
            if (!res.ok) return null
            return await res.json()
          } catch (e) {
            return null
          }
        }

        setMetrics(campaignData.metrics || [])

        if (Array.isArray(campaignData.affiliates) && campaignData.affiliates.length) {
          const affiliatesData = await Promise.all(campaignData.affiliates.map((iri: string) => fetchIri(iri)))
          setAffiliates(affiliatesData.filter(Boolean))
        }

      } catch (error) {
        console.error("[v0] Error loading campaign details:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [campaignId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading campaign details...</div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Campaign not found</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'active': return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 'completed': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      case 'draft': return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      default: return 'bg-muted/10 text-muted-foreground border-muted/20'
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-background via-background to-muted/5">
        <Link href="/dashboard/campaigns">
          <Button variant="ghost" className="mb-6 gap-2 hover:gap-3 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Button>
        </Link>

        <div className="space-y-8">
  
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border border-border/60 p-8 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={`${getStatusColor(campaign.status)} border px-3 py-1`}>
                    {campaign.status}
                  </Badge>
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-3">{campaign.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(campaign.startDate).toLocaleDateString()}</span>
                  </div>
                  <span>→</span>
                  <span>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}</span>
                </div>
              </div>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 shadow-inner">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Budget</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{formatCurrency(campaign.budget)}</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 p-4 shadow-inner">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Revenue Generated</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(campaign.totalRevenue || 0)}</p>
                </div>
              </div>
            </Card>

            <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 p-4 shadow-inner">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Return on Investment</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{campaign.roiPercentage?.toFixed(2) || '0.00'}%</p>
                </div>
              </div>
            </Card>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Budget Overview</h3>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{campaign.roiPercentage?.toFixed(2) || '0.00'}%</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(campaign.totalRevenue ?? campaign.revenue ?? 0)} 
                        <span className="text-lg text-muted-foreground font-normal"> / {formatCurrency(Number(campaign.budget) ?? 0)}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-1">Current ROI</p>
                    <p className="text-2xl font-bold text-blue-600">{campaign.roiPercentage?.toFixed(2) || '0.00'}%</p>
                  </div>
                </div>

                {Number(campaign.budget) > 0 ? (
                    (() => {
                    const percent = Math.min(100, Math.round((((campaign.totalRevenue ?? campaign.revenue ?? 0) as number) / Number(campaign.budget || 0)) * 100))
                    return (
                      <div>
                        <div className="relative w-full bg-muted/20 h-4 rounded-full overflow-hidden">
                          <div 
                            className="h-4 rounded-full bg-gradient-to-r from-emerald-400 via-blue-500 to-primary shadow-lg transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm text-muted-foreground">{percent}% of budget utilized</p>
                          <p className="text-sm font-medium text-foreground">{formatCurrency(Number(campaign.budget || 0) - (campaign.totalRevenue ?? campaign.revenue ?? 0))} remaining</p>
                        </div>
                      </div>
                    )
                  })()
                ) : (
                  <p className="text-sm text-muted-foreground">No budget set for this campaign</p>
                )}
              </Card>


              <Card className="p-8 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Performance Metrics</h3>
                  </div>
                  {metrics.length > 0 && (
                    <Badge variant="secondary" className="px-3">
                      {metrics.length} entries
                    </Badge>
                  )}
                </div>

                {metrics.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 rounded-full bg-muted/20 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Activity className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No metric entries available yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Metrics will appear as the campaign progresses</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {metrics.slice().reverse().slice(0,6).map((m:any) => (
                      <div 
                        key={m.id || m['@id'] || Math.random()} 
                        className="p-5 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-sm rounded-xl border border-border/40 hover:border-border/60 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-muted-foreground font-medium">
                            {m.timestamp ? new Date(m.timestamp).toLocaleDateString() : (m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—')}
                          </p>
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Clicks</p>
                            <p className="text-xl font-bold text-foreground">{m.clicks ?? 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Conv.</p>
                            <p className="text-xl font-bold text-foreground">{m.conversions ?? 0}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                            <p className="text-xl font-bold text-emerald-600">{formatCurrency(m.revenue || 0)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>


            <div className="space-y-6">
              
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Affiliates</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {affiliates.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-2">No affiliates linked yet</p>
                  ) : (
                    affiliates.map((a:any) => (
                      <span 
                        key={a.id || a['@id'] || Math.random()} 
                        className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-sm font-medium text-foreground hover:bg-primary/15 transition-colors"
                      >
                        {a.name || a.company || a.title || (typeof a === 'string' ? a.split('/').pop() : a['@id']?.split('/').pop() || 'Affiliate')}
                      </span>
                    ))
                  )}
                </div>
              </Card>

              
              <Card className="p-6 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 shadow-lg">
                <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                  <Link 
                    href={`/dashboard/campaigns/${campaignId}/edit`} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group"
                  >
                    <span className="text-sm font-medium text-primary">Edit Campaign</span>
                    <ArrowLeft className="h-4 w-4 text-primary rotate-180 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors group text-left">
                    <span className="text-sm font-medium text-muted-foreground">View Raw JSON</span>
                    <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      
      <div className="w-[400px] border-l border-border bg-gradient-to-b from-sidebar/40 to-sidebar/20 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Campaign Assistant</h2>
        </div>
        <ChatInterface campaignId={campaignId} className="h-[calc(100vh-120px)]" />
      </div>
    </div>
  )
}