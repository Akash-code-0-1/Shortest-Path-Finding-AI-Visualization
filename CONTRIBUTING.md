# Contributing to PathAI

Thank you for your interest in contributing to PathAI!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/pathai.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Install dependencies: `npm install`
5. Start development: `npm run dev`

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic

### Testing
- Test your changes locally
- Verify all algorithms work correctly
- Check responsive design on mobile
- Test in multiple browsers

### Commit Messages
- Use clear, descriptive messages
- Start with verb: "Add", "Fix", "Update", "Remove"
- Example: "Add Bidirectional algorithm support"

## Adding New Features

### New Algorithm
1. Add implementation to `lib/pathfinding-algorithms.ts`
2. Add to algorithm list in `components/algorithm-panel.tsx`
3. Update ML model insights in `lib/online-learning.ts`
4. Test with various grid configurations
5. Update README.md with algorithm details

### UI Improvements
1. Modify relevant component
2. Ensure responsive design
3. Test on mobile devices
4. Update documentation if needed

### ML Enhancements
1. Modify `lib/ml-models.ts` or `lib/online-learning.ts`
2. Test with various grid features
3. Verify confidence calculation
4. Document changes

## Pull Request Process

1. Update README.md with any new features
2. Ensure code follows style guidelines
3. Test thoroughly
4. Submit PR with clear description
5. Address review feedback

## Reporting Issues

When reporting bugs, include:
- Browser and version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable

## Questions?

Feel free to open an issue or discussion for questions!

---

Happy contributing!
