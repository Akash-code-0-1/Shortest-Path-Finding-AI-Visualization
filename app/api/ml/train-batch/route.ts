import { onlineLearner } from "@/lib/online-learning"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { executions } = await request.json()

    if (!executions || !Array.isArray(executions)) {
      return NextResponse.json({ error: "Invalid execution data" }, { status: 400 })
    }

    // Add executions to online learner
    for (const execution of executions) {
      onlineLearner.addExecution(execution)
    }

    const metrics = onlineLearner.getMetrics()

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        samplesProcessed: executions.length,
      },
    })
  } catch (error) {
    console.error("Batch training error:", error)
    return NextResponse.json({ error: "Failed to train batch" }, { status: 500 })
  }
}
