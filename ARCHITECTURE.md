# PathAI Architecture

## Project Structure

\`\`\`
pathai/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── header.tsx          # Header with navigation
│   ├── algorithm-panel.tsx # Algorithm controls
│   ├── visualization-canvas.tsx # Canvas rendering
│   ├── grid-editor.tsx     # Grid editing tools
│   ├── analytics-dashboard.tsx # Performance analytics
│   └── ml-training-monitor.tsx # ML metrics display
├── lib/
│   ├── pathfinding-algorithms.ts # Algorithm implementations
│   ├── ml-models.ts        # ML model implementations
│   ├── online-learning.ts  # Online learning system
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
\`\`\`

## Component Architecture

### Data Flow

\`\`\`
User Input (Grid Editor)
    ↓
Algorithm Execution (Algorithm Panel)
    ↓
Visualization (Canvas)
    ↓
ML Training (Online Learning System)
    ↓
Metrics Display (ML Monitor & Analytics)
\`\`\`

### State Management

- **Grid State**: Grid configuration, cells, start/end points
- **Run State**: Algorithm selection, execution results
- **Training Metrics**: ML model performance, confidence
- **Execution History**: Past algorithm executions

### Key Components

#### Algorithm Panel
- Algorithm selection
- Heuristic selection
- Run/Compare controls
- Results display

#### Visualization Canvas
- Grid rendering
- Algorithm visualization
- Drawing tools
- Simulation controls

#### ML Training Monitor
- Model metrics display
- Confidence tracking
- Algorithm insights
- Performance comparison

## Algorithm Implementations

All algorithms follow the same interface:

\`\`\`typescript
interface PathfindingResult {
  path: [number, number][]
  explored: Set<string>
  frontier: Set<string>
  nodesExpanded: number
  pathCost: number
  runtime: number
  steps?: PathfindingStep[]
}
\`\`\`

### Supported Algorithms

1. **A*** - Heuristic-based optimal search
2. **Dijkstra** - Uniform cost search
3. **BFS** - Breadth-first search
4. **DFS** - Depth-first search
5. **Greedy Best-First** - Heuristic-only search
6. **D* Lite** - Incremental search for dynamic environments

## ML System Architecture

### Ensemble Model

Combines three ML algorithms:

1. **Decision Tree**
   - Learns decision boundaries
   - Splits on grid features
   - Provides interpretable decisions

2. **Naive Bayes**
   - Probabilistic classifier
   - Calculates feature distributions
   - Fast inference

3. **K-Nearest Neighbors**
   - Instance-based learning
   - Finds similar past scenarios
   - Weighted voting

### Training Pipeline

\`\`\`
Execution Data
    ↓
Feature Extraction (Grid characteristics)
    ↓
Model Training (Batch processing)
    ↓
Prediction & Accuracy Calculation
    ↓
Metrics Update (Confidence, Loss, Accuracy)
\`\`\`

### Grid Features

- **gridSize**: Total number of cells
- **wallDensity**: Percentage of walls
- **averageWeight**: Mean terrain weight
- **pathLength**: Manhattan distance from start to end
- **startToEndDistance**: Euclidean distance

## Performance Optimizations

1. **Canvas Rendering**: RequestAnimationFrame for smooth 60fps
2. **Algorithm Execution**: Async execution with 50ms delay
3. **ML Training**: Batch processing every 2 executions
4. **Memory Management**: Execution history limited to 100 entries
5. **Code Splitting**: Next.js automatic code splitting

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] Bidirectional search algorithm
- [ ] Jump Point Search (JPS)
- [ ] Theta* algorithm
- [ ] Multi-agent pathfinding
- [ ] 3D visualization
- [ ] Custom heuristics
- [ ] Algorithm benchmarking
- [ ] Export/import grids
- [ ] Collaborative features
- [ ] Advanced ML models (Neural Networks)
