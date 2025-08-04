# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AlphaJong is a Mahjong AI for Mahjong Soul that runs as a userscript in web browsers. It's a conventional algorithm-based AI (not machine learning) that simulates turns to find optimal moves. The codebase is written in vanilla JavaScript without external libraries.

## Build and Development Commands

### Build
- `python3 build.py` - Concatenates all source files into a single userscript for distribution
- Output: `build/AlphaJong_<VERSION>.user.js`

### Testing
- Open `test/run_tests.html` in a browser to run the test suite
- Open `test/run_benchmark.html` for performance benchmarking
- Tests use a custom framework with "Nani Kiru?" (what to discard) test cases

### No Linting/Type Checking
This project does not use any linting tools, type checkers, or package managers. All development is done with vanilla JavaScript.

## Architecture

### Core Components

1. **Entry Point**: `src/main.js` - Initializes the bot, handles GUI interactions, and manages the main game loop
2. **Game API Interface**: `src/api.js` - Interfaces with Mahjong Soul's game engine and DOM
3. **AI Decision Making**:
   - `src/ai_offense.js` - Offensive strategy logic, hand evaluation, and tile selection
   - `src/ai_defense.js` - Defensive play, danger assessment, and safety calculations
4. **Game Logic**: 
   - `src/utils.js` - Tile manipulation, hand analysis, and game state utilities
   - `src/yaku.js` - Yaku (scoring combinations) detection and evaluation
5. **Configuration**: `src/parameters.js` - Tunable constants for AI behavior
6. **UI**: `src/gui.js` - Simple control interface for the bot
7. **Logging**: `src/logging.js` - Debug output and game state logging

### Key Data Structures

- **Tiles**: Objects with `{index, type, dora, doraValue}` where type is 0-3 (man/pin/sou/honor)
- **Hands**: Arrays of tile objects
- **Game State**: Global variables tracking discards, calls, dora, wind, etc.

### AI Strategy System

The AI uses multiple strategies that can be switched dynamically:
- **GENERAL**: Standard 4-groups-1-pair completion
- **CHIITOITSU**: Seven pairs strategy
- **THIRTEEN_ORPHANS**: 13 terminals and honors
- **FOLD**: Defensive play when threatened

### Performance Modes

The AI has configurable performance levels (0-4) that trade calculation depth for speed, with automatic downgrading when approaching time limits.

## Development Notes

- All tile operations use string notation (e.g., "123m456p789s" for hands)
- Extensive test coverage with specific "what to discard" scenarios
- Heavy use of global variables for game state management
- Performance-critical sections with time management for real-time play
- Browser-specific optimizations (Firefox tends to run faster than Chrome)