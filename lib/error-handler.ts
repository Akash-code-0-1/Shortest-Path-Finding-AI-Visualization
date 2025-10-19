export class PathAIError extends Error {
  constructor(
    public code: string,
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message)
    this.name = "PathAIError"
  }
}

export const handleError = (error: unknown, context?: string) => {
  if (error instanceof PathAIError) {
    console.error(`[PathAI Error] ${error.code}: ${error.message}`, error.context)
    return error
  }

  if (error instanceof Error) {
    console.error(`[PathAI Error] ${context || "Unknown"}: ${error.message}`)
    return new PathAIError("UNKNOWN_ERROR", error.message, { originalError: error })
  }

  console.error(`[PathAI Error] ${context || "Unknown"}:`, error)
  return new PathAIError("UNKNOWN_ERROR", String(error))
}

export const validateGridState = (gridState: any): boolean => {
  if (!gridState || !gridState.cells) {
    throw new PathAIError("INVALID_GRID", "Grid state is invalid or not initialized")
  }

  if (gridState.cells.length === 0) {
    throw new PathAIError("EMPTY_GRID", "Grid has no cells")
  }

  if (!gridState.start || !gridState.end) {
    throw new PathAIError("MISSING_POINTS", "Start or end point not set")
  }

  return true
}

export const validateAlgorithmResult = (result: any): boolean => {
  if (!result) {
    throw new PathAIError("NULL_RESULT", "Algorithm returned null result")
  }

  if (!Array.isArray(result.path)) {
    throw new PathAIError("INVALID_PATH", "Algorithm result path is not an array")
  }

  if (typeof result.runtime !== "number") {
    throw new PathAIError("INVALID_RUNTIME", "Algorithm result runtime is not a number")
  }

  return true
}
