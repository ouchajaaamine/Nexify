"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Mail, Calendar, Users, Search, ArrowRight, Sparkles, Edit, Trash2, Filter, SortAsc, Grid3X3, List } from "lucide-react"
import { fetchAffiliates, createAffiliate, updateAffiliate, deleteAffiliate, fetchCampaigns } from "@/lib/api"
import type { Affiliate } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function AffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "date" | "campaigns">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [filterBy, setFilterBy] = useState<"all" | "with-campaigns" | "without-campaigns">("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    campaignIds: [] as number[]
  })

  useEffect(() => {
    fetchAffiliates()
      .then(setAffiliates)
      .finally(() => setLoading(false))

    fetchCampaigns()
      .then(setCampaigns)
  }, [])

  const handleOpenModal = (affiliate?: Affiliate) => {
    if (affiliate) {
      setEditingAffiliate(affiliate)
      setFormData({
        name: affiliate.name,
        email: affiliate.email,
        campaignIds: affiliate.campaigns?.map((c: string) => parseInt(c.split('/').pop() || '0')) || []
      })
    } else {
      setEditingAffiliate(null)
      setFormData({
        name: "",
        email: "",
        campaignIds: []
      })
    }
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const baseData = {
      name: formData.name,
      email: formData.email,
    }
    const data = {
      ...baseData,
      campaigns: formData.campaignIds.map(id => `/api/campaigns/${id}`)
    }
    try {
      if (editingAffiliate) {
        const updated = await updateAffiliate(editingAffiliate.id, data)
        setAffiliates(affiliates.map(a => a.id === editingAffiliate.id ? updated : a))
      } else {
        const created = await createAffiliate(data)
        setAffiliates([...affiliates, created])
      }
      setModalOpen(false)
    } catch (error) {
      alert("Failed to save affiliate. Please try again.")
    }
  }

  const handleDelete = async (affiliate: Affiliate) => {
    if (!confirm("Are you sure you want to delete this affiliate?")) return
    try {
      await deleteAffiliate(affiliate.id)
      setAffiliates(affiliates.filter(a => a.id !== affiliate.id))
    } catch (error) {
      alert("Failed to delete affiliate. Please try again.")
    }
  }

  const filteredAffiliates = affiliates
    .filter((affiliate) => {
    
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = affiliate.name.toLowerCase().includes(query) ||
                             affiliate.email.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

    
      const campaignCount = affiliate.campaigns?.length || 0
      if (filterBy === "with-campaigns" && campaignCount === 0) return false
      if (filterBy === "without-campaigns" && campaignCount > 0) return false

      return true
    })
    .sort((a, b) => {
      let aValue: any, bValue: any

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "date":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "campaigns":
          aValue = a.campaigns?.length || 0
          bValue = b.campaigns?.length || 0
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

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
            <Users className="h-5 w-5 text-primary" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Affiliates
            </h1>
            <p className="text-sm text-muted-foreground">
              {affiliates.length} partner{affiliates.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {affiliates.length > 0 && (
            <>
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search affiliates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-lg border-border/60 focus:border-primary focus:ring-primary/30 transition-all"
                />
              </div>

        
              <div className="flex items-center gap-2">
                <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                  <SelectTrigger className="w-40 h-9">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Affiliates</SelectItem>
                    <SelectItem value="with-campaigns">With Campaigns</SelectItem>
                    <SelectItem value="without-campaigns">Without Campaigns</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 h-9">
                    <SortAsc className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="campaigns">Campaigns</SelectItem>
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
          <Button size="sm" className="gap-2 rounded-lg bg-primary hover:bg-primary/90 shadow-md transition-all" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" />
            New Affiliate
          </Button>
        </div>
      </div>


      {affiliates.length === 0 ? (
        <Card className="relative overflow-hidden border-2 border-dashed shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative mb-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow">
                <Sparkles className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Build Your Affiliate Network
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Add your first partner and start expanding your business connections
            </p>
            <Link href="/dashboard/affiliates/new">
              <Button className="gap-2 rounded-lg shadow-md">
                <Plus className="h-4 w-4" />
                Add First Affiliate
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredAffiliates.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No matches found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search</p>
          </div>
        </Card>
      ) : (
        <>
    
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Affiliates</p>
                  <p className="text-2xl font-bold">{filteredAffiliates.length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">With Campaigns</p>
                  <p className="text-2xl font-bold">{filteredAffiliates.filter(a => (a.campaigns?.length || 0) > 0).length}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Recently Added</p>
                  <p className="text-2xl font-bold">
                    {filteredAffiliates.filter(a => {
                      const daysSinceCreation = (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24)
                      return daysSinceCreation <= 30
                    }).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {viewMode === "grid" ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredAffiliates.map((affiliate, index) => (
                <motion.div
                  key={affiliate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/affiliates/${affiliate.id}`}>
                    <Card className="group relative border border-border/60 hover:border-primary/40 bg-card/80 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden rounded-xl">
                      <div className="flex items-center gap-4 p-5">
      
                        <div className="relative shrink-0">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-lg font-bold text-primary">
                              {affiliate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
                        </div>

      
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {affiliate.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {affiliate.campaigns?.length || 0} campaigns
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{affiliate.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(affiliate.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

      
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleOpenModal(affiliate)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleDelete(affiliate)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

      
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </motion.div>
                      </div>

    
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Affiliate</th>
                      <th className="text-left p-4 font-medium">Email</th>
                      <th className="text-left p-4 font-medium">Campaigns</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAffiliates.map((affiliate, index) => (
                      <tr key={affiliate.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <Link href={`/dashboard/affiliates/${affiliate.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                              <span className="font-bold text-primary">
                                {affiliate.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium">{affiliate.name}</span>
                          </Link>
                        </td>
                        <td className="p-4 text-muted-foreground">{affiliate.email}</td>
                        <td className="p-4">
                          <Badge variant={(affiliate.campaigns?.length || 0) > 0 ? "default" : "secondary"}>
                            {affiliate.campaigns?.length || 0}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(affiliate.createdAt).toLocaleDateString("en-US", {
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
                              onClick={() => handleOpenModal(affiliate)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(affiliate)}
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
            </Card>
          )}
        </>
      )}
      
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? "Edit Affiliate" : "New Affiliate"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="campaigns">Associated Campaigns</Label>
              <div className="space-y-2">
                {campaigns.map((campaign) => (
                  <label key={campaign.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.campaignIds.includes(campaign.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, campaignIds: [...formData.campaignIds, campaign.id] })
                        } else {
                          setFormData({ ...formData, campaignIds: formData.campaignIds.filter(id => id !== campaign.id) })
                        }
                      }}
                    />
                    <span>{campaign.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full">
              {editingAffiliate ? "Update" : "Create"} Affiliate
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
