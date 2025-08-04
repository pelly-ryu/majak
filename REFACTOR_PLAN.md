# AlphaJong Refactor Plan: Bot → Teaching App

## Overview
Convert AlphaJong from a cheating bot to a legitimate teaching application by removing automated gameplay and keeping educational AI analysis.

## Files to REMOVE (Bot/Cheating Components)

### 🚫 Complete Removal
- `src/main.js` - Bot control loop, auto-start, game searching
- `src/api.js` - Game API hooks, AFK prevention, automated actions
- `src/gui.js` - Bot control interface, start/stop buttons
- `build.py` - Userscript building (for injection into game)
- `build/` directory - Compiled userscripts for cheating

### 🚫 Bot-Specific Functions in Remaining Files
From `src/ai_offense.js` and `src/ai_defense.js`:
- `main()` - Main bot decision loop
- `callTriple()`, `callPon()`, `callChi()` - Automated calling
- `discardTile()` - Automated tile discard
- `declineCall()` - Automated call declining
- Any functions that interact with game DOM/API

## Files to KEEP (Educational Components) ✅

### Core AI Logic (Pure Functions)
- `src/utils.js` - Tile operations, hand analysis, scoring
- `src/yaku.js` - Yaku (scoring pattern) detection
- `src/parameters.js` - AI configuration constants
- `src/logging.js` - Debug output utilities

### Teaching-Focused AI Analysis
- `src/ai_offense.js` - Hand evaluation, tile priorities (analysis only)
- `src/ai_defense.js` - Safety calculations, danger assessment (analysis only)  
- `src/review_engine.js` - Game review and analysis

### Testing & Documentation
- `test/` directory - All test files for educational use
- `README.md`, `CLAUDE.md`, `LICENSE` - Documentation
- `REFACTOR_PLAN.md` - This plan

## Refactored Architecture

### New Entry Points
Instead of bot automation, create:
1. **Web App Interface** - Hand analysis tool
2. **CLI Tool** - Batch hand evaluation
3. **Teaching Modules** - Structured lessons

### Core Functions to Preserve
```javascript
// Hand Analysis (Keep)
getTilePriority(hand) → [{tile, efficiency, safety, score}]
calculateShanten(triples, pairs, doubles) → number
getYaku(hand, calls) → {open, closed}
evaluateWait(tile) → {waits, shape, efficiency}

// Safety Analysis (Keep)  
getTileDanger(tile) → number
shouldFold(tilePrio) → boolean
getFoldThreshold(tilePrio, hand) → number

// Remove Bot Actions
discardTile(tile) → ❌ REMOVE
callTriple(tiles) → ❌ REMOVE
main() → ❌ REMOVE
```

## Implementation Steps

### Phase 1: Remove Bot Infrastructure
1. Delete bot files (`main.js`, `api.js`, `gui.js`, `build.py`)
2. Remove automated functions from AI files
3. Keep only pure analysis functions
4. Update documentation

### Phase 2: Create Teaching Interface
1. HTML interface for hand analysis
2. Educational explanations for AI decisions
3. Practice scenarios and quizzes
4. Hand replay and review tools

### Phase 3: Educational Content
1. Beginner tutorials using AI analysis
2. Strategy guides with examples
3. Interactive learning modules
4. Performance tracking for learning

## Legal & Ethical Considerations

### ✅ Legitimate Educational Use
- Hand analysis for learning
- Strategy explanation tools
- Practice problem generators  
- Game review and post-analysis

### ❌ Prohibited Bot Features
- Real-time automated play
- Game injection/hooking
- AFK prevention
- Automated decision making during live games

## Testing Strategy
- Keep all unit tests for pure functions
- Add tests for teaching interface
- Remove tests for bot automation
- Add educational scenario tests

## Success Criteria
- No automated gameplay capability
- Pure analysis functions preserved  
- Educational value maintained/enhanced
- Clean separation of concerns
- Documented learning resources

This refactor transforms AlphaJong from a cheating tool into a legitimate educational resource for learning Mahjong strategy and AI decision-making.