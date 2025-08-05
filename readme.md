# AlphaJong - Mahjong AI

A Mahjong AI analysis tool for learning strategy and decision-making. This project provides sophisticated hand analysis, strategic recommendations, and explanations to help players improve their Mahjong skills.

## ✨ Features


### Strategic Analysis
- **Multiple Strategies**: Analyzes general, chiitoitsu, and thirteen orphans approaches
- **Safety Assessment**: Evaluates tile danger and defensive options  
- **Call Evaluation**: Determines when to make melds (chi/pon/kan)
- **Explanations**: Provides reasoning for all recommendations

### Analysis Tools
- **Interactive Analysis**: Step-through hand evaluation process
- **Scenarios**: 8 pre-built positions covering key concepts
- **Performance Comparison**: See how decisions affect outcomes
- **Strategy Guides**: Learn optimal play patterns

## 🚀 Getting Started

### Prerequisites
- Node.js or Bun runtime for testing
- Web browser for interactive examples


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
console.log(analysis.analysis);       // Explanation
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

### Analysis Tools
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

Improvements welcome! Focus areas:
- Enhanced explanations and content
- Additional practice scenarios
- Improved analysis algorithms
- Better interface

## 📄 License

GPL v3 - See LICENSE file for details

## ⚠️ Disclaimer

This is a tool for learning Mahjong strategy. It cannot be used for automated play or cheating.

---

*Learn Mahjong strategy through AI analysis* 🀄