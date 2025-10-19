// Pathfinding algorithms library with support for multiple search strategies

export interface PathfindingStep {
  currentNode: [number, number]
  explored: Set<string>
  frontier: Set<string>
  currentPath: [number, number][]
}

export interface PathfindingResult {
  path: [number, number][]
  explored: Set<string>
  frontier: Set<string>
  nodesExpanded: number
  pathCost: number
  runtime: number
  steps?: PathfindingStep[] // Added steps for iteration-wise visualization
}

interface Node {
  row: number
  col: number
  g: number // Cost from start
  h: number // Heuristic to goal
  f: number // g + h
  parent?: Node
}

interface GridCell {
  type: "free" | "wall"
  weight: number
}

// Heuristic functions
const heuristics = {
  manhattan: (r1: number, c1: number, r2: number, c2: number) => Math.abs(r1 - r2) + Math.abs(c1 - c2),
  euclidean: (r1: number, c1: number, r2: number, c2: number) => Math.sqrt((r1 - r2) ** 2 + (c1 - c2) ** 2),
  diagonal: (r1: number, c1: number, r2: number, c2: number) => {
    const dx = Math.abs(r1 - r2)
    const dy = Math.abs(c1 - c2)
    return Math.max(dx, dy) + (Math.sqrt(2) - 1) * Math.min(dx, dy)
  },
}

const getNeighbors = (row: number, col: number, rows: number, cols: number) => {
  const neighbors: [number, number][] = []
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
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

const reconstructPath = (node: Node | undefined): [number, number][] => {
  const path: [number, number][] = []
  let current = node
  while (current) {
    path.unshift([current.row, current.col])
    current = current.parent
  }
  return path
}

export const aStar = (
  grid: GridCell[][],
  start: [number, number],
  end: [number, number],
  heuristic: "manhattan" | "euclidean" | "diagonal" = "manhattan",
): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length
  const heuristicFn = heuristics[heuristic]

  const openSet = new Map<string, Node>()
  const closedSet = new Set<string>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const steps: PathfindingStep[] = [] // Track each step

  const startNode: Node = {
    row: start[0],
    col: start[1],
    g: 0,
    h: heuristicFn(start[0], start[1], end[0], end[1]),
    f: heuristicFn(start[0], start[1], end[0], end[1]),
  }

  openSet.set(`${start[0]},${start[1]}`, startNode)
  frontier.add(`${start[0]},${start[1]}`)

  while (openSet.size > 0) {
    let current: Node | null = null
    let currentKey = ""

    for (const [key, node] of openSet) {
      if (!current || node.f < current.f) {
        current = node
        currentKey = key
      }
    }

    if (!current) break

    steps.push({
      currentNode: [current.row, current.col],
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    if (current.row === end[0] && current.col === end[1]) {
      const path = reconstructPath(current)
      const runtime = performance.now() - startTime
      return {
        path,
        explored,
        frontier,
        nodesExpanded: explored.size,
        pathCost: current.g,
        runtime,
        steps,
      }
    }

    openSet.delete(currentKey)
    closedSet.add(currentKey)
    explored.add(currentKey)
    frontier.delete(currentKey)

    for (const [nr, nc] of getNeighbors(current.row, current.col, rows, cols)) {
      const key = `${nr},${nc}`

      if (closedSet.has(key) || grid[nr][nc].type === "wall") continue

      const g = current.g + grid[nr][nc].weight
      const hValue = heuristicFn(nr, nc, end[0], end[1])
      const f = g + hValue

      const neighbor = openSet.get(key)
      if (!neighbor || g < neighbor.g) {
        const newNode: Node = { row: nr, col: nc, g, h: hValue, f, parent: current }
        openSet.set(key, newNode)
        frontier.add(key)
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps,
  }
}

export const dijkstra = (grid: GridCell[][], start: [number, number], end: [number, number]): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length

  const distances = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(Number.POSITIVE_INFINITY))
  const previous = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null))
  const unvisited = new Set<string>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const steps: PathfindingStep[] = [] // Track each step

  distances[start[0]][start[1]] = 0

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].type !== "wall") {
        unvisited.add(`${r},${c}`)
        frontier.add(`${r},${c}`)
      }
    }
  }

  while (unvisited.size > 0) {
    let current: [number, number] | null = null
    let minDist = Number.POSITIVE_INFINITY

    for (const key of unvisited) {
      const [r, c] = key.split(",").map(Number) as [number, number]
      if (distances[r][c] < minDist) {
        minDist = distances[r][c]
        current = [r, c]
      }
    }

    if (!current || minDist === Number.POSITIVE_INFINITY) break

    const currentKey = `${current[0]},${current[1]}`

    steps.push({
      currentNode: current,
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    unvisited.delete(currentKey)
    explored.add(currentKey)
    frontier.delete(currentKey)

    if (current[0] === end[0] && current[1] === end[1]) {
      const path: [number, number][] = []
      let node: [number, number] | null = end
      while (node) {
        path.unshift(node)
        node = previous[node[0]][node[1]]
      }
      const runtime = performance.now() - startTime
      return {
        path,
        explored,
        frontier,
        nodesExpanded: explored.size,
        pathCost: distances[end[0]][end[1]],
        runtime,
        steps,
      }
    }

    for (const [nr, nc] of getNeighbors(current[0], current[1], rows, cols)) {
      if (!unvisited.has(`${nr},${nc}`) || grid[nr][nc].type === "wall") continue

      const alt = distances[current[0]][current[1]] + grid[nr][nc].weight
      if (alt < distances[nr][nc]) {
        distances[nr][nc] = alt
        previous[nr][nc] = current
        frontier.add(`${nr},${nc}`)
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps,
  }
}

export const bfs = (grid: GridCell[][], start: [number, number], end: [number, number]): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length

  const queue: [number, number][] = [start]
  const visited = new Set<string>()
  const parent = new Map<string, [number, number]>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const steps: PathfindingStep[] = [] // Track each step

  visited.add(`${start[0]},${start[1]}`)
  frontier.add(`${start[0]},${start[1]}`)

  while (queue.length > 0) {
    const current = queue.shift()!

    steps.push({
      currentNode: current,
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    explored.add(`${current[0]},${current[1]}`)
    frontier.delete(`${current[0]},${current[1]}`)

    if (current[0] === end[0] && current[1] === end[1]) {
      const path: [number, number][] = []
      let node: [number, number] | undefined = end
      while (node) {
        path.unshift(node)
        node = parent.get(`${node[0]},${node[1]}`)
      }
      const runtime = performance.now() - startTime
      return {
        path,
        explored,
        frontier,
        nodesExpanded: explored.size,
        pathCost: path.length - 1,
        runtime,
        steps,
      }
    }

    for (const [nr, nc] of getNeighbors(current[0], current[1], rows, cols)) {
      const key = `${nr},${nc}`
      if (!visited.has(key) && grid[nr][nc].type !== "wall") {
        visited.add(key)
        parent.set(key, current)
        queue.push([nr, nc])
        frontier.add(key)
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps,
  }
}

export const dfs = (grid: GridCell[][], start: [number, number], end: [number, number]): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length

  const stack: [number, number][] = [start]
  const visited = new Set<string>()
  const parent = new Map<string, [number, number]>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const steps: PathfindingStep[] = [] // Track each step

  visited.add(`${start[0]},${start[1]}`)
  frontier.add(`${start[0]},${start[1]}`)

  while (stack.length > 0) {
    const current = stack.pop()!

    steps.push({
      currentNode: current,
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    explored.add(`${current[0]},${current[1]}`)
    frontier.delete(`${current[0]},${current[1]}`)

    if (current[0] === end[0] && current[1] === end[1]) {
      const path: [number, number][] = []
      let node: [number, number] | undefined = end
      while (node) {
        path.unshift(node)
        node = parent.get(`${node[0]},${node[1]}`)
      }
      const runtime = performance.now() - startTime
      return {
        path,
        explored,
        frontier,
        nodesExpanded: explored.size,
        pathCost: path.length - 1,
        runtime,
        steps,
      }
    }

    for (const [nr, nc] of getNeighbors(current[0], current[1], rows, cols)) {
      const key = `${nr},${nc}`
      if (!visited.has(key) && grid[nr][nc].type !== "wall") {
        visited.add(key)
        parent.set(key, current)
        stack.push([nr, nc])
        frontier.add(key)
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps,
  }
}

export const greedyBestFirst = (
  grid: GridCell[][],
  start: [number, number],
  end: [number, number],
  heuristic: "manhattan" | "euclidean" | "diagonal" = "manhattan",
): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length
  const heuristicFn = heuristics[heuristic]

  const openSet = new Map<string, Node>()
  const closedSet = new Set<string>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const steps: PathfindingStep[] = [] // Track each step

  const startNode: Node = {
    row: start[0],
    col: start[1],
    g: 0,
    h: heuristicFn(start[0], start[1], end[0], end[1]),
    f: heuristicFn(start[0], start[1], end[0], end[1]),
  }

  openSet.set(`${start[0]},${start[1]}`, startNode)
  frontier.add(`${start[0]},${start[1]}`)

  while (openSet.size > 0) {
    let current: Node | null = null
    let currentKey = ""

    for (const [key, node] of openSet) {
      if (!current || node.h < current.h) {
        current = node
        currentKey = key
      }
    }

    if (!current) break

    steps.push({
      currentNode: [current.row, current.col],
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    openSet.delete(currentKey)
    closedSet.add(currentKey)
    explored.add(currentKey)
    frontier.delete(currentKey)

    if (current.row === end[0] && current.col === end[1]) {
      const path = reconstructPath(current)
      const runtime = performance.now() - startTime
      return {
        path,
        explored,
        frontier,
        nodesExpanded: explored.size,
        pathCost: current.g,
        runtime,
        steps,
      }
    }

    for (const [nr, nc] of getNeighbors(current.row, current.col, rows, cols)) {
      const key = `${nr},${nc}`

      if (closedSet.has(key) || grid[nr][nc].type === "wall") continue

      const g = current.g + grid[nr][nc].weight
      const hValue = heuristicFn(nr, nc, end[0], end[1])

      const neighbor = openSet.get(key)
      if (!neighbor || g < neighbor.g) {
        const newNode: Node = { row: nr, col: nc, g, h: hValue, f: hValue, parent: current }
        openSet.set(key, newNode)
        frontier.add(key)
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps,
  }
}

export const dStarLite = (grid: GridCell[][], start: [number, number], end: [number, number]): PathfindingResult => {
  const startTime = performance.now()
  const rows = grid.length
  const cols = grid[0].length

  interface DStarNode {
    row: number
    col: number
  }

  const openSet = new Map<string, [number, number]>()
  const gValues = new Map<string, number>()
  const rhsValues = new Map<string, number>()
  const explored = new Set<string>()
  const frontier = new Set<string>()
  const parent = new Map<string, [number, number]>()
  const steps: PathfindingStep[] = [] // Added steps tracking for simulation

  const h = (r1: number, c1: number, r2: number, c2: number) => Math.abs(r1 - r2) + Math.abs(c1 - c2)

  const calculateKey = (row: number, col: number) => {
    const key = `${row},${col}`
    const g = gValues.get(key) ?? Number.POSITIVE_INFINITY
    const rhs = rhsValues.get(key) ?? Number.POSITIVE_INFINITY
    const k1 = Math.min(g, rhs) + h(row, col, end[0], end[1])
    const k2 = Math.min(g, rhs)
    return [k1, k2] as [number, number]
  }

  const startKey = `${start[0]},${start[1]}`
  const endKey = `${end[0]},${end[1]}`

  gValues.set(startKey, Number.POSITIVE_INFINITY)
  rhsValues.set(startKey, 0)
  openSet.set(startKey, calculateKey(start[0], start[1]))

  let iterations = 0
  const maxIterations = rows * cols * 2

  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++

    let minNode: [number, number] | null = null
    let minKey: [number, number] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY]
    let minNodeKey = ""

    for (const [key, keyValue] of openSet) {
      if (keyValue[0] < minKey[0] || (keyValue[0] === minKey[0] && keyValue[1] < minKey[1])) {
        minNode = key.split(",").map(Number) as [number, number]
        minKey = keyValue
        minNodeKey = key
      }
    }

    if (!minNode) break

    const g = gValues.get(minNodeKey) ?? Number.POSITIVE_INFINITY
    const rhs = rhsValues.get(minNodeKey) ?? Number.POSITIVE_INFINITY

    steps.push({
      currentNode: minNode,
      explored: new Set(explored),
      frontier: new Set(frontier),
      currentPath: [],
    })

    if (g === rhs) {
      openSet.delete(minNodeKey)
      explored.add(minNodeKey)

      if (minNode[0] === end[0] && minNode[1] === end[1]) {
        const path: [number, number][] = []
        let current: [number, number] | undefined = end
        while (current) {
          path.unshift(current)
          current = parent.get(`${current[0]},${current[1]}`)
        }
        const runtime = performance.now() - startTime
        return {
          path,
          explored,
          frontier,
          nodesExpanded: explored.size,
          pathCost: g,
          runtime,
          steps, // Return steps for simulation
        }
      }

      for (const [nr, nc] of getNeighbors(minNode[0], minNode[1], rows, cols)) {
        if (grid[nr][nc].type === "wall") continue

        const succKey = `${nr},${nc}`
        const cost = grid[nr][nc].weight
        const newRhs = Math.min(rhsValues.get(succKey) ?? Number.POSITIVE_INFINITY, g + cost)
        const oldRhs = rhsValues.get(succKey) ?? Number.POSITIVE_INFINITY

        if (newRhs !== oldRhs) {
          rhsValues.set(succKey, newRhs)
          parent.set(succKey, minNode)

          if (newRhs < Number.POSITIVE_INFINITY) {
            openSet.set(succKey, calculateKey(nr, nc))
            frontier.add(succKey)
          } else {
            openSet.delete(succKey)
          }
        }
      }
    } else {
      const oldG = g
      gValues.set(minNodeKey, rhs)
      openSet.set(minNodeKey, calculateKey(minNode[0], minNode[1]))

      if (oldG > rhs) {
        for (const [nr, nc] of getNeighbors(minNode[0], minNode[1], rows, cols)) {
          if (grid[nr][nc].type === "wall") continue

          const succKey = `${nr},${nc}`
          const cost = grid[nr][nc].weight
          const newRhs = Math.min(rhsValues.get(succKey) ?? Number.POSITIVE_INFINITY, rhs + cost)
          const oldRhs = rhsValues.get(succKey) ?? Number.POSITIVE_INFINITY

          if (newRhs !== oldRhs) {
            rhsValues.set(succKey, newRhs)
            parent.set(succKey, minNode)

            if (newRhs < Number.POSITIVE_INFINITY) {
              openSet.set(succKey, calculateKey(nr, nc))
              frontier.add(succKey)
            } else {
              openSet.delete(succKey)
            }
          }
        }
      }
    }
  }

  const runtime = performance.now() - startTime
  return {
    path: [],
    explored,
    frontier,
    nodesExpanded: explored.size,
    pathCost: Number.POSITIVE_INFINITY,
    runtime,
    steps, // Return steps even if no path found
  }
}

export const runAlgorithm = (
  algorithm: string,
  grid: GridCell[][],
  start: [number, number],
  end: [number, number],
  heuristic = "manhattan",
): PathfindingResult => {
  switch (algorithm) {
    case "A*":
      return aStar(grid, start, end, heuristic as "manhattan" | "euclidean" | "diagonal")
    case "Dijkstra":
      return dijkstra(grid, start, end)
    case "BFS":
      return bfs(grid, start, end)
    case "DFS":
      return dfs(grid, start, end)
    case "Greedy Best-First":
      return greedyBestFirst(grid, start, end, heuristic as "manhattan" | "euclidean" | "diagonal")
    case "D* Lite":
      return dStarLite(grid, start, end)
    default:
      return aStar(grid, start, end, heuristic as "manhattan" | "euclidean" | "diagonal")
  }
}
