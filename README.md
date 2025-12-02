# PathAI - Pathfinding Visualization & Optimization

An interactive web-based platform for visualizing and optimizing pathfinding algorithms with ML-driven recommendations.

---

## 📸 Screenshots

![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/1.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/2.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/3.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/4.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/5.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/6.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/7.png)
![](https://github.com/Akash-code-0-1/Shortest-Path-Finding-AI-Visualization/blob/main/public/8.png)

---

## Features

- **6 Pathfinding Algorithms**: A*, Dijkstra, BFS, DFS, Greedy Best-First, D* Lite
- **Real-time Visualization**: Watch algorithms explore the grid in real-time
- **Step-by-Step Simulation**: Control simulation speed from 5ms to 500ms per step
- **Interactive Grid Editor**: Draw walls, set terrain weights, and configure start/end points
- **Ensemble ML System**: Decision Tree + Naive Bayes + KNN for intelligent algorithm recommendations
- **Performance Analytics**: Compare algorithm performance across different grid configurations
- **Dynamic Learning**: ML model learns from each execution and improves recommendations

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/pathai.git
cd pathai

# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Visit `http://localhost:3000` to see the application.

## How to Use

1. **Setup Grid**
   - Use drawing tools to create walls and set terrain weights
   - Click "Random Map" to generate obstacles automatically
   - Set start (green) and end (red) points

2. **Run Algorithm**
   - Select an algorithm from the Algorithm Control panel
   - Choose a heuristic (Manhattan, Euclidean, Diagonal)
   - Click "Run Algorithm" to execute
   - View results instantly on the visualization board

3. **Simulate Execution**
   - Click "Start Simulation" to see step-by-step traversal
   - Adjust speed using preset buttons or slider (5-500ms)
   - Watch frontier (blue) and explored (purple) nodes expand
   - See final path (green) when complete

4. **Compare Algorithms**
   - Click "Compare All Algorithms" to run all 6 algorithms
   - View performance metrics (runtime, nodes expanded, path cost)
   - ML system recommends best algorithm for current grid

5. **ML Training**
   - Switch to "ML Training" tab to see model performance
   - Confidence increases as model learns from executions
   - View algorithm insights and recommendations

## Algorithm Details

### A* (A-Star)
- **Best for**: Weighted grids with long paths
- **Heuristic**: Uses Manhattan, Euclidean, or Diagonal distance
- **Optimality**: Guaranteed optimal path
- **Speed**: Fast with good heuristic

### Dijkstra
- **Best for**: Weighted grids
- **Heuristic**: None (uniform cost search)
- **Optimality**: Guaranteed optimal path
- **Speed**: Slower than A* but explores systematically

### BFS (Breadth-First Search)
- **Best for**: Unweighted grids
- **Heuristic**: None
- **Optimality**: Guaranteed optimal path (unweighted)
- **Speed**: Fast for unweighted grids

### DFS (Depth-First Search)
- **Best for**: Maze-like environments
- **Heuristic**: None
- **Optimality**: Not guaranteed
- **Speed**: Fast but may not find optimal path

### Greedy Best-First
- **Best for**: Fast approximations
- **Heuristic**: Uses Manhattan, Euclidean, or Diagonal
- **Optimality**: Not guaranteed
- **Speed**: Very fast

### D* Lite
- **Best for**: Dynamic obstacles and replanning
- **Heuristic**: Manhattan distance
- **Optimality**: Guaranteed optimal path
- **Speed**: Efficient for incremental updates

## ML System

The ensemble ML model combines three algorithms:

1. **Decision Tree**: Learns decision boundaries based on grid features
2. **Naive Bayes**: Calculates probability distributions for each algorithm
3. **K-Nearest Neighbors**: Finds similar past scenarios

### Grid Features Analyzed
- Grid size (total cells)
- Wall density (percentage of walls)
- Average terrain weight
- Path length (Manhattan distance)
- Start-to-end distance (Euclidean)

### Confidence Score
- Starts at 50% and increases as model learns
- Based on: sample count (35%), success rate (25%), prediction accuracy (25%)
- Reaches up to 99% with sufficient training data

## Visualization Colors

- **Green**: Start point and final path
- **Red**: End point
- **Yellow**: Current node being explored
- **Blue**: Frontier (nodes to explore)
- **Purple**: Explored nodes
- **Dark Red**: Walls
- **Dark Blue**: Free cells

## Performance Metrics

- **Runtime**: Time taken to find path (milliseconds)
- **Nodes Expanded**: Number of nodes evaluated
- **Path Cost**: Total cost of the path (considering terrain weights)
- **Path Length**: Number of cells in the path

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.

---

\`\`\`

```json file="" isHidden
