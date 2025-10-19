"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect, useRef } from "react"
import { runAlgorithm } from "@/lib/pathfinding-algorithms"

interface DynamicObstacleSimulatorProps {
  gridState: any
  setGridState: (state: any) => void
  runState: any
  onReplan: (result: any) => void
}

export function DynamicObstacleSimulator({
  gridState,
  setGridState,
  runState,
  onReplan,
}: DynamicObstacleSimulatorProps) {
  const [simulationActive, setSimulationActive] = useState(false)
  const [obstacleSpeed, setObstacleSpeed] = useState(50)
  const [obstacleCount, setObstacleCount] = useState(5)
  const [replanCount, setReplanCount] = useState(0)
  const [simulationStep, setSimulationStep] = useState(0)
  const [stepResults, setStepResults] = useState<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cellSize = Math.min((canvas.width - 20) / gridState.cols, (canvas.height - 20) / gridState.rows)

    ctx.fillStyle = "rgb(20, 20, 30)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "rgb(40, 40, 60)"
    ctx.lineWidth = 0.5

    for (let r = 0; r < gridState.rows; r++) {
      for (let c = 0; c < gridState.cols; c++) {
        const x = 10 + c * cellSize
        const y = 10 + r * cellSize

        const cell = gridState.cells[r][c]

        if (cell.type === "wall") {
          ctx.fillStyle = "rgb(15, 15, 25)"
        } else {
          ctx.fillStyle = `rgb(${30 + cell.weight * 5}, ${30 + cell.weight * 5}, ${50 + cell.weight * 5})`
        }
        ctx.fillRect(x, y, cellSize, cellSize)

        // Show explored and frontier from step results
        if (stepResults?.explored) {
          const key = `${r},${c}`
          if (stepResults.explored.has(key)) {
            ctx.fillStyle = "rgba(100, 150, 255, 0.5)"
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
          }
        }

        if (stepResults?.frontier) {
          const key = `${r},${c}`
          if (stepResults.frontier.has(key)) {
            ctx.fillStyle = "rgba(100, 200, 255, 0.8)"
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
          }
        }

        if (stepResults?.path) {
          for (let i = 0; i < stepResults.path.length; i++) {
            const [pr, pc] = stepResults.path[i]
            if (pr === r && pc === c) {
              const hue = (i / stepResults.path.length) * 120
              ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
              ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
              break
            }
          }
        }

        if (r === gridState.start[0] && c === gridState.start[1]) {
          ctx.fillStyle = "rgb(112, 180, 100)"
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
        } else if (r === gridState.end[0] && c === gridState.end[1]) {
          ctx.fillStyle = "rgb(220, 100, 100)"
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
        }

        ctx.strokeStyle = "rgb(40, 40, 60)"
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, cellSize, cellSize)
      }
    }
  }, [gridState, stepResults])

  const addRandomObstacles = () => {
    const newCells = gridState.cells.map((row: any[]) => [...row])
    let added = 0

    for (let i = 0; i < obstacleCount && added < obstacleCount; i++) {
      const r = Math.floor(Math.random() * gridState.rows)
      const c = Math.floor(Math.random() * gridState.cols)

      if (
        (r === gridState.start[0] && c === gridState.start[1]) ||
        (r === gridState.end[0] && c === gridState.end[1]) ||
        newCells[r][c].type === "wall"
      ) {
        continue
      }

      newCells[r][c] = { type: "wall", weight: 1 }
      added++
    }

    setGridState({
      ...gridState,
      cells: newCells,
    })

    triggerReplan(newCells)
  }

  const removeRandomObstacles = () => {
    const newCells = gridState.cells.map((row: any[]) => [...row])
    let removed = 0

    for (let r = 0; r < gridState.rows && removed < obstacleCount; r++) {
      for (let c = 0; c < gridState.cols && removed < obstacleCount; c++) {
        if (newCells[r][c].type === "wall") {
          newCells[r][c] = { type: "free", weight: 1 }
          removed++
        }
      }
    }

    setGridState({
      ...gridState,
      cells: newCells,
    })

    triggerReplan(newCells)
  }

  const triggerReplan = (cells: any) => {
    const result = runAlgorithm("D* Lite", cells, gridState.start, gridState.end, "manhattan")
    setStepResults(result)
    onReplan({
      runtime: result.runtime,
      nodesExpanded: result.nodesExpanded,
      pathCost: result.pathCost,
    })
  }

  const startSimulation = () => {
    setSimulationActive(true)
    setReplanCount(0)
    setSimulationStep(0)

    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.5) {
        addRandomObstacles()
      } else {
        removeRandomObstacles()
      }
      setReplanCount((prev) => prev + 1)
      setSimulationStep((prev) => prev + 1)
    }, 101 - obstacleSpeed)
  }

  const stopSimulation = () => {
    setSimulationActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Dynamic Obstacles Simulation</CardTitle>
        <CardDescription>Watch how the algorithm replans in real-time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simulation Canvas */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Live Simulation View</label>
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="w-full border border-border rounded-lg bg-muted"
          />
        </div>

        {/* Obstacle Speed */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Simulation Speed: {obstacleSpeed}%</label>
          <Slider
            value={[obstacleSpeed]}
            onValueChange={(val) => setObstacleSpeed(val[0])}
            min={10}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        {/* Obstacle Count */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Obstacles per Change: {obstacleCount}</label>
          <Slider
            value={[obstacleCount]}
            onValueChange={(val) => setObstacleCount(val[0])}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="space-y-2 pt-4 border-t border-border">
          {!simulationActive ? (
            <Button onClick={startSimulation} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Start Simulation
            </Button>
          ) : (
            <Button
              onClick={stopSimulation}
              className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Stop Simulation
            </Button>
          )}

          <Button onClick={addRandomObstacles} variant="outline" className="w-full bg-transparent">
            Add Obstacles
          </Button>
          <Button onClick={removeRandomObstacles} variant="outline" className="w-full bg-transparent">
            Remove Obstacles
          </Button>
        </div>

        {/* Status */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="text-xs font-medium text-foreground mb-2">Simulation Status</div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Status: {simulationActive ? "🟢 Active" : "🔴 Inactive"}</div>
            <div>Total Walls: {gridState.cells.flat().filter((c: any) => c.type === "wall").length}</div>
            <div>Replan Events: {replanCount}</div>
            <div>Simulation Steps: {simulationStep}</div>
            <div>Path Valid: {stepResults?.success ? "✓ Yes" : "✗ No"}</div>
            {stepResults && (
              <>
                <div>Nodes Explored: {stepResults.nodesExpanded}</div>
                <div>Path Cost: {stepResults.pathCost.toFixed(2)}</div>
                <div>Runtime: {stepResults.runtime.toFixed(2)}ms</div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
