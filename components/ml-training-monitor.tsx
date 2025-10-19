"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface MLTrainingMonitorProps {
  trainingMetrics: any
  algorithmWeights: any
  algorithmInsights?: any[]
}

export function MLTrainingMonitor({
  trainingMetrics,
  algorithmWeights,
  algorithmInsights = [],
}: MLTrainingMonitorProps) {
  const [trainingData, setTrainingData] = useState<any[]>([])

  useEffect(() => {
    setTrainingData((prev) => {
      const newData = {
        epoch: prev.length + 1,
        accuracy: Math.round(trainingMetrics.accuracy * 1000) / 1000,
        loss: Math.round(trainingMetrics.loss * 1000) / 1000,
        confidence: Math.round(trainingMetrics.recommendationConfidence * 1000) / 1000,
        samples: trainingMetrics.totalSamples,
      }
      return [...prev.slice(-24), newData]
    })
  }, [trainingMetrics.totalSamples, trainingMetrics.recommendationConfidence])

  const confidence = Math.min(0.99, Math.max(0.5, trainingMetrics.recommendationConfidence || 0.5))
  const confidencePercent = (confidence * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* AI Model Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">🤖 Advanced ML Model Overview</CardTitle>
          <CardDescription>Ensemble Learning System (Decision Tree + Naive Bayes + KNN)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Model Type:</strong> Ensemble ML System with Decision Tree, Naive Bayes & K-Nearest Neighbors
            </p>
            <p>
              <strong>How It Works:</strong> Three ML models work together - Decision Tree learns decision boundaries,
              Naive Bayes calculates probabilities, and KNN finds similar past scenarios. They vote on the best
              algorithm, with confidence increasing as they agree more and learn from more executions.
            </p>
            <p>
              <strong>Best Algorithm:</strong>{" "}
              <span className="text-primary font-semibold">{trainingMetrics.bestAlgorithm}</span> (Confidence:{" "}
              <span className="text-green-500 font-bold">{confidencePercent}%</span>) | Samples Learned:{" "}
              <span className="text-blue-500 font-bold">{trainingMetrics.totalSamples}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Model Performance */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Model Performance</CardTitle>
          <CardDescription>Real-time learning metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Accuracy</div>
              <div className="text-2xl font-bold text-green-500">{(trainingMetrics.accuracy * 100).toFixed(1)}%</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Loss</div>
              <div className="text-2xl font-bold text-red-500">{trainingMetrics.loss.toFixed(3)}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Samples Learned</div>
              <div className="text-2xl font-bold text-blue-500">{trainingMetrics.totalSamples}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Confidence</div>
              <div className="text-2xl font-bold text-purple-500">{confidencePercent}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress */}
      {trainingData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Learning Progress</CardTitle>
            <CardDescription>Model metrics over time - Confidence increases as model learns</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(60, 60, 80)" />
                <XAxis dataKey="epoch" stroke="rgb(150, 150, 170)" />
                <YAxis stroke="rgb(150, 150, 170)" domain={[0.4, 1]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgb(30, 30, 50)", border: "1px solid rgb(60, 60, 80)" }}
                  labelStyle={{ color: "rgb(200, 200, 220)" }}
                  formatter={(value: any) => {
                    if (typeof value === "number") {
                      return (value * 100).toFixed(1) + "%"
                    }
                    return value
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="accuracy" stroke="rgb(100, 200, 150)" strokeWidth={2} name="Accuracy" />
                <Line type="monotone" dataKey="loss" stroke="rgb(255, 150, 150)" strokeWidth={2} name="Loss" />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="rgb(150, 150, 255)"
                  strokeWidth={2.5}
                  name="Confidence"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Algorithm Insights */}
      {algorithmInsights.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Algorithm Performance Insights</CardTitle>
            <CardDescription>Learned performance characteristics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {algorithmInsights.map((insight) => (
              <div key={insight.algorithm} className="p-3 rounded-lg bg-muted/20 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">{insight.algorithm}</span>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">{insight.bestFor}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Avg Runtime</div>
                    <div className="font-semibold text-foreground">{insight.avgRuntime.toFixed(2)}ms</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Nodes</div>
                    <div className="font-semibold text-foreground">{insight.avgNodesExpanded.toFixed(0)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Success Rate</div>
                    <div className="font-semibold text-foreground">{(insight.successRate * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${insight.weight * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* How the ML Model Works */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">How the Ensemble ML Models Work</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-3">
            <div>
              <strong className="text-foreground">Decision Tree:</strong> Learns decision rules by splitting on grid
              features (size, wall density, weights) to classify which algorithm performs best.
            </div>
            <div>
              <strong className="text-foreground">Naive Bayes:</strong> Calculates probability distributions for each
              algorithm based on feature statistics, providing probabilistic predictions.
            </div>
            <div>
              <strong className="text-foreground">K-Nearest Neighbors:</strong> Finds similar past scenarios and
              recommends the algorithm that worked best in those situations.
            </div>
            <div>
              <strong className="text-foreground">Ensemble Voting:</strong> All three models vote on the best algorithm.
              Confidence increases when models agree and as more training data is collected.
            </div>
            <div>
              <strong className="text-foreground">Dynamic Learning:</strong> Confidence changes with each execution as
              models learn better patterns from your specific use cases. More samples = higher confidence.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
