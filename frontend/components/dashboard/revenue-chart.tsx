"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: Array<{ date: string; revenue: number }>
}
export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="p-6 bg-card backdrop-blur-sm border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">Revenue Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" stroke="hsl(var(--foreground))" fontSize={12} tick={{ fill: "#ffffff" }} />
          <YAxis 
            stroke="hsl(var(--foreground))" 
            fontSize={12} 
            tick={{ fill: "#ffffff" }} 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            domain={[0, 50000]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
