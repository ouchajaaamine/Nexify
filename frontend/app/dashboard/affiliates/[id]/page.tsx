"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Mail, Calendar, Trash2, Edit } from "lucide-react"
import Link from "next/link"
import { fetchAffiliate, deleteAffiliate, fetchCampaign } from "@/lib/api"
import type { Affiliate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function AffiliateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchAffiliate(Number(params.id))
        .then(async (affiliateData) => {
          setAffiliate(affiliateData)
          if (affiliateData.campaigns && affiliateData.campaigns.length > 0) {
            const campaignPromises = affiliateData.campaigns.map((campaignUrl: string) => {
              const id = campaignUrl.split('/').pop()
              return fetchCampaign(Number(id))
            })
            const campaignDetails = await Promise.all(campaignPromises)
            setCampaigns(campaignDetails)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this affiliate?")) return

    setDeleting(true)
    try {
      await deleteAffiliate(Number(params.id))
      router.push("/dashboard/affiliates")
    } catch (error) {
      alert("Failed to delete affiliate. Please try again.")
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!affiliate) {
    return <div>Affiliate not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/affiliates">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{affiliate.name}</h1>
            <p className="text-muted-foreground">Affiliate Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/affiliates">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{affiliate.email}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">{new Date(affiliate.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border bg-card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Badge variant="outline">{affiliate.campaigns?.length || 0}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Campaigns</p>
                <p className="font-medium">Active Campaigns</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-xl font-semibold">Associated Campaigns</h2>
        {campaigns && campaigns.length > 0 ? (
          <div className="space-y-2">
            {campaigns.map((campaign, index) => (
              <Link key={campaign.id} href={`/dashboard/campaigns/${campaign.id}`}>
                <div className="rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">Budget: ${campaign.budget}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No campaigns associated yet</p>
        )}
      </Card>
    </div>
  )
}
