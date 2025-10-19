import { runAlgorithm } from "@/lib/pathfinding-algorithms"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { algorithm, grid, start, end, heuristic } = await request.json()

    if (!algorithm || !grid || !start || !end) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = runAlgorithm(algorithm, grid, start, end, heuristic || "manhattan")

    return NextResponse.json({
      success: true,
      data: {
        algorithm,
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        runtime: result.runtime,
        pathLength: result.path.length,
        pathFound: result.path.length > 0,
      },
    })
  } catch (error) {
    console.error("Algorithm execution error:", error)
    return NextResponse.json({ error: "Failed to run algorithm" }, { status: 500 })
  }
}
