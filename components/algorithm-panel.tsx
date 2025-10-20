"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { runAlgorithm } from "@/lib/pathfinding-algorithms"
import { useState } from "react"

interface AlgorithmPanelProps {
  gridState: any
  runState: any
  setRunState: (state: any) => void
  onExecution: (result: any) => void
}

export function AlgorithmPanel({ gridState, runState, setRunState, onExecution }: AlgorithmPanelProps) {
  const algorithms = ["A*", "Dijkstra", "BFS", "DFS", "Greedy Best-First", "D* Lite"]
  const heuristics = ["Manhattan", "Euclidean", "Diagonal"]
  const [recommendations, setRecommendations] = useState<any[]>([])

  const calculateGridFeatures = (cells: any[], start: any, end: any) => {
    const gridSize = Math.sqrt(cells.length)
    const wallCount = cells.filter((c) => c.isWall).length
    const wallDensity = wallCount / cells.length
    const weights = cells.filter((c) => c.weight).map((c) => c.weight)
    const averageWeight = weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : 1
    const pathLength = Math.abs(end[0] - start[0]) + Math.abs(end[1] - start[1])
    const startToEndDistance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2))

    return {
      gridSize,
      wallDensity,
      averageWeight,
      pathLength,
      startToEndDistance,
    }
  }

  const handleRun = async () => {
    setRunState({
      ...runState,
      isRunning: true,
      isPaused: false,
    })

    setTimeout(() => {
      const result = runAlgorithm(
        runState.algorithm,
        gridState.cells,
        gridState.start,
        gridState.end,
        runState.heuristic.toLowerCase(),
      )

      const fullResult = {
        algorithm: runState.algorithm,
        heuristic: runState.heuristic,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        runtime: result.runtime,
        pathLength: result.path.length,
        path: result.path,
        explored: result.explored,
        frontier: result.frontier,
        success: result.path.length > 0,
      }

      setRunState({
        ...runState,
        isRunning: false,
        results: fullResult,
      })

      const executionData = {
        gridFeatures: calculateGridFeatures(gridState.cells, gridState.start, gridState.end),
        algorithm: runState.algorithm,
        runtime: result.runtime,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        pathFound: result.path.length > 0,
        timestamp: Date.now(),
      }

      onExecution(executionData)
    }, 50)
  }

  const handleCompareAll = async () => {
    setRunState({
      ...runState,
      isRunning: true,
    })

    const results: any[] = []
    for (const algo of algorithms) {
      const result = runAlgorithm(algo, gridState.cells, gridState.start, gridState.end, "manhattan")
      results.push({
        algorithm: algo,
        runtime: result.runtime,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        success: result.path.length > 0,
      })

      const executionData = {
        gridFeatures: calculateGridFeatures(gridState.cells, gridState.start, gridState.end),
        algorithm: algo,
        runtime: result.runtime,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        pathFound: result.path.length > 0,
        timestamp: Date.now(),
      }

      onExecution(executionData)
    }

    setRecommendations(results.sort((a, b) => a.runtime - b.runtime))
    setRunState({
      ...runState,
      isRunning: false,
    })
  }

  const handleReset = () => {
    setRunState({
      ...runState,
      results: null,
    })
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Algorithm Control</CardTitle>
        <CardDescription>Select and run pathfinding algorithms</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Algorithm Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Algorithm</label>
          <div className="grid grid-cols-2 gap-2">
            {algorithms.map((algo) => (
              <button
                key={algo}
                onClick={() => setRunState({ ...runState, algorithm: algo })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  runState.algorithm === algo
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {algo}
              </button>
            ))}
          </div>
        </div>

        {/* Heuristic Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Heuristic</label>
          <div className="grid grid-cols-3 gap-2">
            {heuristics.map((h) => (
              <button
                key={h}
                onClick={() => setRunState({ ...runState, heuristic: h })}
                className={`px-3 py-2 rounded-lg text-[10px] font-medium transition-colors ${
                  runState.heuristic === h
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            onClick={handleRun}
            disabled={runState.isRunning}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {runState.isRunning ? "Running..." : "Run Algorithm"}
          </Button>
          <Button
            onClick={handleCompareAll}
            disabled={runState.isRunning}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Compare All Algorithms
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full bg-transparent">
            Reset Results
          </Button>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="text-xs font-medium text-foreground mb-2">Algorithm Comparison</div>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex justify-between items-center">
                  <span className="font-medium">{rec.algorithm}</span>
                  <div className="flex gap-2">
                    <span>{rec.runtime.toFixed(2)}ms</span>
                    <span>{rec.nodesExpanded} nodes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
