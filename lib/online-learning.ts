import { EnsembleMLModel, type TrainingData } from "./ml-models"

export interface ExecutionData {
  gridFeatures: {
    gridSize: number
    wallDensity: number
    averageWeight: number
    pathLength: number
    startToEndDistance: number
  }
  algorithm: string
  runtime: number
  nodesExpanded: number
  pathCost: number
  pathFound: boolean
  timestamp: number
}

export interface ModelMetrics {
  accuracy: number
  loss: number
  totalSamples: number
  lastUpdated: number
  bestAlgorithm: string
  recommendationConfidence: number
}

export interface AlgorithmInsight {
  algorithm: string
  weight: number
  avgRuntime: number
  avgNodesExpanded: number
  successRate: number
  bestFor: string
}

export class OnlineLearningSystem {
  private executionBuffer: ExecutionData[] = []
  private executionHistory: ExecutionData[] = []
  private ensembleModel: EnsembleMLModel
  private modelMetrics: ModelMetrics = {
    accuracy: 0.5,
    loss: 0.5,
    totalSamples: 0,
    lastUpdated: Date.now(),
    bestAlgorithm: "A*",
    recommendationConfidence: 0.5,
  }
  private algorithmStats: Record<string, { runtimes: number[]; nodesExpanded: number[]; successCount: number }> = {
    "A*": { runtimes: [], nodesExpanded: [], successCount: 0 },
    Dijkstra: { runtimes: [], nodesExpanded: [], successCount: 0 },
    BFS: { runtimes: [], nodesExpanded: [], successCount: 0 },
    DFS: { runtimes: [], nodesExpanded: [], successCount: 0 },
    "Greedy Best-First": { runtimes: [], nodesExpanded: [], successCount: 0 },
    "D* Lite": { runtimes: [], nodesExpanded: [], successCount: 0 },
  }
  private batchSize = 2
  private learningRate = 0.15
  private validationCorrect = 0
  private validationTotal = 0

  constructor() {
    this.ensembleModel = new EnsembleMLModel()
  }

  addExecution(data: ExecutionData) {
    this.executionBuffer.push(data)
    this.executionHistory.push(data)

    if (this.executionHistory.length > 100) {
      this.executionHistory.shift()
    }

    if (this.executionBuffer.length >= this.batchSize) {
      this.trainBatch()
    }
  }

  private trainBatch() {
    if (this.executionBuffer.length === 0) return

    const batch = this.executionBuffer.splice(0, this.batchSize)

    for (const execution of batch) {
      if (!this.algorithmStats[execution.algorithm]) {
        this.algorithmStats[execution.algorithm] = { runtimes: [], nodesExpanded: [], successCount: 0 }
      }

      const stats = this.algorithmStats[execution.algorithm]
      stats.runtimes.push(execution.runtime)
      stats.nodesExpanded.push(execution.nodesExpanded)
      if (execution.pathFound) stats.successCount++
    }

    if (this.executionHistory.length < this.batchSize) return

    const trainingData: TrainingData[] = this.executionHistory.map((exec) => {
      const runtimeScore = Math.max(0.1, 1 - exec.runtime / 100)
      const nodesScore = Math.max(0.1, 1 - exec.nodesExpanded / 1000)
      const pathFoundBonus = exec.pathFound ? 1.0 : 0.2
      const performance = ((runtimeScore + nodesScore) / 2) * pathFoundBonus

      return {
        features: exec.gridFeatures,
        label: exec.algorithm,
        performance,
      }
    })

    this.ensembleModel.train(trainingData)
    this.calculateAccuracy(batch)
    this.updateMetrics(batch)
  }

  private calculateAccuracy(batch: ExecutionData[]) {
    for (const execution of batch) {
      const prediction = this.ensembleModel.predict(execution.gridFeatures)

      // Find the best algorithm for this grid (highest success rate)
      let bestAlgo = execution.algorithm
      let bestSuccessRate = 0

      for (const [algo, stats] of Object.entries(this.algorithmStats)) {
        if (stats.runtimes.length > 0) {
          const successRate = stats.successCount / stats.runtimes.length
          if (successRate > bestSuccessRate) {
            bestSuccessRate = successRate
            bestAlgo = algo
          }
        }
      }

      // Check if prediction matches the best algorithm
      if (prediction.label === bestAlgo) {
        this.validationCorrect++
      }
      this.validationTotal++
    }
  }

  private updateMetrics(batch: ExecutionData[]) {
    const successRate = batch.filter((e) => e.pathFound).length / batch.length

    if (this.executionHistory.length > 0) {
      const lastExecution = this.executionHistory[this.executionHistory.length - 1]
      const prediction = this.ensembleModel.predict(lastExecution.gridFeatures)

      this.modelMetrics.bestAlgorithm = prediction.label

      const validationAccuracy = this.validationTotal > 0 ? this.validationCorrect / this.validationTotal : 0.5

      const sampleBoost = Math.min(0.3, (this.executionHistory.length / 100) * 0.3)
      const successBoost = successRate * 0.2
      const accuracyBoost = validationAccuracy * 0.5

      const improvedConfidence = Math.min(0.99, Math.max(0.5, 0.5 + sampleBoost + successBoost + accuracyBoost))

      this.modelMetrics.recommendationConfidence = improvedConfidence
      this.modelMetrics.accuracy = Math.min(0.99, Math.max(0.5, validationAccuracy))
      this.modelMetrics.loss = Math.max(0.01, 1 - this.modelMetrics.accuracy)
    }

    this.modelMetrics.totalSamples = this.modelMetrics.totalSamples + batch.length
    this.modelMetrics.lastUpdated = Date.now()
  }

  predictBestAlgorithm(features: any): string {
    const prediction = this.ensembleModel.predict(features)
    return prediction.label
  }

  getAlgorithmInsights(): AlgorithmInsight[] {
    const insights: AlgorithmInsight[] = []

    for (const [algo, stats] of Object.entries(this.algorithmStats)) {
      const avgRuntime =
        stats.runtimes.length > 0 ? stats.runtimes.reduce((a, b) => a + b, 0) / stats.runtimes.length : 0
      const avgNodesExpanded =
        stats.nodesExpanded.length > 0 ? stats.nodesExpanded.reduce((a, b) => a + b, 0) / stats.nodesExpanded.length : 0
      const successRate = stats.runtimes.length > 0 ? stats.successCount / stats.runtimes.length : 0

      let bestFor = "General purpose"
      if (algo === "A*") bestFor = "Weighted grids & long paths"
      else if (algo === "Dijkstra") bestFor = "Weighted grids"
      else if (algo === "BFS") bestFor = "Unweighted grids"
      else if (algo === "D* Lite") bestFor = "Dynamic obstacles"
      else if (algo === "Greedy Best-First") bestFor = "Fast approximations"

      const weight = stats.runtimes.length > 0 ? successRate : 0.166

      insights.push({
        algorithm: algo,
        weight,
        avgRuntime,
        avgNodesExpanded,
        successRate,
        bestFor,
      })
    }

    return insights.sort((a, b) => b.weight - a.weight)
  }

  getMetrics(): ModelMetrics {
    return { ...this.modelMetrics }
  }

  exportModel(): string {
    return JSON.stringify({
      metrics: this.modelMetrics,
      timestamp: Date.now(),
    })
  }

  importModel(modelJson: string) {
    try {
      const model = JSON.parse(modelJson)
      this.modelMetrics = model.metrics
    } catch (error) {
      console.error("Failed to import model:", error)
    }
  }
}

export const onlineLearner = new OnlineLearningSystem()
