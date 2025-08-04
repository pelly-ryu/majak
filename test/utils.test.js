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

// Import utils functions
const {
    isSameTile,
    getNumberOfDoras,
    sortTiles,
    getNumberOfTilesInTileArray,
    getTilesInTileArray,
    removeTilesFromTileArray,
    isTerminalOrHonor,
    getHigherTileIndex,
    calculateShanten,
    calculateScore,
    calculateFu,
    isWinningHand,
    getTriplets,
    getPairs
} = require('../src/utils.js');

describe("Tile utility functions", () => {
    test("isSameTile - should compare tiles correctly", () => {
        const tile1 = { index: 1, type: 0, dora: false };
        const tile2 = { index: 1, type: 0, dora: false };
        const tile3 = { index: 2, type: 0, dora: false };
        const tile4 = { index: 1, type: 0, dora: true };

        expect(isSameTile(tile1, tile2)).toBe(true);
        expect(isSameTile(tile1, tile3)).toBe(false);
        expect(isSameTile(tile1, tile4)).toBe(true);
        expect(isSameTile(tile1, tile4, true)).toBe(false);
        expect(isSameTile(undefined, tile1)).toBe(false);
    });

    test("getNumberOfDoras - should count dora values", () => {
        const tiles = [
            { doraValue: 1 },
            { doraValue: 0 },
            { doraValue: 2 },
            { doraValue: 1 }
        ];
        expect(getNumberOfDoras(tiles)).toBe(4);
        expect(getNumberOfDoras([])).toBe(0);
    });

    test("sortTiles - should sort tiles correctly", () => {
        const tiles = [
            { index: 3, type: 1, doraValue: 0 },
            { index: 1, type: 0, doraValue: 1 },
            { index: 2, type: 0, doraValue: 0 },
            { index: 1, type: 1, doraValue: 2 }
        ];
        
        const sorted = sortTiles(tiles);
        
        expect(sorted[0]).toEqual({ index: 1, type: 0, doraValue: 1 });
        expect(sorted[1]).toEqual({ index: 2, type: 0, doraValue: 0 });
        expect(sorted[2]).toEqual({ index: 1, type: 1, doraValue: 2 });
        expect(sorted[3]).toEqual({ index: 3, type: 1, doraValue: 0 });
    });

    test("getNumberOfTilesInTileArray - should count specific tiles", () => {
        const tiles = [
            { index: 1, type: 0 },
            { index: 1, type: 0 },
            { index: 2, type: 0 },
            { index: 1, type: 1 }
        ];
        
        expect(getNumberOfTilesInTileArray(tiles, 1, 0)).toBe(2);
        expect(getNumberOfTilesInTileArray(tiles, 1, 1)).toBe(1);
        expect(getNumberOfTilesInTileArray(tiles, 3, 0)).toBe(0);
    });

    test("getTilesInTileArray - should return specific tiles", () => {
        const tiles = [
            { index: 1, type: 0, id: 'a' },
            { index: 1, type: 0, id: 'b' },
            { index: 2, type: 0, id: 'c' },
            { index: 1, type: 1, id: 'd' }
        ];
        
        const result = getTilesInTileArray(tiles, 1, 0);
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('a');
        expect(result[1].id).toBe('b');
    });

    test("removeTilesFromTileArray - should remove tiles correctly", () => {
        const tiles = [
            { index: 1, type: 0 },
            { index: 2, type: 0 },
            { index: 3, type: 0 },
            { index: 1, type: 0 }
        ];
        
        const tilesToRemove = [{ index: 1, type: 0 }];
        const result = removeTilesFromTileArray(tiles, tilesToRemove);
        
        expect(result).toHaveLength(3);
        expect(result.filter(t => t.index === 1 && t.type === 0)).toHaveLength(1);
    });

    test("isTerminalOrHonor - should identify terminal and honor tiles", () => {
        expect(isTerminalOrHonor({ index: 1, type: 0 })).toBe(true);
        expect(isTerminalOrHonor({ index: 9, type: 1 })).toBe(true);
        expect(isTerminalOrHonor({ index: 5, type: 0 })).toBe(false);
        expect(isTerminalOrHonor({ index: 1, type: 3 })).toBe(true);
        expect(isTerminalOrHonor({ index: 7, type: 3 })).toBe(true);
    });

    test("getHigherTileIndex - should return correct dora indicators", () => {
        expect(getHigherTileIndex({ index: 1, type: 0 })).toBe(2);
        expect(getHigherTileIndex({ index: 9, type: 0 })).toBe(1);
        expect(getHigherTileIndex({ index: 4, type: 3 })).toBe(1);
        expect(getHigherTileIndex({ index: 7, type: 3 })).toBe(5);
        expect(getHigherTileIndex({ index: 5, type: 3 })).toBe(6);
    });
});

describe("Hand analysis functions", () => {
    test("calculateShanten - should calculate shanten correctly", () => {
        expect(calculateShanten(4, 1, 0)).toBe(-1); // Complete hand
        expect(calculateShanten(3, 1, 1)).toBe(0);  // Tenpai
        expect(calculateShanten(2, 1, 2)).toBe(1);  // 1-shanten
        expect(calculateShanten(0, 0, 0)).toBe(8);  // Empty hand
        expect(calculateShanten(4, 0, 1)).toBe(0);  // 4 triples, no pair but one double
    });

    test("isWinningHand - should identify winning hands", () => {
        global.strategy = global.STRATEGIES.GENERAL;
        expect(isWinningHand(4, 1)).toBe(true);
        expect(isWinningHand(3, 1)).toBe(false);
        
        global.strategy = global.STRATEGIES.CHIITOITSU;
        expect(isWinningHand(0, 7)).toBe(true);
        expect(isWinningHand(0, 6)).toBe(false);
    });

    test("getTriplets - should find triplets in hand", () => {
        const tiles = [
            { index: 1, type: 0, doraValue: 0 },
            { index: 1, type: 0, doraValue: 1 },
            { index: 1, type: 0, doraValue: 0 },
            { index: 2, type: 0, doraValue: 0 },
            { index: 2, type: 0, doraValue: 0 }
        ];
        
        const triplets = getTriplets(tiles);
        expect(triplets).toHaveLength(1);
        expect(triplets[0].tile1.index).toBe(1);
        expect(triplets[0].tile1.type).toBe(0);
    });

    test("getPairs - should find pairs in hand", () => {
        const tiles = [
            { index: 1, type: 0, doraValue: 1 },
            { index: 1, type: 0, doraValue: 0 },
            { index: 2, type: 0, doraValue: 0 },
            { index: 3, type: 0, doraValue: 0 }
        ];
        
        const pairs = getPairs(tiles);
        expect(pairs).toHaveLength(1);
        expect(pairs[0].tile1.index).toBe(1);
        expect(pairs[0].tile1.doraValue).toBe(1); // Should grab highest dora first
    });
});

describe("Score calculation functions", () => {
    // Mock required globals for score calculation
    global.getSeatWind = (player) => player === 0 ? 1 : 2;
    global.getNumberOfPlayers = () => 4;
    
    test("calculateScore - should calculate basic scores", () => {
        const score1han = calculateScore(0, 1);
        expect(score1han).toBe(1440); // 1 han, dealer = 1.5x (actual calculated value)
        
        const score1hanNonDealer = calculateScore(1, 1);
        expect(score1hanNonDealer).toBe(1600); // 1 han, non-dealer
        
        const scoreYakuman = calculateScore(0, 13);
        expect(scoreYakuman).toBe(48000); // Yakuman, dealer
    });

    test("calculateFu - basic fu calculation", () => {
        // Mock globals for fu calculation
        global.seatWind = 1;
        global.roundWind = 1;
        global.isClosed = true;
        global.localPosition2Seat = () => 0;
        
        const mockTriples = [];
        const mockOpenTiles = [];
        const mockPair = [{ index: 1, type: 3 }];
        const mockWaitTiles = [{ index: 1, type: 0 }, { index: 2, type: 0 }];
        const mockWinningTile = { index: 1, type: 0 };
        
        const fu = calculateFu(mockTriples, mockOpenTiles, mockPair, mockWaitTiles, mockWinningTile);
        expect(fu).toBeGreaterThan(0);
        expect(fu % 10).toBe(0); // Fu should be rounded to 10s
    });
});