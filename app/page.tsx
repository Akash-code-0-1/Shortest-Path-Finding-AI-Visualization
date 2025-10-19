"use client"

import { useState, useCallback } from "react"
import { AlgorithmPanel } from "@/components/algorithm-panel"
import { VisualizationCanvas } from "@/components/visualization-canvas"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { MLTrainingMonitor } from "@/components/ml-training-monitor"
import { Header } from "@/components/header"
import { GridEditor } from "@/components/grid-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { onlineLearner, type ExecutionData } from "@/lib/online-learning"

export default function Home() {
  const [gridState, setGridState] = useState({
    rows: 50,
    cols: 50,
    start: [2, 2],
    end: [47, 47],
    cells: Array(50)
      .fill(null)
      .map(() =>
        Array(50)
          .fill(null)
          .map(() => ({ type: "free", weight: 1 })),
      ),
  })

  const [runState, setRunState] = useState({
    isRunning: false,
    isPaused: false,
    algorithm: "A*",
    heuristic: "Manhattan",
    results: null as any,
  })

  const [executionHistory, setExecutionHistory] = useState<any[]>([])
  const [trainingMetrics, setTrainingMetrics] = useState({
    totalSamples: 0,
    accuracy: 0.5,
    loss: 0.5,
    recommendationConfidence: 0.5,
    bestAlgorithm: "A*",
    lastUpdated: new Date(),
  })
  const [algorithmInsights, setAlgorithmInsights] = useState<any[]>([])

  const calculateGridFeatures = useCallback(() => {
    let wallCount = 0
    let totalWeight = 0
    let cellCount = 0

    for (let i = 0; i < gridState.rows; i++) {
      for (let j = 0; j < gridState.cols; j++) {
        const cell = gridState.cells[i][j]
        cellCount++
        if (cell.type === "wall") wallCount++
        totalWeight += cell.weight
      }
    }

    const [startRow, startCol] = gridState.start
    const [endRow, endCol] = gridState.end
    const pathLength = Math.abs(endRow - startRow) + Math.abs(endCol - startCol)
    const startToEndDistance = Math.sqrt(Math.pow(endRow - startRow, 2) + Math.pow(endCol - startCol, 2))

    return {
      gridSize: gridState.rows * gridState.cols,
      wallDensity: wallCount / cellCount,
      averageWeight: totalWeight / cellCount,
      pathLength,
      startToEndDistance,
    }
  }, [gridState])

  const addExecution = useCallback(
    (result: any) => {
      const gridFeatures = calculateGridFeatures()

      const executionData: ExecutionData = {
        gridFeatures,
        algorithm: result.algorithm,
        runtime: result.runtime,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        pathFound: result.pathFound !== false,
        timestamp: Date.now(),
      }

      onlineLearner.addExecution(executionData)

      const metrics = onlineLearner.getMetrics()
      setTrainingMetrics({
        totalSamples: metrics.totalSamples,
        accuracy: metrics.accuracy,
        loss: metrics.loss,
        recommendationConfidence: metrics.recommendationConfidence,
        bestAlgorithm: metrics.bestAlgorithm,
        lastUpdated: new Date(),
      })

      const insights = onlineLearner.getAlgorithmInsights()
      setAlgorithmInsights(insights)

      const newEntry = {
        algorithm: result.algorithm,
        runtime: result.runtime,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        timestamp: new Date().toLocaleTimeString(),
      }
      setExecutionHistory((prev) => [...prev.slice(-49), newEntry])
    },
    [calculateGridFeatures],
  )

  return (
    <div className="h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-background border-r border-border flex-shrink-0 p-4 flex flex-col overflow-y-auto">
          <div className="space-y-6">
            <GridEditor gridState={gridState} setGridState={setGridState} />
            <AlgorithmPanel
              gridState={gridState}
              runState={runState}
              setRunState={setRunState}
              onExecution={addExecution}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="visualization" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0 m-4 mb-0">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="training">ML Training</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="visualization" className="h-full p-4 m-0">
                <VisualizationCanvas
                  gridState={gridState}
                  runState={runState}
                  setGridState={setGridState}
                  onReplan={() => {}}
                />
              </TabsContent>

              <TabsContent value="analytics" className="p-4 m-0">
                <AnalyticsDashboard executionHistory={executionHistory} />
              </TabsContent>

              <TabsContent value="training" className="p-4 m-0">
                <MLTrainingMonitor
                  trainingMetrics={trainingMetrics}
                  algorithmWeights={{}}
                  algorithmInsights={algorithmInsights}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
