// ML Model for predicting best algorithm based on grid characteristics

export interface GridFeatures {
  gridSize: number
  wallDensity: number
  averageWeight: number
  pathLength: number
  startToEndDistance: number
}

export interface AlgorithmPerformance {
  algorithm: string
  runtime: number
  nodesExpanded: number
  pathCost: number
}

interface TrainingData {
  features: GridFeatures
  bestAlgorithm: string
  performances: AlgorithmPerformance[]
}

// Simple ML model using weighted scoring
export class AlgorithmPredictor {
  private trainingData: TrainingData[] = []
  private weights: Record<string, number> = {
    "A*": 0.3,
    Dijkstra: 0.15,
    BFS: 0.2,
    DFS: 0.1,
    Bidirectional: 0.15,
    "D* Lite": 0.1,
  }

  addTrainingData(data: TrainingData) {
    this.trainingData.push(data)
  }

  extractFeatures(grid: any[][], start: [number, number], end: [number, number]): GridFeatures {
    const rows = grid.length
    const cols = grid[0].length
    const gridSize = rows * cols

    let wallCount = 0
    let totalWeight = 0

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c].type === "wall") wallCount++
        totalWeight += grid[r][c].weight
      }
    }

    const wallDensity = wallCount / gridSize
    const averageWeight = totalWeight / gridSize
    const pathLength = Math.sqrt((start[0] - end[0]) ** 2 + (start[1] - end[1]) ** 2)
    const startToEndDistance = Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1])

    return {
      gridSize,
      wallDensity,
      averageWeight,
      pathLength,
      startToEndDistance,
    }
  }

  predictBestAlgorithm(features: GridFeatures): string {
    // Simple heuristic-based prediction
    const { gridSize, wallDensity, averageWeight, startToEndDistance } = features

    // For small grids with low wall density, BFS is often good
    if (gridSize < 1000 && wallDensity < 0.2) {
      return "BFS"
    }

    // For weighted grids, A* or Dijkstra
    if (averageWeight > 1.5) {
      return "A*"
    }

    // For large grids with high wall density, Bidirectional
    if (gridSize > 5000 && wallDensity > 0.3) {
      return "Bidirectional"
    }

    // For long paths, A* with heuristic
    if (startToEndDistance > 50) {
      return "A*"
    }

    // Default to A*
    return "A*"
  }

  getAlgorithmRecommendations(features: GridFeatures): Array<{ algorithm: string; score: number }> {
    const recommendations: Array<{ algorithm: string; score: number }> = []

    const { gridSize, wallDensity, averageWeight, startToEndDistance } = features

    // Score each algorithm based on features
    const scores: Record<string, number> = {
      "A*": 0.8 - wallDensity * 0.1 + (averageWeight > 1 ? 0.2 : 0),
      Dijkstra: 0.6 + (averageWeight > 1 ? 0.3 : 0),
      BFS: 0.7 - wallDensity * 0.2 - (averageWeight > 1 ? 0.2 : 0),
      DFS: 0.5 - wallDensity * 0.3,
      Bidirectional: 0.75 + (gridSize > 5000 ? 0.2 : 0) + (wallDensity > 0.3 ? 0.1 : 0),
      "D* Lite": 0.6 + (wallDensity > 0.4 ? 0.2 : 0),
    }

    for (const [algo, score] of Object.entries(scores)) {
      recommendations.push({ algorithm: algo, score: Math.max(0, Math.min(1, score)) })
    }

    return recommendations.sort((a, b) => b.score - a.score)
  }

  train(trainingData: TrainingData[]) {
    // Update weights based on training data
    const algorithmScores: Record<string, number[]> = {
      "A*": [],
      Dijkstra: [],
      BFS: [],
      DFS: [],
      Bidirectional: [],
      "D* Lite": [],
    }

    for (const data of trainingData) {
      for (const perf of data.performances) {
        algorithmScores[perf.algorithm].push(perf.runtime)
      }
    }

    // Normalize scores to weights
    const totalScore = Object.values(algorithmScores).reduce((sum, scores) => {
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      return sum + 1 / (avg + 1)
    }, 0)

    for (const [algo, scores] of Object.entries(algorithmScores)) {
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      this.weights[algo] = 1 / (avg + 1) / totalScore
    }
  }
}

export const predictor = new AlgorithmPredictor()
