"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { runAlgorithm } from "@/lib/pathfinding-algorithms"

interface VisualizationCanvasProps {
  gridState: any
  runState: any
  setGridState: (state: any) => void
  onReplan: (result: any) => void
}

export function VisualizationCanvas({ gridState, runState, setGridState, onReplan }: VisualizationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef(0)
  const requestIdRef = useRef<number | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [simulationData, setSimulationData] = useState<any>(null)
  const [stepDelay, setStepDelay] = useState(100)
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [tool, setTool] = useState<"wall" | "erase" | "weight" | "start" | "end">("wall")
  const [weight, setWeight] = useState(1)
  const [gridSize, setGridSize] = useState(50)
  const [isDrawing, setIsDrawing] = useState(false)

  const COLORS = {
    startPoint: { r: 34, g: 197, b: 94 },
    endPoint: { r: 239, g: 68, b: 68 },
    currentNode: { r: 251, g: 191, b: 36 },
    frontier: { r: 59, g: 130, b: 246 },
    explored: { r: 99, g: 102, b: 241 },
    finalPath: { r: 34, g: 197, b: 94 },
    wall: { r: 220, g: 38, b: 38 },
    free: { r: 15, g: 23, b: 42 },
  }

  const handleGridSizeChange = (size: number) => {
    setGridSize(size)
    const newCells = Array(size)
      .fill(null)
      .map(() =>
        Array(size)
          .fill(null)
          .map(() => ({ type: "free", weight: 1 })),
      )
    setGridState({
      ...gridState,
      rows: size,
      cols: size,
      cells: newCells,
    })
  }

  const applyCellTool = (row: number, col: number, newCells: any) => {
    if (row < 0 || row >= gridState.rows || col < 0 || col >= gridState.cols) return

    if (tool === "wall") {
      newCells[row][col] = { type: "wall", weight: 1 }
    } else if (tool === "erase") {
      newCells[row][col] = { type: "free", weight: 1 }
    } else if (tool === "weight") {
      newCells[row][col] = { type: "free", weight }
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    handleCanvasInteraction(e)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    handleCanvasInteraction(e)
  }

  const handleCanvasMouseUp = () => {
    setIsDrawing(false)
  }

  const handleCanvasInteraction = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget
    const rect = canvas.getBoundingClientRect()

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const cellSize = Math.min((canvas.width - 20) / gridState.cols, (canvas.height - 20) / gridState.rows)

    const col = Math.floor((x - 10) / cellSize)
    const row = Math.floor((y - 10) / cellSize)

    // Ensure we're within bounds
    if (row < 0 || row >= gridState.rows || col < 0 || col >= gridState.cols) return

    const newCells = gridState.cells.map((r: any[]) => [...r])

    if (tool === "start") {
      setGridState({
        ...gridState,
        start: [row, col],
        cells: newCells,
      })
    } else if (tool === "end") {
      setGridState({
        ...gridState,
        end: [row, col],
        cells: newCells,
      })
    } else {
      applyCellTool(row, col, newCells)
      setGridState({
        ...gridState,
        cells: newCells,
      })
    }
  }

  const generateRandomMap = () => {
    const density = 0.3
    const newCells = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => ({
            type: Math.random() < density ? "wall" : "free",
            weight: Math.random() < 0.5 ? 1 : Math.floor(Math.random() * 5) + 2,
          })),
      )
    setGridState({
      ...gridState,
      cells: newCells,
    })
  }

  const clearGrid = () => {
    const newCells = Array(gridSize)
      .fill(null)
      .map(() =>
        Array(gridSize)
          .fill(null)
          .map(() => ({ type: "free", weight: 1 })),
      )
    setGridState({
      ...gridState,
      cells: newCells,
    })
  }

  const startSimulation = () => {
    try {
      if (!gridState.cells || gridState.cells.length === 0) {
        console.error("[v0] Grid cells not initialized")
        return
      }

      const result = runAlgorithm(
        runState.algorithm || "A*",
        gridState.cells,
        gridState.start || [2, 2],
        gridState.end || [47, 47],
        runState.heuristic?.toLowerCase() || "manhattan",
      )

      setSimulationData(result)
      setCurrentStep(0)
      setIsSimulating(true)
    } catch (error) {
      console.error("[v0] Error in startSimulation:", error)
    }
  }

  useEffect(() => {
    if (!isSimulating || !simulationData || !simulationData.steps) return

    if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)

    stepIntervalRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        const totalSteps = simulationData.steps.length
        if (prev >= totalSteps - 1) {
          setIsSimulating(false)
          return prev
        }
        return prev + 1
      })
    }, stepDelay)

    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }, [isSimulating, simulationData, stepDelay])

  useEffect(() => {
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current)
    }
  }, [])

  const drawIcon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, type: "start" | "end") => {
    ctx.save()
    ctx.translate(x + size / 2, y + size / 2)

    if (type === "start") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.beginPath()
      ctx.moveTo(-size / 6, -size / 6)
      ctx.lineTo(size / 6, -size / 6)
      ctx.lineTo(size / 6, size / 6)
      ctx.lineTo(-size / 6, size / 6)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -size / 6)
      ctx.lineTo(0, size / 3)
      ctx.stroke()
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)"
      ctx.lineWidth = 2

      ctx.beginPath()
      ctx.arc(0, 0, size / 5, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(0, 0, size / 10, 0, Math.PI * 2)
      ctx.stroke()

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
      ctx.beginPath()
      ctx.arc(0, 0, size / 20, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgb(10, 15, 30)")
      gradient.addColorStop(1, "rgb(20, 25, 45)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgb(40, 50, 80)"
      ctx.lineWidth = 0.5

      const cellSize = Math.min((canvas.width - 20) / gridState.cols, (canvas.height - 20) / gridState.rows)

      for (let r = 0; r < gridState.rows; r++) {
        for (let c = 0; c < gridState.cols; c++) {
          const x = 10 + c * cellSize
          const y = 10 + r * cellSize

          const cell = gridState.cells[r][c]

          if (cell.type === "wall") {
            ctx.fillStyle = `rgb(${COLORS.wall.r}, ${COLORS.wall.g}, ${COLORS.wall.b})`
            ctx.fillRect(x, y, cellSize, cellSize)

            ctx.fillStyle = `rgba(${COLORS.wall.r - 30}, ${COLORS.wall.g - 30}, ${COLORS.wall.b - 30}, 0.5)`
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
          } else {
            ctx.fillStyle = `rgb(${COLORS.free.r}, ${COLORS.free.g}, ${COLORS.free.b})`
            ctx.fillRect(x, y, cellSize, cellSize)
          }

          if (isSimulating && simulationData && simulationData.steps) {
            const currentStepData = simulationData.steps[currentStep]

            for (let i = 0; i <= currentStep; i++) {
              const stepData = simulationData.steps[i]
              for (const key of stepData.explored) {
                const [er, ec] = key.split(",").map(Number)
                if (er === r && ec === c) {
                  ctx.fillStyle = `rgba(${COLORS.explored.r}, ${COLORS.explored.g}, ${COLORS.explored.b}, 0.5)`
                  ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
                  break
                }
              }
            }

            if (currentStepData) {
              const [cr, cc] = currentStepData.currentNode
              if (cr === r && cc === c) {
                ctx.fillStyle = `rgba(${COLORS.currentNode.r}, ${COLORS.currentNode.g}, ${COLORS.currentNode.b}, 0.95)`
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
                ctx.shadowColor = `rgba(${COLORS.currentNode.r}, ${COLORS.currentNode.g}, ${COLORS.currentNode.b}, 0.8)`
                ctx.shadowBlur = 15
                ctx.strokeStyle = `rgba(${COLORS.currentNode.r}, ${COLORS.currentNode.g}, ${COLORS.currentNode.b}, 1)`
                ctx.lineWidth = 3
                ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
                ctx.shadowColor = "transparent"
              }
            }

            if (currentStepData) {
              for (const key of currentStepData.frontier) {
                const [fr, fc] = key.split(",").map(Number)
                if (fr === r && fc === c) {
                  const pulse = Math.sin(animationFrameRef.current * 0.08) * 0.3 + 0.6
                  ctx.fillStyle = `rgba(${COLORS.frontier.r}, ${COLORS.frontier.g}, ${COLORS.frontier.b}, ${pulse})`
                  ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
                  break
                }
              }
            }
          } else {
            if (runState.results?.explored) {
              const key = `${r},${c}`
              if (runState.results.explored.has(key)) {
                ctx.fillStyle = `rgba(${COLORS.explored.r}, ${COLORS.explored.g}, ${COLORS.explored.b}, 0.5)`
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
              }
            }

            if (runState.results?.frontier) {
              const key = `${r},${c}`
              if (runState.results.frontier.has(key)) {
                const pulse = Math.sin(animationFrameRef.current * 0.08) * 0.3 + 0.6
                ctx.fillStyle = `rgba(${COLORS.frontier.r}, ${COLORS.frontier.g}, ${COLORS.frontier.b}, ${pulse})`
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
              }
            }
          }

          const shouldShowPath = !isSimulating && runState.results?.path
          if (shouldShowPath && runState.results.path.length > 0) {
            const pathToShow = runState.results.path
            for (let i = 0; i < pathToShow.length; i++) {
              const [pr, pc] = pathToShow[i]
              if (pr === r && pc === c) {
                ctx.fillStyle = `rgba(${COLORS.finalPath.r}, ${COLORS.finalPath.g}, ${COLORS.finalPath.b}, 0.7)`
                ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

                if (i > 0) {
                  const [prevR, prevC] = pathToShow[i - 1]
                  const prevX = 10 + prevC * cellSize + cellSize / 2
                  const prevY = 10 + prevR * cellSize + cellSize / 2
                  const currX = x + cellSize / 2
                  const currY = y + cellSize / 2

                  ctx.strokeStyle = `rgba(${COLORS.finalPath.r}, ${COLORS.finalPath.g}, ${COLORS.finalPath.b}, 0.9)`
                  ctx.lineWidth = 3
                  ctx.beginPath()
                  ctx.moveTo(prevX, prevY)
                  ctx.lineTo(currX, currY)
                  ctx.stroke()
                }
                break
              }
            }
          }

          if (r === gridState.start[0] && c === gridState.start[1]) {
            ctx.fillStyle = `rgb(${COLORS.startPoint.r}, ${COLORS.startPoint.g}, ${COLORS.startPoint.b})`
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
            ctx.shadowColor = `rgba(${COLORS.startPoint.r}, ${COLORS.startPoint.g}, ${COLORS.startPoint.b}, 0.8)`
            ctx.shadowBlur = 15
            ctx.strokeStyle = `rgb(${COLORS.startPoint.r + 50}, ${COLORS.startPoint.g + 50}, ${COLORS.startPoint.b + 50})`
            ctx.lineWidth = 2.5
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
            ctx.shadowColor = "transparent"

            drawIcon(ctx, x + 2, y + 2, cellSize - 4, "start")
          } else if (r === gridState.end[0] && c === gridState.end[1]) {
            ctx.fillStyle = `rgb(${COLORS.endPoint.r}, ${COLORS.endPoint.g}, ${COLORS.endPoint.b})`
            ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
            ctx.shadowColor = `rgba(${COLORS.endPoint.r}, ${COLORS.endPoint.g}, ${COLORS.endPoint.b}, 0.8)`
            ctx.shadowBlur = 15
            ctx.strokeStyle = `rgb(${COLORS.endPoint.r + 50}, ${COLORS.endPoint.g - 50}, ${COLORS.endPoint.b - 50})`
            ctx.lineWidth = 2.5
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4)
            ctx.shadowColor = "transparent"

            drawIcon(ctx, x + 2, y + 2, cellSize - 4, "end")
          }

          ctx.strokeStyle = "rgb(40, 50, 80)"
          ctx.lineWidth = 0.5
          ctx.strokeRect(x, y, cellSize, cellSize)
        }
      }

      animationFrameRef.current = (animationFrameRef.current + 1) % 360
      requestIdRef.current = requestAnimationFrame(animate)
    }

    requestIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestIdRef.current !== null) {
        cancelAnimationFrame(requestIdRef.current)
      }
    }
  }, [gridState, runState.results, isSimulating, simulationData, currentStep])

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-lg">Visualization Board</CardTitle>
        <CardDescription>View algorithm execution and simulation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 overflow-y-auto">
        <div className="space-y-3 p-3 rounded-lg bg-muted/30 border border-border flex-shrink-0">
          <label className="text-sm font-medium text-foreground">Drawing Tools</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: "wall", label: "Wall", icon: "🧱" },
              { id: "erase", label: "Erase", icon: "🗑️" },
              { id: "weight", label: "Weight", icon: "⚖️" },
              { id: "start", label: "Start", icon: "🟢" },
              { id: "end", label: "End", icon: "🔴" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTool(t.id as any)}
                className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                  tool === t.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {tool === "weight" && (
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-medium text-foreground">Terrain Weight: {weight}</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex justify-center items-center flex-shrink-0">
          <canvas
            ref={canvasRef}
            width={600}
            height={600}
            className="border border-border rounded-lg cursor-crosshair"
            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 500px)" }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />
        </div>

        <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border flex-shrink-0">
          <div className="text-sm font-medium text-foreground">Step-by-Step Traversal Simulation</div>
          <div className="flex gap-2">
            <Button
              onClick={startSimulation}
              disabled={isSimulating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSimulating ? "Simulating..." : "Start Simulation"}
            </Button>
            <Button
              onClick={() => setIsSimulating(false)}
              disabled={!isSimulating}
              variant="outline"
              className="flex-1"
            >
              Stop
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Speed: {stepDelay}ms per step</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              <button
                onClick={() => setStepDelay(5)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 5 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Blazing
              </button>
              <button
                onClick={() => setStepDelay(10)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 10 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Ultra Fast
              </button>
              <button
                onClick={() => setStepDelay(25)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 25 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Very Fast
              </button>
              <button
                onClick={() => setStepDelay(50)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 50 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Fast
              </button>
              <button
                onClick={() => setStepDelay(100)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 100 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Normal
              </button>
              <button
                onClick={() => setStepDelay(200)}
                className={`px-2 py-1 text-xs rounded ${stepDelay === 200 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Slow
              </button>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={stepDelay}
              onChange={(e) => setStepDelay(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {isSimulating && simulationData && simulationData.steps && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>
                Current Step: {currentStep + 1} / {simulationData.steps.length}
              </div>
              <div>
                Current Node: [{simulationData.steps[currentStep]?.currentNode[0]},{" "}
                {simulationData.steps[currentStep]?.currentNode[1]}]
              </div>
              <div>Nodes Explored: {simulationData.steps[currentStep]?.explored.size || 0}</div>
              <div>Frontier Size: {simulationData.steps[currentStep]?.frontier.size || 0}</div>
            </div>
          )}

          {!isSimulating && simulationData && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Status: {simulationData.path?.length > 0 ? "✓ Path Found" : "✗ No Path"}</div>
              <div>Total Steps: {simulationData.steps?.length || 0}</div>
              <div>Path Length: {simulationData.path?.length || 0}</div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm p-3 rounded-lg bg-muted/20 border border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgb(${COLORS.startPoint.r}, ${COLORS.startPoint.g}, ${COLORS.startPoint.b})` }}
            ></div>
            <span className="text-muted-foreground">Start Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgb(${COLORS.endPoint.r}, ${COLORS.endPoint.g}, ${COLORS.endPoint.b})` }}
            ></div>
            <span className="text-muted-foreground">End Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: `rgb(${COLORS.currentNode.r}, ${COLORS.currentNode.g}, ${COLORS.currentNode.b})`,
              }}
            ></div>
            <span className="text-muted-foreground">Current Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgb(${COLORS.frontier.r}, ${COLORS.frontier.g}, ${COLORS.frontier.b})` }}
            ></div>
            <span className="text-muted-foreground">Frontier (To Explore)</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgba(${COLORS.explored.r}, ${COLORS.explored.g}, ${COLORS.explored.b}, 0.8)` }}
            ></div>
            <span className="text-muted-foreground">Explored Nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgb(${COLORS.finalPath.r}, ${COLORS.finalPath.g}, ${COLORS.finalPath.b})` }}
            ></div>
            <span className="text-muted-foreground">Final Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: `rgb(${COLORS.wall.r}, ${COLORS.wall.g}, ${COLORS.wall.b})` }}
            ></div>
            <span className="text-muted-foreground">Wall</span>
          </div>
        </div>

        {(runState.results || simulationData) && (
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border flex-shrink-0">
            <div className="text-sm font-medium text-foreground mb-2">Algorithm Results</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Status: {(simulationData || runState.results)?.path?.length > 0 ? "✓ Path Found" : "✗ No Path"}</div>
              <div>Runtime: {(simulationData || runState.results)?.runtime.toFixed(2)}ms</div>
              <div>Nodes Expanded: {(simulationData || runState.results)?.nodesExpanded}</div>
              <div>Path Length: {(simulationData || runState.results)?.path?.length || 0}</div>
              <div>Path Cost: {(simulationData || runState.results)?.pathCost.toFixed(2)}</div>
              <div>Algorithm: {runState.algorithm || "A*"}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
