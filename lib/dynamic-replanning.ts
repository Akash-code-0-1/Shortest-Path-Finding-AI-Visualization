// Dynamic obstacle handling and incremental replanning

export interface DynamicGridState {
  cells: Array<Array<{ type: "free" | "wall"; weight: number }>>
  obstacles: Set<string>
  currentPath: [number, number][]
  isPathValid: boolean
}

export interface ReplanningResult {
  newPath: [number, number][]
  replanned: boolean
  replanTime: number
  obstaclesDetected: number
}

export class DynamicReplanner {
  private previousGrid: any[][] | null = null
  private previousPath: [number, number][] = []
  private replanCount = 0

  detectObstacleChanges(currentGrid: any[][], previousGrid: any[][] | null): { added: string[]; removed: string[] } {
    const added: string[] = []
    const removed: string[] = []

    if (!previousGrid) {
      // First run, detect all walls
      for (let r = 0; r < currentGrid.length; r++) {
        for (let c = 0; c < currentGrid[0].length; c++) {
          if (currentGrid[r][c].type === "wall") {
            added.push(`${r},${c}`)
          }
        }
      }
      return { added, removed }
    }

    // Compare grids
    for (let r = 0; r < currentGrid.length; r++) {
      for (let c = 0; c < currentGrid[0].length; c++) {
        const current = currentGrid[r][c]
        const previous = previousGrid[r][c]

        if (current.type === "wall" && previous.type !== "wall") {
          added.push(`${r},${c}`)
        } else if (current.type !== "wall" && previous.type === "wall") {
          removed.push(`${r},${c}`)
        }
      }
    }

    return { added, removed }
  }

  isPathBlocked(path: [number, number][], grid: any[][]): { blocked: boolean; blockPoint: [number, number] | null } {
    for (const [r, c] of path) {
      if (grid[r][c].type === "wall") {
        return { blocked: true, blockPoint: [r, c] }
      }
    }
    return { blocked: false, blockPoint: null }
  }

  findAlternativePath(
    grid: any[][],
    currentPath: [number, number][],
    start: [number, number],
    end: [number, number],
  ): [number, number][] {
    // Find the first blocked point in the path
    let blockIndex = -1
    for (let i = 0; i < currentPath.length; i++) {
      const [r, c] = currentPath[i]
      if (grid[r][c].type === "wall") {
        blockIndex = i
        break
      }
    }

    if (blockIndex === -1) {
      return currentPath // Path is still valid
    }

    // Use the point before the block as the new start
    const replanStart = blockIndex > 0 ? currentPath[blockIndex - 1] : start

    // Simple greedy replanning: find nearest unblocked neighbor
    const neighbors = this.getNeighbors(replanStart[0], replanStart[1], grid.length, grid[0].length)
    let bestNeighbor: [number, number] | null = null
    let bestDistance = Number.POSITIVE_INFINITY

    for (const [nr, nc] of neighbors) {
      if (grid[nr][nc].type !== "wall") {
        const distance = Math.abs(nr - end[0]) + Math.abs(nc - end[1])
        if (distance < bestDistance) {
          bestDistance = distance
          bestNeighbor = [nr, nc]
        }
      }
    }

    if (!bestNeighbor) {
      return [] // No alternative path
    }

    // Reconstruct path: original path up to replan point + new segment
    const newPath = currentPath.slice(0, blockIndex)
    newPath.push(bestNeighbor)

    // Continue with greedy approach to goal
    let current = bestNeighbor
    const visited = new Set<string>()
    visited.add(`${current[0]},${current[1]}`)

    while (current[0] !== end[0] || current[1] !== end[1]) {
      const nextNeighbors = this.getNeighbors(current[0], current[1], grid.length, grid[0].length)
      let nextStep: [number, number] | null = null
      let nextDistance = Number.POSITIVE_INFINITY

      for (const [nr, nc] of nextNeighbors) {
        const key = `${nr},${nc}`
        if (grid[nr][nc].type !== "wall" && !visited.has(key)) {
          const distance = Math.abs(nr - end[0]) + Math.abs(nc - end[1])
          if (distance < nextDistance) {
            nextDistance = distance
            nextStep = [nr, nc]
          }
        }
      }

      if (!nextStep) {
        break // Dead end
      }

      visited.add(`${nextStep[0]},${nextStep[1]}`)
      newPath.push(nextStep)
      current = nextStep

      if (visited.size > grid.length * grid[0].length) {
        break // Prevent infinite loops
      }
    }

    return newPath
  }

  private getNeighbors(row: number, col: number, rows: number, cols: number): [number, number][] {
    const neighbors: [number, number][] = []
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]

    for (const [dr, dc] of directions) {
      const nr = row + dr
      const nc = col + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        neighbors.push([nr, nc])
      }
    }
    return neighbors
  }

  replan(
    grid: any[][],
    currentPath: [number, number][],
    start: [number, number],
    end: [number, number],
  ): ReplanningResult {
    const startTime = performance.now()

    // Detect changes
    const changes = this.detectObstacleChanges(grid, this.previousGrid)
    const obstaclesDetected = changes.added.length + changes.removed.length

    // Check if current path is still valid
    const { blocked } = this.isPathBlocked(currentPath, grid)

    let newPath = currentPath
    let replanned = false

    if (blocked || obstaclesDetected > 0) {
      newPath = this.findAlternativePath(grid, currentPath, start, end)
      replanned = true
      this.replanCount++
    }

    const replanTime = performance.now() - startTime

    // Update state
    this.previousGrid = grid.map((row) => [...row])
    this.previousPath = newPath

    return {
      newPath,
      replanned,
      replanTime,
      obstaclesDetected,
    }
  }

  getReplanCount(): number {
    return this.replanCount
  }

  reset() {
    this.previousGrid = null
    this.previousPath = []
    this.replanCount = 0
  }
}

export const dynamicReplanner = new DynamicReplanner()
