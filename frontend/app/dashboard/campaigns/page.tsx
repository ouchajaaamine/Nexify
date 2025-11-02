"use client"

import { useEffect, useState } from "react"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { fetchCampaigns, fetchMetrics, createCampaign, updateCampaign, deleteCampaign } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Search, Filter, SortAsc, Grid3X3, List, TrendingUp, DollarSign, Calendar, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/lib/utils"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<"name" | "budget" | "date" | "status">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [budgetFilter, setBudgetFilter] = useState<"all" | "low" | "medium" | "high">("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "draft"
  })
  
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        const [campaignsData, metricsData] = await Promise.all([fetchCampaigns(), fetchMetrics()])
        setCampaigns(campaignsData)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const campaignsWithMetrics = campaigns.map((campaign) => {
    return {
      ...campaign,
      budget: `$${campaign.budget}`,
      revenueNumber: Number(campaign.totalRevenue ?? 0),
      revenue: formatCurrency(Number(campaign.totalRevenue ?? 0)),
      roiNumber: Number(campaign.roiPercentage ?? 0),
      roi: `${Number(campaign.roiPercentage ?? 0).toFixed(2)}%`,
    }
  })

  const filteredCampaigns = campaignsWithMetrics
    .filter((campaign) => {
      if (statusFilter !== "all" && campaign.status !== statusFilter) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (!campaign.name.toLowerCase().includes(query)) return false
      }

      const budgetValue = parseFloat(campaign.budget.replace('$', '').replace(',', ''))
      if (budgetFilter === "low" && budgetValue >= 1000) return false
      if (budgetFilter === "medium" && (budgetValue < 1000 || budgetValue >= 10000)) return false
      if (budgetFilter === "high" && budgetValue < 10000) return false

      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "budget":
          aValue = parseFloat(a.budget.replace('$', '').replace(',', ''))
          bValue = parseFloat(b.budget.replace('$', '').replace(',', ''))
          break
        case "date":
          aValue = new Date(a.startDate).getTime()
          bValue = new Date(b.startDate).getTime()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
      }
    })

  const handleEdit = (campaign: any) => {
    const originalCampaign = campaigns.find(c => c.id === campaign.id)
    
    setEditingCampaign(originalCampaign)
    setFormData({
      name: originalCampaign.name,
      budget: originalCampaign.budget.toString(),
      startDate: originalCampaign.startDate.split('T')[0],
      endDate: originalCampaign.endDate ? originalCampaign.endDate.split('T')[0] : "",
      status: originalCampaign.status
    })
    setEditModalOpen(true)
  }

  const handleRowClick = (campaignId: number, e: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    router.push(`/dashboard/campaigns/${campaignId}`)
  }

  const handleDelete = async (campaignId: number) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(campaignId)
        setCampaigns(campaigns.filter(c => c.id !== campaignId))
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete campaign",
          variant: "destructive",
        })
      }
    }
  }

  const handleCreate = () => {
    setFormData({
      name: "",
      budget: "",
      startDate: "",
      endDate: "",
      status: "draft"
    })
    setCreateModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Campaign name is required",
        variant: "destructive",
      })
      return
    }
    
    const budgetValue = parseFloat(formData.budget)
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast({
        title: "Validation Error", 
        description: "Budget must be a positive number",
        variant: "destructive",
      })
      return
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      toast({
        title: "Validation Error",
        description: "End date must be after or equal to start date",
        variant: "destructive",
      })
      return
    }
    
    try {
      const data = {
        name: formData.name.trim(),
        budget: budgetValue.toString(),
        startDate: formData.startDate + 'T00:00:00.000Z',
        endDate: formData.endDate ? formData.endDate + 'T23:59:59.000Z' : null,
        status: formData.status
      }

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, data)
        setCampaigns(campaigns.map(c => 
          c.id === editingCampaign.id ? { ...c, ...data } : c
        ))
        setEditModalOpen(false)
        setEditingCampaign(null)
        toast({
          title: "Success",
          description: "Campaign updated successfully",
        })
      } else {
        const newCampaign = await createCampaign(data)
        setCampaigns([...campaigns, newCampaign])
        setCreateModalOpen(false)
        toast({
          title: "Success",
          description: "Campaign created successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: editingCampaign ? "Failed to update campaign" : "Failed to create campaign",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-background via-background/90 to-background/70 rounded-2xl shadow-inner">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="h-10 w-10 rounded-xl bg-primary/10 backdrop-blur-sm flex items-center justify-center shadow-sm"
          >
            <Target className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Campaigns
            </h1>
            <p className="text-sm text-muted-foreground">
              {filteredCampaigns.length} active campaign{filteredCampaigns.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {campaigns.length > 0 && (
            <>
              <div className="relative flex-1 sm:flex-initial sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg border-border/60 focus:border-primary focus:ring-primary/30 transition-all"
                />
              </div>

      
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={budgetFilter} onValueChange={(value: any) => setBudgetFilter(value)}>
                  <SelectTrigger className="w-36 h-9">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Budgets</SelectItem>
                    <SelectItem value="low">Low (&lt; $1K)</SelectItem>
                    <SelectItem value="medium">$1K - $10K</SelectItem>
                    <SelectItem value="high">&gt; $10K</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 h-9">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="budget">Budget</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-9 px-3"
                >
                  <SortAsc className={`h-4 w-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                </Button>

                <div className="flex border rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-9 px-3 rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="h-9 px-3 rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
          <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 rounded-lg bg-primary hover:bg-primary/90 shadow-md transition-all">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Campaign</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget">Budget</Label>
                    <Input
                      id="edit-budget"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-startDate">Start Date</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Campaign
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>

      
      <div className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold">{filteredCampaigns.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Campaigns</p>
                <p className="text-2xl font-bold">{filteredCampaigns.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredCampaigns.reduce((sum, c) => sum + parseFloat(c.budget.replace('$', '').replace(',', '')), 0))}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">
                  {filteredCampaigns.filter(c => {
                    const startDate = new Date(c.startDate)
                    const now = new Date()
                    return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {statusFilter === "all" ? "No campaigns yet" : `No ${statusFilter} campaigns`}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {statusFilter === "all" 
                ? "Create your first campaign to start tracking your marketing performance." 
                : `You don't have any campaigns with ${statusFilter} status.`
              }
            </p>
            {statusFilter === "all" && (
              <Button size="lg" onClick={handleCreate} className="gap-2">
                <Plus className="h-5 w-5" />
                Create First Campaign
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">Campaign</th>
                    <th className="text-left p-4 font-medium">Budget</th>
                    <th className="text-left p-4 font-medium">Revenue</th>
                    <th className="text-left p-4 font-medium">ROI</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Start Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => (
                    <tr 
                      key={campaign.id} 
                      className="border-t hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={(e) => handleRowClick(campaign.id, e)}
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{campaign.name}</p>
                        </div>
                      </td>
                      <td className="p-4 font-medium">{campaign.budget}</td>
                      <td className="p-4">{formatCurrency(campaign.revenueNumber || 0)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.roiNumber > 100 ? 'bg-green-100 text-green-800' :
                          campaign.roiNumber > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {campaign.roi}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(campaign.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(campaign)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(campaign.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}