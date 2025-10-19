import { onlineLearner } from "@/lib/online-learning"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const metrics = onlineLearner.getMetrics()
    const weights = onlineLearner.getWeights()

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        weights,
      },
    })
  } catch (error) {
    console.error("Metrics retrieval error:", error)
    return NextResponse.json({ error: "Failed to retrieve metrics" }, { status: 500 })
  }
}
