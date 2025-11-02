"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, DollarSign, Edit, Trash2, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"

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
    roi?: string
    revenueNumber?: number
    roiNumber?: number
  }
  onEdit?: (campaign: any) => void
  onDelete?: (campaignId: number) => void
}

export function CampaignCard({ campaign, onEdit, onDelete }: CampaignCardProps) {
  const router = useRouter()

  const statusColors = {
    active: "default",
    paused: "secondary",
    completed: "secondary",
    draft: "secondary",
  } as const

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/dashboard/campaigns/${campaign.id}`)
  }

  return (
    <Card 
      className="group relative overflow-hidden border border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur cursor-pointer"
      onClick={handleCardClick}
    >

      <div className={`absolute top-0 left-0 right-0 h-1 ${
        campaign.status === 'active' ? 'bg-primary' : 
        campaign.status === 'completed' ? 'bg-green-600' : 
        campaign.status === 'draft' ? 'bg-yellow-600' : 'bg-gray-600'
      }`} />
      
      <div className="p-4 space-y-3">

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate mb-1.5">{campaign.name}</h3>
            <Badge
              variant={statusColors[campaign.status as keyof typeof statusColors]}
              className={`text-xs ${campaign.status === 'completed' ? 'bg-green-600 text-white hover:bg-green-700' : ''}`}
            >
              {campaign.status}
            </Badge>
          </div>
          

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <Button
                onClick={() => onEdit(campaign)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(campaign.id)}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>


        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <DollarSign className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{campaign.budget}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {new Date(campaign.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(campaign.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>


        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Revenue</p>
            <p className="text-sm font-semibold text-primary">{campaign.revenue ?? "$0.00"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-0.5">ROI</p>
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-3 w-3 ${campaign.roiNumber && campaign.roiNumber > 0 ? 'text-green-600' : 'text-red-600'}`} />
              <p className={`text-sm font-semibold ${campaign.roiNumber && campaign.roiNumber > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {campaign.roi ?? '0.00%'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}