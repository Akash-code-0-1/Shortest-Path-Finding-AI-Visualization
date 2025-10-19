"use client"

import { useState } from "react"

export function Header() {
  const [showDocModal, setShowDocModal] = useState(false)

  const handleGitHub = () => {
    window.open("https://github.com/yourusername/pathai", "_blank")
  }

  const handleDocumentation = () => {
    setShowDocModal(true)
  }

  return (
    <>
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">PathAI</h1>
              <p className="text-xs text-muted-foreground">Pathfinding Visualization & Optimization</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDocumentation}
              className="px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
            >
              Documentation
            </button>
            <button
              onClick={handleGitHub}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              GitHub
            </button>
          </div>
        </div>
      </header>

      {showDocModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl max-h-96 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">PathAI Documentation</h2>
              <button onClick={() => setShowDocModal(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                <strong>PathAI</strong> is an interactive pathfinding algorithm visualization and optimization platform
                with ML-driven recommendations.
              </p>
              <div>
                <strong>Features:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>6 pathfinding algorithms (A*, Dijkstra, BFS, DFS, Greedy Best-First, D* Lite)</li>
                  <li>Real-time visualization with step-by-step simulation</li>
                  <li>Ensemble ML system for algorithm recommendations</li>
                  <li>Performance analytics and comparison</li>
                  <li>Interactive grid editor with terrain weights</li>
                </ul>
              </div>
              <div>
                <strong>How to Use:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Draw walls and set terrain weights on the grid</li>
                  <li>Select start and end points</li>
                  <li>Choose an algorithm and heuristic</li>
                  <li>Click "Run Algorithm" to execute</li>
                  <li>Use "Start Simulation" to see step-by-step traversal</li>
                </ol>
              </div>
              <p>
                <strong>ML System:</strong> The ensemble ML model learns from each execution and provides confidence
                scores for algorithm recommendations based on grid characteristics.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
