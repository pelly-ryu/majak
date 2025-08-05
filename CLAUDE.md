# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlphaJong is a Mahjong AI analysis tool for learning strategy and decision-making. It's a conventional algorithm-based AI (not machine learning) that analyzes hands and provides feedback on optimal moves. The codebase is written in vanilla JavaScript without external libraries.

## Build and Development Commands

### Analysis Functions
- Analysis functions are provided as pure JavaScript modules
- No build process required - functions can be imported directly

### Testing
- **Browser Tests**: Open `test/run_tests.html` in a browser to run the test suite
- Open `test/run_benchmark.html` for performance benchmarking
- Tests use a custom framework with "Nani Kiru?" (what to discard) test cases
- **Unit Tests**: `bun test` - Run unit tests for pure functions (uses Bun test runner)
  - `bun test test/simple.test.js` - Run core utility function tests only
  - Tests cover tile operations, hand analysis, scoring, and yaku detection

### No Linting/Type Checking
This project does not use any linting tools, type checkers, or package managers. All development is done with vanilla JavaScript.

## Architecture

### Core Components

1. **AI Decision Analysis**:
   - `src/ai_offense.js` - Hand evaluation, strategy analysis, and tile priority calculation
   - `src/ai_defense.js` - Safety analysis, danger assessment, and defensive calculations
2. **Game Logic**: 
   - `src/utils.js` - Tile manipulation, hand analysis, and scoring utilities
   - `src/yaku.js` - Yaku (scoring combinations) detection and evaluation
3. **Configuration**: `src/parameters.js` - Tunable constants for AI behavior
4. **Game Review**: `src/review_engine.js` - Game analysis and feedback
5. **Logging**: `src/logging.js` - Debug output and analysis logging

### Key Data Structures

- **Tiles**: Objects with `{index, type, dora, doraValue}` where type is 0-3 (man/pin/sou/honor)
- **Hands**: Arrays of tile objects
- **Game State**: Global variables tracking discards, calls, dora, wind, etc.

### AI Strategy Analysis

The AI analyzes multiple strategies and provides feedback:
- **GENERAL**: Standard 4-groups-1-pair completion analysis
- **CHIITOITSU**: Seven pairs strategy evaluation
- **THIRTEEN_ORPHANS**: 13 terminals and honors assessment
- **FOLD**: Defensive analysis when opponents pose threats

### Features

- **Hand Analysis**: Detailed breakdown of tile efficiency and safety
- **Strategy Recommendations**: Explains optimal play choices with reasoning
- **Danger Assessment**: Teaches defensive play and risk evaluation
- **Yaku Detection**: Identifies scoring opportunities and patterns

## Development Notes

- All tile operations use string notation (e.g., "123m456p789s" for hands)
- Extensive test coverage with specific "what to discard" scenarios
- Pure function architecture for analysis
- Explanations provided for all AI decisions
- Functions designed for learning and teaching Mahjong strategy