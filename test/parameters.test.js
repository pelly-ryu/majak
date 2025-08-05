import { describe, test, expect } from "bun:test";

// Mock browser globals
global.window = {
    localStorage: {
        getItem: (key) => null
    }
};

// Define in global scope to avoid const re-declaration issues
global.PERFORMANCE_MODE = 3;
global.EFFICIENCY = 1.0;
global.SAFETY = 1.0;
global.SAKIGIRI = 1.0;
global.CALL_PON_CHI = 1.0;
global.CALL_KAN = 1.0;
global.RIICHI = 1.0;
global.CHIITOITSU = 5;
global.THIRTEEN_ORPHANS = 10;
global.KEEP_SAFETILE = false;
global.MARK_TSUMOGIRI = false;
global.CHANGE_RECOMMEND_TILE_COLOR = true;
global.USE_EMOJI = true;
global.LOG_AMOUNT = 3;
global.DEBUG_BUTTON = false;

// Load the parameters.js file
const fs = require('fs');
const path = require('path');
const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
eval(parametersCode);

describe("Parameters and constants", () => {
    test("Performance mode should be within valid range", () => {
        expect(PERFORMANCE_MODE).toBeGreaterThanOrEqual(0);
        expect(PERFORMANCE_MODE).toBeLessThanOrEqual(4);
    });

    test("Hand evaluation constants should be non-negative", () => {
        expect(EFFICIENCY).toBeGreaterThanOrEqual(0);
        expect(SAFETY).toBeGreaterThanOrEqual(0);
        expect(SAKIGIRI).toBeGreaterThanOrEqual(0);
    });

    test("Call constants should be non-negative", () => {
        expect(CALL_PON_CHI).toBeGreaterThanOrEqual(0);
        expect(CALL_KAN).toBeGreaterThanOrEqual(0);
    });

    test("Strategy constants should have reasonable values", () => {
        expect(RIICHI).toBeGreaterThanOrEqual(0);
        expect(CHIITOITSU).toBeGreaterThanOrEqual(0);
        expect(CHIITOITSU).toBeLessThanOrEqual(7); // Max 7 pairs possible
        expect(THIRTEEN_ORPHANS).toBeGreaterThanOrEqual(0);
        expect(THIRTEEN_ORPHANS).toBeLessThanOrEqual(13); // Max 13 terminals/honors
    });

    test("AIMODE enum should have correct values", () => {
        expect(AIMODE.AUTO).toBe(0);
        expect(AIMODE.HELP).toBe(1);
    });

    test("AIMODE_NAME should match AIMODE enum", () => {
        expect(AIMODE_NAME[AIMODE.AUTO]).toBe("Auto");
        expect(AIMODE_NAME[AIMODE.HELP]).toBe("Help");
        expect(AIMODE_NAME).toHaveLength(2);
    });

    test("STRATEGIES enum should have all required strategies", () => {
        expect(STRATEGIES.GENERAL).toBe('General');
        expect(STRATEGIES.CHIITOITSU).toBe('Chiitoitsu');
        expect(STRATEGIES.FOLD).toBe('Fold');
        expect(STRATEGIES.THIRTEEN_ORPHANS).toBe('Thirteen_Orphans');
    });

    test("Default strategy should be GENERAL", () => {
        expect(strategy).toBe(STRATEGIES.GENERAL);
    });

    test("Boolean flags should have correct types", () => {
        expect(typeof KEEP_SAFETILE).toBe('boolean');
        expect(typeof MARK_TSUMOGIRI).toBe('boolean');
        expect(typeof CHANGE_RECOMMEND_TILE_COLOR).toBe('boolean');
        expect(typeof USE_EMOJI).toBe('boolean');
        expect(typeof DEBUG_BUTTON).toBe('boolean');
        expect(typeof run).toBe('boolean');
        expect(typeof threadIsRunning).toBe('boolean');
        expect(typeof strategyAllowsCalls).toBe('boolean');
        expect(typeof isClosed).toBe('boolean');
        expect(typeof isConsideringCall).toBe('boolean');
        expect(typeof functionsExtended).toBe('boolean');
        expect(typeof showingStrategy).toBe('boolean');
    });

    test("Array globals should be initialized as arrays", () => {
        expect(Array.isArray(dora)).toBe(true);
        expect(Array.isArray(ownHand)).toBe(true);
        expect(Array.isArray(discards)).toBe(true);
        expect(Array.isArray(calls)).toBe(true);
        expect(Array.isArray(availableTiles)).toBe(true);
        expect(Array.isArray(visibleTiles)).toBe(true);
        expect(Array.isArray(riichiTiles)).toBe(true);
        expect(Array.isArray(playerDiscardSafetyList)).toBe(true);
    });

    test("Numeric globals should be initialized as numbers", () => {
        expect(typeof seatWind).toBe('number');
        expect(typeof roundWind).toBe('number');
        expect(typeof tilesLeft).toBe('number');
        expect(typeof errorCounter).toBe('number');
        expect(typeof lastTilesLeft).toBe('number');
        expect(typeof timeSave).toBe('number');
        expect(typeof LOG_AMOUNT).toBe('number');
    });

    test("Wind values should be in valid range", () => {
        expect(seatWind).toBeGreaterThanOrEqual(1);
        expect(seatWind).toBeLessThanOrEqual(4);
        expect(roundWind).toBeGreaterThanOrEqual(1);
        expect(roundWind).toBeLessThanOrEqual(4);
    });

    test("Tile emoji list should have correct structure", () => {
        expect(Array.isArray(tileEmojiList)).toBe(true);
        expect(tileEmojiList).toHaveLength(4); // 4 tile types
        
        // Each type should have correct number of emojis
        expect(tileEmojiList[0]).toHaveLength(10); // Pin (0-9, red 5)
        expect(tileEmojiList[1]).toHaveLength(10); // Man (0-9, red 5)
        expect(tileEmojiList[2]).toHaveLength(10); // Sou (0-9, red 5) 
        expect(tileEmojiList[3]).toHaveLength(8);  // Honor (1-7, no 0)
    });

    test("riichiTiles should be initialized with correct length", () => {
        expect(riichiTiles).toHaveLength(4); // 4 players max
        expect(riichiTiles.every(tile => tile === null)).toBe(true);
    });

    test("playerDiscardSafetyList should be initialized for 4 players", () => {
        expect(playerDiscardSafetyList).toHaveLength(4);
        expect(playerDiscardSafetyList.every(list => Array.isArray(list))).toBe(true);
    });

    test("totalPossibleWaits should be an object", () => {
        expect(typeof totalPossibleWaits).toBe('object');
        expect(totalPossibleWaits).not.toBeNull();
    });
});