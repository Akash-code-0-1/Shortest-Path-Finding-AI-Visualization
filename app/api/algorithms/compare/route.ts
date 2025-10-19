import { runAlgorithm } from "@/lib/pathfinding-algorithms"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { grid, start, end } = await request.json()

    if (!grid || !start || !end) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const algorithms = ["A*", "Dijkstra", "BFS", "DFS", "Bidirectional", "D* Lite"]
    const results: Record<string, any> = {}

    for (const algo of algorithms) {
      const result = runAlgorithm(algo, grid, start, end, "manhattan")
      results[algo] = {
        nodesExpanded: result.nodesExpanded,
        pathCost: result.pathCost,
        runtime: result.runtime,
        pathLength: result.path.length,
        pathFound: result.path.length > 0,
      }
    }

    // Sort by runtime
    const sorted = Object.entries(results).sort((a, b) => a[1].runtime - b[1].runtime)

    return NextResponse.json({
      success: true,
      data: {
        results,
        fastest: sorted[0][0],
        mostEfficient: Object.entries(results).sort((a, b) => a[1].nodesExpanded - b[1].nodesExpanded)[0][0],
      },
    })
  } catch (error) {
    console.error("Comparison error:", error)
    return NextResponse.json({ error: "Failed to compare algorithms" }, { status: 500 })
  }
}
