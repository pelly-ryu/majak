# Majak - Mahjong Review System

A web-based mahjong review system for learning and analysis, built on top of the AlphaJong AI engine.

## Features

- **Position Analysis** - Load game positions and get AI recommendations
- **Teaching Scenarios** - 8 pre-built educational positions covering key mahjong concepts
- **Move Comparison** - Compare your moves with AI suggestions and get detailed feedback
- **Interactive Hand Builder** - Create custom positions visually
- **Mobile Responsive** - Works on both desktop and mobile devices

## Quick Start

1. Visit the [GitHub Pages site](https://pelly-ryu.github.io/majak/analyze.html)
2. Load a position using the example or teaching scenarios
3. Get AI recommendations and compare with your own moves
4. Learn from detailed explanations

## Usage

- **Load Position**: Enter a debug string or use provided examples
- **Teaching Scenarios**: Select from 8 educational positions covering efficiency, safety, riichi timing, defense, and special hands
- **Hand Builder**: Create custom positions by clicking tiles
- **Analysis**: Get AI recommendations and detailed move comparisons

## Debug String Format

`dora|hand|calls0|calls1|calls2|calls3|discards0|discards1|discards2|discards3|riichi|seatWind|roundWind|tilesLeft`

Tiles use format: `123m456p789s1z` (m=man, p=pin, s=sou, z=honors)

## Development

Built with vanilla JavaScript, no external dependencies required.

- **Build**: `python3 build.py` (for userscript generation)  
- **Tests**: Open `test/run_tests.html` in browser
- **Review System**: Open `analyze.html` directly

## License

GNU General Public License v3 - Modified work based on AlphaJong by Jimboom7

## Original AlphaJong

This project builds upon [AlphaJong](https://github.com/Jimboom7/AlphaJong), a sophisticated mahjong AI for Mahjong Soul. The original bot features:

- Conventional algorithm-based AI (not machine learning)
- Compatible with 3 and 4 player modes
- Multiple performance modes and strategies
- Extensive test coverage

For the original userscript bot functionality, refer to the AlphaJong repository.