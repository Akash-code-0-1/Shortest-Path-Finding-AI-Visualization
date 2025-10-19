export interface TrainingData {
  features: {
    gridSize: number
    wallDensity: number
    averageWeight: number
    pathLength: number
    startToEndDistance: number
  }
  label: string // algorithm name
  performance: number // 0-1 score
}

// Decision Tree Node
interface DTNode {
  feature?: string
  threshold?: number
  left?: DTNode
  right?: DTNode
  label?: string
  confidence?: number
}

// Decision Tree Classifier
export class DecisionTreeClassifier {
  private tree: DTNode | null = null
  private trainingData: TrainingData[] = []
  private maxDepth = 5
  private minSamples = 2

  train(data: TrainingData[]) {
    this.trainingData = data
    if (data.length < this.minSamples) return
    this.tree = this.buildTree(data, 0)
  }

  private buildTree(data: TrainingData[], depth: number): DTNode {
    if (depth >= this.maxDepth || data.length < this.minSamples) {
      return this.createLeaf(data)
    }

    const bestSplit = this.findBestSplit(data)
    if (!bestSplit) {
      return this.createLeaf(data)
    }

    const { feature, threshold } = bestSplit
    const left = data.filter((d) => d.features[feature as keyof typeof d.features] <= threshold)
    const right = data.filter((d) => d.features[feature as keyof typeof d.features] > threshold)

    if (left.length === 0 || right.length === 0) {
      return this.createLeaf(data)
    }

    return {
      feature,
      threshold,
      left: this.buildTree(left, depth + 1),
      right: this.buildTree(right, depth + 1),
    }
  }

  private findBestSplit(data: TrainingData[]): { feature: string; threshold: number } | null {
    const features = ["gridSize", "wallDensity", "averageWeight", "pathLength", "startToEndDistance"]
    let bestGain = 0
    let bestSplit = null

    for (const feature of features) {
      const values = data.map((d) => d.features[feature as keyof typeof d.features]).sort((a, b) => a - b)
      const uniqueValues = [...new Set(values)]

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2
        const left = data.filter((d) => d.features[feature as keyof typeof d.features] <= threshold)
        const right = data.filter((d) => d.features[feature as keyof typeof d.features] > threshold)

        if (left.length === 0 || right.length === 0) continue

        const gain = this.calculateGain(data, left, right)
        if (gain > bestGain) {
          bestGain = gain
          bestSplit = { feature, threshold }
        }
      }
    }

    return bestSplit
  }

  private calculateGain(parent: TrainingData[], left: TrainingData[], right: TrainingData[]): number {
    const parentEntropy = this.calculateEntropy(parent)
    const leftEntropy = this.calculateEntropy(left)
    const rightEntropy = this.calculateEntropy(right)

    const weightedEntropy = (left.length / parent.length) * leftEntropy + (right.length / parent.length) * rightEntropy
    return parentEntropy - weightedEntropy
  }

  private calculateEntropy(data: TrainingData[]): number {
    const labels = new Map<string, number>()
    for (const d of data) {
      labels.set(d.label, (labels.get(d.label) || 0) + 1)
    }

    let entropy = 0
    for (const count of labels.values()) {
      const p = count / data.length
      entropy -= p * Math.log2(p)
    }
    return entropy
  }

  private createLeaf(data: TrainingData[]): DTNode {
    const labels = new Map<string, number>()
    for (const d of data) {
      labels.set(d.label, (labels.get(d.label) || 0) + 1)
    }

    const mostCommon = Array.from(labels.entries()).sort((a, b) => b[1] - a[1])[0]
    const confidence = mostCommon ? mostCommon[1] / data.length : 0.5

    return {
      label: mostCommon?.[0] || "A*",
      confidence,
    }
  }

  predict(features: any): { label: string; confidence: number } {
    if (!this.tree) return { label: "A*", confidence: 0.5 }
    return this.traverse(this.tree, features)
  }

  private traverse(node: DTNode, features: any): { label: string; confidence: number } {
    if (!node.feature) {
      return { label: node.label || "A*", confidence: node.confidence || 0.5 }
    }

    const value = features[node.feature]
    const nextNode = value <= node.threshold! ? node.left : node.right

    if (!nextNode) {
      return { label: node.label || "A*", confidence: node.confidence || 0.5 }
    }

    return this.traverse(nextNode, features)
  }
}

// Naive Bayes Classifier
export class NaiveBayesClassifier {
  private classStats: Map<string, { mean: Map<string, number>; variance: Map<string, number>; count: number }> =
    new Map()
  private priors: Map<string, number> = new Map()
  private totalSamples = 0

  train(data: TrainingData[]) {
    this.totalSamples = data.length
    const grouped = new Map<string, TrainingData[]>()

    for (const d of data) {
      if (!grouped.has(d.label)) grouped.set(d.label, [])
      grouped.get(d.label)!.push(d)
    }

    for (const [label, samples] of grouped) {
      const features = ["gridSize", "wallDensity", "averageWeight", "pathLength", "startToEndDistance"]
      const mean = new Map<string, number>()
      const variance = new Map<string, number>()

      for (const feature of features) {
        const values = samples.map((s) => s.features[feature as keyof typeof s.features])
        const avg = values.reduce((a, b) => a + b, 0) / values.length
        const variance_val = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length

        mean.set(feature, avg)
        variance.set(feature, Math.max(variance_val, 0.01)) // Avoid division by zero
      }

      this.classStats.set(label, { mean, variance, count: samples.length })
      this.priors.set(label, samples.length / this.totalSamples)
    }
  }

  predict(features: any): { label: string; confidence: number } {
    const scores = new Map<string, number>()

    for (const [label, stats] of this.classStats) {
      let score = Math.log(this.priors.get(label) || 0.1)

      for (const [feature, value] of Object.entries(features)) {
        const mean = stats.mean.get(feature) || 0
        const variance = stats.variance.get(feature) || 1
        const numerator = Math.pow((value as number) - mean, 2)
        const denominator = 2 * variance
        const power = -numerator / denominator
        score += power - 0.5 * Math.log(2 * Math.PI * variance)
      }

      scores.set(label, score)
    }

    const bestLabel = Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0]
    const confidence = Math.min(0.99, Math.max(0.5, 1 / (1 + Math.exp(-bestLabel[1]))))

    return { label: bestLabel[0], confidence }
  }
}

// K-Nearest Neighbors Classifier
export class KNNClassifier {
  private trainingData: TrainingData[] = []
  private k = 5

  train(data: TrainingData[]) {
    this.trainingData = data
    this.k = Math.min(5, Math.max(1, Math.floor(data.length / 3)))
  }

  predict(features: any): { label: string; confidence: number } {
    if (this.trainingData.length === 0) {
      return { label: "A*", confidence: 0.5 }
    }

    const distances = this.trainingData.map((d) => ({
      label: d.label,
      distance: this.euclideanDistance(features, d.features),
      performance: d.performance,
    }))

    const nearest = distances.sort((a, b) => a.distance - b.distance).slice(0, this.k)

    const labelVotes = new Map<string, { count: number; avgPerformance: number }>()
    for (const n of nearest) {
      if (!labelVotes.has(n.label)) {
        labelVotes.set(n.label, { count: 0, avgPerformance: 0 })
      }
      const stats = labelVotes.get(n.label)!
      stats.count++
      stats.avgPerformance += n.performance
    }

    let bestLabel = "A*"
    let bestCount = 0
    let bestPerformance = 0

    for (const [label, stats] of labelVotes) {
      stats.avgPerformance /= stats.count
      if (stats.count > bestCount || (stats.count === bestCount && stats.avgPerformance > bestPerformance)) {
        bestLabel = label
        bestCount = stats.count
        bestPerformance = stats.avgPerformance
      }
    }

    const confidence = Math.min(0.99, Math.max(0.5, (bestCount / this.k) * 0.5 + bestPerformance * 0.5))

    return { label: bestLabel, confidence }
  }

  private euclideanDistance(a: any, b: any): number {
    const features = ["gridSize", "wallDensity", "averageWeight", "pathLength", "startToEndDistance"]
    let sum = 0
    for (const feature of features) {
      sum += Math.pow((a[feature] || 0) - (b[feature] || 0), 2)
    }
    return Math.sqrt(sum)
  }
}

// Ensemble Model combining all three
export class EnsembleMLModel {
  private dt: DecisionTreeClassifier
  private nb: NaiveBayesClassifier
  private knn: KNNClassifier
  private trainingData: TrainingData[] = []

  constructor() {
    this.dt = new DecisionTreeClassifier()
    this.nb = new NaiveBayesClassifier()
    this.knn = new KNNClassifier()
  }

  train(data: TrainingData[]) {
    this.trainingData = data
    this.dt.train(data)
    this.nb.train(data)
    this.knn.train(data)
  }

  predict(features: any): { label: string; confidence: number } {
    const dtPred = this.dt.predict(features)
    const nbPred = this.nb.predict(features)
    const knnPred = this.knn.predict(features)

    // Voting system
    const votes = new Map<string, { count: number; confidences: number[] }>()

    for (const pred of [dtPred, nbPred, knnPred]) {
      if (!votes.has(pred.label)) {
        votes.set(pred.label, { count: 0, confidences: [] })
      }
      const v = votes.get(pred.label)!
      v.count++
      v.confidences.push(pred.confidence)
    }

    let bestLabel = "A*"
    let bestCount = 0
    let bestConfidence = 0.5

    for (const [label, v] of votes) {
      const avgConfidence = v.confidences.reduce((a, b) => a + b, 0) / v.confidences.length
      if (v.count > bestCount || (v.count === bestCount && avgConfidence > bestConfidence)) {
        bestLabel = label
        bestCount = v.count
        bestConfidence = avgConfidence
      }
    }

    // Boost confidence based on voting agreement
    const votingConfidence = Math.min(0.99, Math.max(0.5, (bestCount / 3) * 0.5 + bestConfidence * 0.5))

    return { label: bestLabel, confidence: votingConfidence }
  }

  getTrainingDataSize(): number {
    return this.trainingData.length
  }
}
