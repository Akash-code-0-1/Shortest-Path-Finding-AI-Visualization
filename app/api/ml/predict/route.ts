import { predictor } from "@/lib/ml-model"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { grid, start, end } = await request.json()

    if (!grid || !start || !end) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const features = predictor.extractFeatures(grid, start, end)
    const bestAlgorithm = predictor.predictBestAlgorithm(features)
    const recommendations = predictor.getAlgorithmRecommendations(features)

    return NextResponse.json({
      success: true,
      data: {
        features,
        bestAlgorithm,
        recommendations,
      },
    })
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ error: "Failed to predict algorithm" }, { status: 500 })
  }
}
