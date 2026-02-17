# Reaction Speed Test

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)

Test your reflexes with 3 different game modes! Track your performance over time with detailed statistics and benchmarks.

**[Play Now](https://saharhalili95.github.io/reaction-speed-test/)**

## Game Modes

### Reaction Time
Classic reaction test - wait for the screen to turn green, then click as fast as you can. Measures your average over 5 rounds with millisecond precision.

### Target Click
An aim and speed test - click 15 targets that appear at random positions as quickly as possible. Your score is the average time per target.

### Number Sequence
Find and click numbers 1-25 in order on a shuffled 5x5 grid. Tests visual search speed and pattern recognition.

## Features

- **Performance Benchmarks** - Get rated from "Incredible" to "Sleepy" with color-coded results
- **Persistent Statistics** - Best time, average, last 10 average, and total games tracked per mode
- **Visual History** - Bar chart of your last 20 results, color-coded by performance tier
- **Local Storage** - All stats persist across browser sessions
- **Dark Theme** - Sleek dark UI designed for focus
- **Responsive Design** - Works on desktop and mobile

## Benchmarks

| Rating | Reaction Time | Target Click | Number Sequence |
|--------|:---:|:---:|:---:|
| Incredible | < 150ms | < 350ms | < 8s |
| Fast | < 220ms | < 500ms | < 12s |
| Average | < 300ms | < 650ms | < 18s |
| Slow | < 400ms | < 800ms | < 25s |

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Build Tool:** Vite 7
- **Deployment:** GitHub Pages

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ReactionTest.tsx    # Reaction time game mode
│   ├── TargetTest.tsx      # Target click game mode
│   ├── SequenceTest.tsx    # Number sequence game mode
│   └── StatsPanel.tsx      # Statistics and history chart
├── hooks/
│   └── useHistory.ts       # localStorage persistence hook
├── types/
│   └── game.ts             # Type definitions and benchmarks
├── App.tsx                 # Main app with mode selection
└── index.css               # Tailwind styles
```

## License

MIT
