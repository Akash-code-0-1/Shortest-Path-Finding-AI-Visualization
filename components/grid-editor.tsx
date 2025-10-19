"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface GridEditorProps {
  gridState: any
  setGridState: (state: any) => void
}

export function GridEditor({ gridState, setGridState }: GridEditorProps) {
  const [gridSize, setGridSize] = useState(50)

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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Grid Settings</CardTitle>
        <CardDescription>Configure your grid</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Grid Size */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Grid Size: {gridSize}×{gridSize}
          </label>
          <Slider
            value={[gridSize]}
            onValueChange={(val) => handleGridSizeChange(val[0])}
            min={20}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button onClick={generateRandomMap} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Generate Random Map
          </Button>
          <Button onClick={clearGrid} variant="outline" className="w-full bg-transparent">
            Clear Grid
          </Button>
        </div>

        {/* Grid Stats */}
        <div className="space-y-2 p-3 rounded-lg bg-muted/30 border border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Total Cells: {gridSize * gridSize}</div>
            <div>Walls: {gridState.cells.flat().filter((c: any) => c.type === "wall").length}</div>
            <div>Free: {gridState.cells.flat().filter((c: any) => c.type === "free").length}</div>
            <div>
              Start: [{gridState.start[0]}, {gridState.start[1]}]
            </div>
            <div>
              End: [{gridState.end[0]}, {gridState.end[1]}]
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
