import { getToken, removeToken } from './auth'

export const API_BASE_URL = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL)
  ? process.env.NEXT_PUBLIC_API_BASE_URL
  : (process.env.API_BASE_URL || "http://localhost:8000")

function getAuthHeaders(): HeadersInit {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function handleResponse(response: Response) {
  if (response.status === 401) {
    removeToken()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }
  return response
}

function unwrapCollection(json: any): any[] {
  if (!json) return []
  if (Array.isArray(json["hydra:member"])) return json["hydra:member"]
  if (Array.isArray(json.member)) return json.member
  if (Array.isArray(json)) return json
  return []
}
export async function fetchCampaigns(): Promise<any[]> {
  const response = await handleResponse(await fetch(`${API_BASE_URL}/api/campaigns`, {
    headers: getAuthHeaders()
  }))
  if (!response.ok) throw new Error(`Failed to fetch campaigns: ${response.status}`)
  const data = await response.json()
  return unwrapCollection(data)
}

export async function fetchCampaign(id: number): Promise<any> {
  const response = await handleResponse(await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
    headers: getAuthHeaders()
  }))
  if (!response.ok) throw new Error("Failed to fetch campaign")
  return response.json()
}

export async function createCampaign(data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/campaigns`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create campaign")
  return response.json()
}

export async function updateCampaign(id: number, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update campaign")
  return response.json()
}

export async function deleteCampaign(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/campaigns/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to delete campaign")
}

export async function fetchAffiliates(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/affiliates`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to fetch affiliates")
  const data = await response.json()
  return unwrapCollection(data)
}

export async function fetchAffiliate(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/affiliates/${id}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to fetch affiliate")
  return response.json()
}

export async function createAffiliate(data: { name: string; email: string; campaigns?: string[] }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/affiliates`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create affiliate")
  return response.json()
}

export async function updateAffiliate(id: number, data: { name: string; email: string; campaigns?: string[] }): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/affiliates/${id}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update affiliate")
  return response.json()
}

export async function deleteAffiliate(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/affiliates/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to delete affiliate")
}

export async function fetchMetrics(limit: number = 50): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics?itemsPerPage=${limit}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to fetch metrics")
  const data = await response.json()
  return unwrapCollection(data)
}

export async function fetchTopMetrics(limit: number = 10): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics?itemsPerPage=${limit}&order[timestamp]=desc`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to fetch top metrics")
  const data = await response.json()
  return unwrapCollection(data)
}

export async function fetchMetric(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/${id}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to fetch metric")
  return response.json()
}

export async function createMetric(data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to create metric")
  return response.json()
}

export async function updateMetric(id: number, data: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/${id}`, {
    method: "PATCH",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error("Failed to update metric")
  return response.json()
}

export async function deleteMetric(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error("Failed to delete metric")
}

function extractChatText(data: any): string {
  if (!data) return ""
  if (typeof data === "string") return data
  if (typeof data?.response === "string") return data.response
  const coll = unwrapCollection(data)
  if (Array.isArray(coll) && coll.length > 0) {
    const first = coll[0]
    if (typeof first === "string") return first
    if (first && typeof first.response === "string") return first.response
  }
  if (typeof data?.error?.message === "string") return data.error.message
  if (typeof data?.detail === "string") return data.detail
  return ""
}

export async function sendChatMessage(query: string, campaignId?: number): Promise<{ response: string; timestamp: string }> {
  const response = await fetch(`${API_BASE_URL}/api/chatbot/query`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/ld+json, application/json;q=0.9",
    },
    body: JSON.stringify({ query, campaignId }),
  })
  if (!response.ok) {
    let fallback = "Failed to send message"
    try {
      const errData = await response.json()
      const msg = extractChatText(errData)
      if (msg) fallback = msg
    } catch {}
    throw new Error(fallback)
  }
  let text = ""
  let parsed: any = null
  try {
    parsed = await response.json()
    text = extractChatText(parsed)
  } catch {}
  if (!text || !String(text).trim()) {
    const contentLoc = response.headers.get("Content-Location") || response.headers.get("Location")
    if (contentLoc) {
      const absolute = contentLoc.startsWith("http") ? contentLoc : `${API_BASE_URL}${contentLoc}`
      try {
        const follow = await fetch(absolute, { headers: { Accept: "application/ld+json, application/json;q=0.9" } })
        if (follow.ok) {
          const followData = await follow.json()
          text = extractChatText(followData) || text
        }
      } catch {}
    }
  }
  if (!text || !String(text).trim()) {
    text = "I'm here, but I didn't receive any content to display. Please try asking again."
  }
  return { response: text, timestamp: new Date().toISOString() }
}
