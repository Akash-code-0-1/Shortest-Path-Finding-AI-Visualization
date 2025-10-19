// Advanced AI Model using Vercel AI SDK for intelligent pathfinding recommendations
import { generateText } from "ai"

export interface GridAnalysis {
  gridSize: number
  wallDensity: number
  averageWeight: number
  pathLength: number
  startToEndDistance: number
  complexity: "simple" | "moderate" | "complex"
}

export interface AIRecommendation {
  algorithm: string
  confidence: number
  reasoning: string
  expectedPerformance: {
    estimatedRuntime: string
    estimatedNodesExpanded: string
    suitability: string
  }
}

export class AdvancedAIModel {
  private executionHistory: any[] = []
  private modelAccuracy = 0.75
  private totalPredictions = 0
  private correctPredictions = 0

  async analyzeGridAndRecommend(gridFeatures: GridAnalysis): Promise<AIRecommendation> {
    try {
      const prompt = `You are an expert pathfinding algorithm analyst. Analyze this grid configuration and recommend the best algorithm.

Grid Analysis:
- Grid Size: ${gridFeatures.gridSize} cells
- Wall Density: ${(gridFeatures.wallDensity * 100).toFixed(1)}%
- Average Terrain Weight: ${gridFeatures.averageWeight.toFixed(2)}
- Path Length: ${gridFeatures.pathLength.toFixed(1)} units
- Manhattan Distance: ${gridFeatures.startToEndDistance} units
- Complexity Level: ${gridFeatures.complexity}

Available Algorithms:
1. A* - Heuristic-based, excellent for weighted grids
2. Dijkstra - Guaranteed shortest path, good for weighted grids
3. BFS - Fast for unweighted grids
4. D* Lite - Optimal for dynamic obstacles
5. Bidirectional - Efficient for large grids
6. DFS - Memory efficient but not optimal

Provide your recommendation in this exact JSON format:
{
  "algorithm": "algorithm name",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation",
  "expectedRuntime": "fast/moderate/slow",
  "expectedNodesExpanded": "low/moderate/high",
  "suitability": "why this algorithm fits"
}`

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        temperature: 0.3,
      })

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.getFallbackRecommendation(gridFeatures)
      }

      const aiResponse = JSON.parse(jsonMatch[0])

      return {
        algorithm: aiResponse.algorithm,
        confidence: Math.min(0.99, Math.max(0.5, aiResponse.confidence)),
        reasoning: aiResponse.reasoning,
        expectedPerformance: {
          estimatedRuntime: aiResponse.expectedRuntime,
          estimatedNodesExpanded: aiResponse.expectedNodesExpanded,
          suitability: aiResponse.suitability,
        },
      }
    } catch (error) {
      console.error("[v0] AI recommendation failed:", error)
      return this.getFallbackRecommendation(gridFeatures)
    }
  }

  private getFallbackRecommendation(features: GridAnalysis): AIRecommendation {
    let algorithm = "A*"
    const confidence = 0.75
    let reasoning = "Using heuristic analysis"

    if (features.wallDensity > 0.5) {
      algorithm = "D* Lite"
      reasoning = "High wall density detected - D* Lite excels with obstacles"
    } else if (features.averageWeight > 2) {
      algorithm = "Dijkstra"
      reasoning = "High terrain weights - Dijkstra guarantees optimal path"
    } else if (features.gridSize < 500 && features.wallDensity < 0.2) {
      algorithm = "BFS"
      reasoning = "Small unweighted grid - BFS is fast and efficient"
    } else if (features.gridSize > 10000) {
      algorithm = "Bidirectional"
      reasoning = "Large grid - Bidirectional search reduces search space"
    }

    return {
      algorithm,
      confidence,
      reasoning,
      expectedPerformance: {
        estimatedRuntime: confidence > 0.8 ? "fast" : "moderate",
        estimatedNodesExpanded: features.wallDensity > 0.3 ? "moderate" : "low",
        suitability: reasoning,
      },
    }
  }

  recordPrediction(predicted: string, actual: string, success: boolean) {
    this.totalPredictions++
    if (predicted === actual && success) {
      this.correctPredictions++
    }
    this.modelAccuracy = this.correctPredictions / Math.max(1, this.totalPredictions)
  }

  getModelAccuracy(): number {
    return Math.min(0.99, Math.max(0.5, this.modelAccuracy))
  }

  getTotalPredictions(): number {
    return this.totalPredictions
  }
}

export const advancedAIModel = new AdvancedAIModel()
