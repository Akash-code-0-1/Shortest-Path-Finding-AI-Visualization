"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ReplanningMonitorProps {
  replanHistory: any[]
  replanStats: any
}

export function ReplanningMonitor({ replanHistory, replanStats }: ReplanningMonitorProps) {
  return (
    <div className="space-y-6">
      {/* Replanning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{replanStats.totalReplans}</div>
            <div className="text-xs text-muted-foreground">Total Replans</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-accent">{replanStats.avgReplanTime.toFixed(2)}ms</div>
            <div className="text-xs text-muted-foreground">Avg Replan Time</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">{replanStats.pathChanges}</div>
            <div className="text-xs text-muted-foreground">Path Changes</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-500">{replanStats.lastReplanTime.toFixed(2)}ms</div>
            <div className="text-xs text-muted-foreground">Last Replan Time</div>
          </CardContent>
        </Card>
      </div>

      {/* Replanning Timeline */}
      {replanHistory.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Replanning Timeline</CardTitle>
            <CardDescription>Real-time replan performance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={replanHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(60, 60, 80)" />
                <XAxis dataKey="timestamp" stroke="rgb(150, 150, 170)" />
                <YAxis stroke="rgb(150, 150, 170)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgb(30, 30, 50)", border: "1px solid rgb(60, 60, 80)" }}
                  labelStyle={{ color: "rgb(200, 200, 220)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="replanTime"
                  stroke="rgb(140, 180, 255)"
                  strokeWidth={2}
                  name="Replan Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed History */}
      {replanHistory.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Replan History</CardTitle>
            <CardDescription>Recent replanning events with actual data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-muted-foreground">Time</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">Replan Time (ms)</th>
                    <th className="text-right py-2 px-2 text-muted-foreground">Nodes Expanded</th>
                  </tr>
                </thead>
                <tbody>
                  {replanHistory.map((entry, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/20">
                      <td className="py-2 px-2 text-foreground">{entry.timestamp}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{entry.replanTime.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right text-muted-foreground">{entry.nodesExpanded}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Replanning Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Replanning</strong> occurs when obstacles change during pathfinding. The system detects blocked
              paths and finds alternatives.
            </p>
            <p>
              Use the <strong>Dynamic Obstacles</strong> simulator to test how algorithms handle changing environments.
            </p>
            <p>
              <strong>D* Lite</strong> is optimized for incremental replanning and typically performs best in dynamic
              scenarios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
