"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"

interface AnalyticsDashboardProps {
  executionHistory: any[]
}

export function AnalyticsDashboard({ executionHistory }: AnalyticsDashboardProps) {
  const algorithmStats = executionHistory.reduce((acc, entry) => {
    const existing = acc.find((s) => s.algorithm === entry.algorithm)
    if (existing) {
      existing.count += 1
      existing.avgRuntime = (existing.avgRuntime * (existing.count - 1) + entry.runtime) / existing.count
      existing.avgNodes = (existing.avgNodes * (existing.count - 1) + entry.nodesExpanded) / existing.count
      existing.lastRuntime = entry.runtime
    } else {
      acc.push({
        algorithm: entry.algorithm,
        count: 1,
        avgRuntime: entry.runtime,
        avgNodes: entry.nodesExpanded,
        lastRuntime: entry.runtime,
      })
    }
    return acc
  }, [] as any[])

  const lastResult = executionHistory[executionHistory.length - 1]

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{lastResult?.runtime.toFixed(2) || "0"}ms</div>
            <div className="text-xs text-muted-foreground">Last Runtime</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent">{lastResult?.nodesExpanded || "0"}</div>
            <div className="text-xs text-muted-foreground">Nodes Expanded</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{executionHistory.length}</div>
            <div className="text-xs text-muted-foreground">Total Executions</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{algorithmStats.length}</div>
            <div className="text-xs text-muted-foreground">Algorithms Used</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Algorithm Performance Comparison */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Algorithm Performance</CardTitle>
            <CardDescription>Runtime comparison from actual executions</CardDescription>
          </CardHeader>
          <CardContent>
            {algorithmStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={algorithmStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(60, 60, 80)" />
                  <XAxis dataKey="algorithm" stroke="rgb(150, 150, 170)" />
                  <YAxis stroke="rgb(150, 150, 170)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgb(30, 30, 50)", border: "1px solid rgb(60, 60, 80)" }}
                    labelStyle={{ color: "rgb(200, 200, 220)" }}
                  />
                  <Legend />
                  <Bar dataKey="avgRuntime" fill="rgb(140, 180, 255)" name="Avg Runtime (ms)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Run algorithms to see performance data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nodes Expanded Comparison */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Search Space Analysis</CardTitle>
            <CardDescription>Nodes expanded vs runtime</CardDescription>
          </CardHeader>
          <CardContent>
            {algorithmStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(60, 60, 80)" />
                  <XAxis dataKey="avgRuntime" stroke="rgb(150, 150, 170)" name="Runtime (ms)" />
                  <YAxis dataKey="avgNodes" stroke="rgb(150, 150, 170)" name="Nodes Expanded" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgb(30, 30, 50)", border: "1px solid rgb(60, 60, 80)" }}
                    labelStyle={{ color: "rgb(200, 200, 220)" }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter name="Algorithms" data={algorithmStats} fill="rgb(140, 180, 255)" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Run algorithms to see analysis
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Execution History</CardTitle>
            <CardDescription>Recent algorithm executions with real data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground">Time</th>
                    <th className="text-left py-2 px-2 text-muted-foreground">Algorithm</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">Runtime (ms)</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">Nodes</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {executionHistory.map((entry, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-2 px-2 text-foreground">{entry.timestamp}</td>
                      <td className="py-2 px-2 text-foreground font-medium">{entry.algorithm}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{entry.runtime.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{entry.nodesExpanded}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{entry.pathCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Algorithm Statistics */}
      {algorithmStats.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Algorithm Statistics</CardTitle>
            <CardDescription>Performance summary from all executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {algorithmStats.map((algo) => (
                <div key={algo.algorithm} className="p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="text-sm font-bold text-foreground mb-2">{algo.algorithm}</div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Executions: {algo.count}</div>
                    <div>Avg Runtime: {algo.avgRuntime.toFixed(2)}ms</div>
                    <div>Avg Nodes: {algo.avgNodes.toFixed(0)}</div>
                    <div>Last: {algo.lastRuntime.toFixed(2)}ms</div>
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
