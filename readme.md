# AlphaJong - Educational Mahjong AI

An educational Mahjong AI analysis tool for learning strategy and decision-making. This project provides sophisticated hand analysis, strategic recommendations, and educational explanations to help players improve their Mahjong skills.

## 🎓 Educational Purpose

This is a **learning tool only** - all bot/automation functionality has been removed to ensure it cannot be used for cheating. The focus is on understanding AI decision-making and improving Mahjong strategy through analysis.

## ✨ Features

### Hand Analysis
- **Tile Efficiency**: Calculates how each tile affects hand development
- **Shanten Calculation**: Determines how close a hand is to completion
- **Wait Analysis**: Identifies winning tiles and their quality
- **Yaku Detection**: Recognizes scoring patterns and opportunities

### Strategic Analysis
- **Multiple Strategies**: Analyzes general, chiitoitsu, and thirteen orphans approaches
- **Safety Assessment**: Evaluates tile danger and defensive options  
- **Call Evaluation**: Determines when to make melds (chi/pon/kan)
- **Educational Explanations**: Provides reasoning for all recommendations

### Learning Tools
- **Interactive Analysis**: Step-through hand evaluation process
- **Teaching Scenarios**: 8 pre-built educational positions covering key concepts
- **Performance Comparison**: See how decisions affect outcomes
- **Strategy Guides**: Learn optimal play patterns

## 🚀 Getting Started

### Prerequisites
- Node.js or Bun runtime for testing
- Web browser for interactive examples

### Installation
```bash
git clone https://github.com/user/AlphaJong
cd AlphaJong
```

### Running Tests
```bash
# Run all unit tests
bun test

# Run specific test categories
bun test test/simple.test.js
bun test test/utils.test.js
bun test test/yaku.test.js
```

### Example Usage
```javascript
// Import analysis functions
const { analyzeDiscardRecommendation, getTilePriorities } = require('./src/ai_offense.js');
const { getTileDanger } = require('./src/ai_defense.js');

// Analyze a hand
const hand = [
    {index: 1, type: 0, dora: false, doraValue: 0}, // 1 pin
    {index: 2, type: 0, dora: false, doraValue: 0}, // 2 pin
    // ... more tiles
];

const analysis = await analyzeDiscardRecommendation(hand);
console.log(analysis.recommendation); // Best tile to discard
console.log(analysis.analysis);       // Educational explanation
```

## Debug String Format

`dora|hand|calls0|calls1|calls2|calls3|discards0|discards1|discards2|discards3|riichi|seatWind|roundWind|tilesLeft`

Tiles use format: `123m456p789s1z` (m=man, p=pin, s=sou, z=honors)

## 📁 Project Structure

```
src/
├── ai_offense.js     # Hand evaluation and strategy analysis
├── ai_defense.js     # Safety analysis and danger assessment  
├── utils.js          # Core tile manipulation and scoring
├── yaku.js           # Scoring pattern detection
├── parameters.js     # AI configuration constants
├── review_engine.js  # Game analysis and review
└── logging.js        # Debug and analysis output

test/
├── simple.test.js    # Core functionality tests
├── utils.test.js     # Utility function tests
├── yaku.test.js      # Yaku detection tests
└── parameters.test.js # Configuration tests
```

## 🎯 Key Functions

### Hand Analysis
- `getTilePriorities(hand)` - Analyze all tiles in hand with explanations
- `getHandValues(hand)` - Calculate shanten, waits, and scoring potential
- `determineStrategy(hand)` - Recommend optimal strategy approach

### Safety & Defense  
- `getTileDanger(tile)` - Assess danger level of discarding a tile
- `shouldFold(tilePrio)` - Determine if defensive play is recommended
- `getSafetyAnalysis(tiles)` - Overall safety assessment

### Educational Tools
- `generateTileExplanation()` - Explain why a tile has certain priority
- `analyzeDiscardRecommendation()` - Complete discard analysis with reasoning
- `evaluateCall()` - Assess meld opportunities with explanations

## 🧪 Testing

The project includes comprehensive unit tests covering:
- Pure function logic (tile operations, scoring)
- Hand analysis algorithms 
- Yaku detection accuracy
- Strategy evaluation
- Safety calculations

Run tests to verify functionality:
```bash
bun test                    # All tests
bun test test/simple.test.js # Core functions only
```

## 📚 Learning Resources

### Strategy Concepts
- **Efficiency**: How much a tile improves your hand
- **Shanten**: Number of tile exchanges needed to win
- **Yaku**: Scoring patterns required for legal wins
- **Defense**: Avoiding dealing into opponents' hands

### AI Decision Making
- **Tile Priority**: Balancing efficiency vs safety
- **Strategy Selection**: When to pursue different approaches
- **Risk Assessment**: Evaluating opponent threats
- **Optimal Play**: Mathematical approach to decision making

## 🤝 Contributing

Educational improvements welcome! Focus areas:
- Enhanced explanations and teaching content
- Additional practice scenarios
- Improved analysis algorithms
- Better educational interface

## 📄 License

GPL v3 - See LICENSE file for details

## ⚠️ Disclaimer

This is an educational tool for learning Mahjong strategy. It cannot and should not be used for automated play or cheating. The project has been specifically designed to prevent misuse while maximizing educational value.

---

*Learn Mahjong strategy through AI analysis* 🀄