import { onlineLearner } from "@/lib/online-learning"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const modelJson = onlineLearner.exportModel()

    return NextResponse.json({
      success: true,
      data: {
        model: modelJson,
        timestamp: Date.now(),
      },
    })
  } catch (error) {
    console.error("Model export error:", error)
    return NextResponse.json({ error: "Failed to export model" }, { status: 500 })
  }
}
