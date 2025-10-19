import { predictor } from "@/lib/ml-model"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { trainingData } = await request.json()

    if (!trainingData || !Array.isArray(trainingData)) {
      return NextResponse.json({ error: "Invalid training data" }, { status: 400 })
    }

    predictor.train(trainingData)

    return NextResponse.json({
      success: true,
      message: "Model trained successfully",
    })
  } catch (error) {
    console.error("Training error:", error)
    return NextResponse.json({ error: "Failed to train model" }, { status: 500 })
  }
}
