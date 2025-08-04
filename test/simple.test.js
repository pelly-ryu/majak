import { describe, test, expect } from "bun:test";

// Mock the global functions that utils.js depends on
global.PERFORMANCE_MODE = 3;
global.timeSave = 0;
global.STRATEGIES = {
    GENERAL: 'General',
    CHIITOITSU: 'Chiitoitsu',
    FOLD: 'Fold',
    THIRTEEN_ORPHANS: 'Thirteen_Orphans'
};
global.strategy = global.STRATEGIES.GENERAL;
global.doesPlayerExist = (player) => true;
global.getSeatWind = (player) => player === 0 ? 1 : 2;
global.getNumberOfPlayers = () => 4;
global.seatWind = 1;
global.roundWind = 1;

// Import working functions
const {
    isSameTile,
    getNumberOfDoras,
    sortTiles,
    getNumberOfTilesInTileArray,
    getTilesInTileArray,
    removeTilesFromTileArray,
    isTerminalOrHonor,
    calculateShanten,
    isWinningHand
} = require('../src/utils.js');

describe("Core utility functions (working tests)", () => {
    test("isSameTile - basic comparison", () => {
        const tile1 = { index: 1, type: 0, dora: false };
        const tile2 = { index: 1, type: 0, dora: false };
        const tile3 = { index: 2, type: 0, dora: false };

        expect(isSameTile(tile1, tile2)).toBe(true);
        expect(isSameTile(tile1, tile3)).toBe(false);
        expect(isSameTile(undefined, tile1)).toBe(false);
    });

    test("getNumberOfDoras - count dora values", () => {
        const tiles = [
            { doraValue: 1 },
            { doraValue: 0 },
            { doraValue: 2 }
        ];
        expect(getNumberOfDoras(tiles)).toBe(3);
        expect(getNumberOfDoras([])).toBe(0);
    });

    test("sortTiles - sort by type, index, dora", () => {
        const tiles = [
            { index: 3, type: 1, doraValue: 0 },
            { index: 1, type: 0, doraValue: 1 },
            { index: 2, type: 0, doraValue: 0 }
        ];
        
        const sorted = sortTiles(tiles);
        expect(sorted[0].type).toBe(0);
        expect(sorted[0].index).toBe(1);
        expect(sorted[1].type).toBe(0);
        expect(sorted[1].index).toBe(2);
        expect(sorted[2].type).toBe(1);
    });

    test("getNumberOfTilesInTileArray - count specific tiles", () => {
        const tiles = [
            { index: 1, type: 0 },
            { index: 1, type: 0 },
            { index: 2, type: 0 }
        ];
        
        expect(getNumberOfTilesInTileArray(tiles, 1, 0)).toBe(2);
        expect(getNumberOfTilesInTileArray(tiles, 2, 0)).toBe(1);
        expect(getNumberOfTilesInTileArray(tiles, 3, 0)).toBe(0);
    });

    test("getTilesInTileArray - get specific tiles", () => {
        const tiles = [
            { index: 1, type: 0, id: 'a' },
            { index: 1, type: 0, id: 'b' },
            { index: 2, type: 0, id: 'c' }
        ];
        
        const result = getTilesInTileArray(tiles, 1, 0);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('a');
        expect(result[1].id).toBe('b');
    });

    test("isTerminalOrHonor - identify terminal and honor tiles", () => {
        expect(isTerminalOrHonor({ index: 1, type: 0 })).toBe(true);
        expect(isTerminalOrHonor({ index: 9, type: 1 })).toBe(true);
        expect(isTerminalOrHonor({ index: 5, type: 0 })).toBe(false);
        expect(isTerminalOrHonor({ index: 1, type: 3 })).toBe(true);
    });

    test("calculateShanten - calculate shanten number", () => {
        expect(calculateShanten(4, 1, 0)).toBe(-1); // Complete hand
        expect(calculateShanten(3, 1, 1)).toBe(0);  // Tenpai
        expect(calculateShanten(2, 1, 2)).toBe(1);  // 1-shanten
        expect(calculateShanten(0, 0, 0)).toBe(8);  // Empty hand
    });

    test("isWinningHand - identify complete hands", () => {
        global.strategy = global.STRATEGIES.GENERAL;
        expect(isWinningHand(4, 1)).toBe(true);
        expect(isWinningHand(3, 1)).toBe(false);
        
        global.strategy = global.STRATEGIES.CHIITOITSU;
        expect(isWinningHand(0, 7)).toBe(true);
        expect(isWinningHand(0, 6)).toBe(false);
    });
});

describe("Basic yaku functions", () => {
    // Mock utility functions for yaku tests
    global.getNumberOfTilesInTileArray = (tiles, index, type) => 
        tiles.filter(t => t.index === index && t.type === type).length;

    const { getYakuhai, getTanyao } = require('../src/yaku.js');

    test("getYakuhai - detect value tiles", () => {
        const triplets = [
            { index: 1, type: 3 }, // East wind triplet
            { index: 1, type: 3 },
            { index: 1, type: 3 },
            { index: 5, type: 3 }, // White dragon triplet  
            { index: 5, type: 3 },
            { index: 5, type: 3 }
        ];
        
        const result = getYakuhai(triplets);
        expect(result.open).toBeGreaterThan(0);
        expect(result.closed).toBeGreaterThan(0);
    });

    test("getTanyao - simple all simples test", () => {
        const hand = new Array(14).fill({ index: 5, type: 0 });
        const triplesAndPairs = {
            triples: new Array(12).fill({ index: 5, type: 0 }),
            pairs: new Array(2).fill({ index: 4, type: 1 })
        };
        
        const result = getTanyao(hand, triplesAndPairs, []);
        expect(result.open).toBe(1);
        expect(result.closed).toBe(1);
    });
});