import { describe, test, expect } from "bun:test";

// Mock globals that yaku.js depends on
global.STRATEGIES = {
    GENERAL: 'General',
    CHIITOITSU: 'Chiitoitsu',
    FOLD: 'Fold',
    THIRTEEN_ORPHANS: 'Thirteen_Orphans'
};
global.strategy = global.STRATEGIES.GENERAL;
global.isConsideringCall = false;
global.seatWind = 1;
global.roundWind = 1;

// Mock utility functions that yaku.js uses
global.getTriplesAndPairs = (hand) => ({ triples: [], pairs: [] });
global.getTripletsAsArray = (hand) => [];
global.getBestSequenceCombination = (hand) => [];
global.removeTilesFromTileArray = (tiles, toRemove) => tiles;
global.getNumberOfTilesInTileArray = (tiles, index, type) => tiles.filter(t => t.index === index && t.type === type).length;

// Import yaku functions
const {
    getYakuhai,
    getTanyao,
    getIipeikou,
    getSanankou,
    getToitoi,
    getSanshokuDouko,
    getSanshokuDoujun,
    getShousangen,
    getDaisangen,
    getHonitsu,
    getChinitsu,
    getIttsuu
} = require('../src/yaku.js');

describe("Yaku detection functions", () => {
    test("getYakuhai - should detect wind and dragon triplets", () => {
        const triplets = [
            { index: 1, type: 3 }, // East (seat wind)
            { index: 1, type: 3 },
            { index: 1, type: 3 },
            { index: 5, type: 3 }, // White Dragon
            { index: 5, type: 3 },
            { index: 5, type: 3 }
        ];
        
        const result = getYakuhai(triplets);
        expect(result.open).toBe(3); // 2 for east wind + 1 for dragon 
        expect(result.closed).toBe(3);
    });

    test("getTanyao - should detect all simples", () => {
        const hand = new Array(14).fill({ index: 5, type: 0 }); // 14 tiles, all simples
        
        const triplesAndPairs = {
            triples: new Array(12).fill({ index: 5, type: 0 }), // 12 simple tiles
            pairs: new Array(2).fill({ index: 4, type: 1 }) // 2 simple tiles
        };
        
        const result = getTanyao(hand, triplesAndPairs, []);
        expect(result.open).toBe(1);
        expect(result.closed).toBe(1);
    });

    test("getTanyao - should reject terminals and honors", () => {
        const hand = [
            { index: 1, type: 0 }, // Terminal
            { index: 2, type: 0 },
            { index: 3, type: 0 }
        ];
        
        const triplesAndPairs = {
            triples: [],
            pairs: []
        };
        
        const result = getTanyao(hand, triplesAndPairs, []);
        expect(result.open).toBe(0);
        expect(result.closed).toBe(0);
    });

    test("getIipeikou - should detect identical sequences", () => {
        const sequences = [
            { index: 1, type: 0 },
            { index: 2, type: 0 },
            { index: 3, type: 0 },
            { index: 1, type: 0 },
            { index: 2, type: 0 },
            { index: 3, type: 0 }
        ];
        
        const result = getIipeikou(sequences);
        expect(result.open).toBe(0);
        expect(result.closed).toBe(1);
    });

    test("getSanankou - should detect three concealed triplets", () => {
        global.isConsideringCall = false;
        
        // Mock getTripletsAsArray to return 9 tiles (3 triplets)
        const originalGetTripletsAsArray = global.getTripletsAsArray;
        global.getTripletsAsArray = () => new Array(9).fill({ index: 1, type: 0 });
        
        const result = getSanankou([]);
        expect(result.open).toBe(2);
        expect(result.closed).toBe(2);
        
        // Restore original function
        global.getTripletsAsArray = originalGetTripletsAsArray;
    });

    test("getToitoi - should detect all triplets hand", () => {
        const triplets = new Array(12).fill({ index: 1, type: 0 }); // 4 triplets
        
        const result = getToitoi(triplets);
        expect(result.open).toBe(2);
        expect(result.closed).toBe(2);
    });

    test("getSanshokuDouko - should detect three color triplets", () => {
        const triplets = [
            // Three triplets of 5s in different suits
            { index: 5, type: 0 }, { index: 5, type: 0 }, { index: 5, type: 0 },
            { index: 5, type: 1 }, { index: 5, type: 1 }, { index: 5, type: 1 },
            { index: 5, type: 2 }, { index: 5, type: 2 }, { index: 5, type: 2 }
        ];
        
        const result = getSanshokuDouko(triplets);
        expect(result.open).toBe(2);
        expect(result.closed).toBe(2);
    });

    test("getSanshokuDoujun - should detect three color sequences", () => {
        const sequences = [
            // 123 sequence in all three suits
            { index: 1, type: 0 }, { index: 2, type: 0 }, { index: 3, type: 0 },
            { index: 1, type: 1 }, { index: 2, type: 1 }, { index: 3, type: 1 },
            { index: 1, type: 2 }, { index: 2, type: 2 }, { index: 3, type: 2 }
        ];
        
        const result = getSanshokuDoujun(sequences);
        expect(result.open).toBe(1);
        expect(result.closed).toBe(2);
    });

    test("getShousangen - should detect small three dragons", () => {
        const hand = [
            // Two triplets and one pair of dragons
            { index: 5, type: 3 }, { index: 5, type: 3 }, // White pair
            { index: 6, type: 3 }, { index: 6, type: 3 }, { index: 6, type: 3 }, // Green triplet
            { index: 7, type: 3 }, { index: 7, type: 3 }, { index: 7, type: 3 }  // Red triplet
        ];
        
        const result = getShousangen(hand);
        expect(result.open).toBe(2);
        expect(result.closed).toBe(2);
    });

    test("getDaisangen - should detect big three dragons", () => {
        const hand = [
            // Three triplets of dragons
            { index: 5, type: 3 }, { index: 5, type: 3 }, { index: 5, type: 3 }, // White
            { index: 6, type: 3 }, { index: 6, type: 3 }, { index: 6, type: 3 }, // Green
            { index: 7, type: 3 }, { index: 7, type: 3 }, { index: 7, type: 3 }  // Red
        ];
        
        const result = getDaisangen(hand);
        expect(result.open).toBe(10); // Yakuman
        expect(result.closed).toBe(10);
    });

    test("getHonitsu - should detect half flush", () => {
        const hand = [
            // Only pinzu and honors
            { index: 1, type: 0 }, { index: 2, type: 0 }, { index: 3, type: 0 },
            { index: 4, type: 0 }, { index: 5, type: 0 }, { index: 6, type: 0 },
            { index: 7, type: 0 }, { index: 8, type: 0 }, { index: 9, type: 0 },
            { index: 1, type: 3 }, { index: 1, type: 3 }, { index: 1, type: 3 },
            { index: 5, type: 3 }, { index: 5, type: 3 }
        ];
        
        const result = getHonitsu(hand);
        expect(result.open).toBe(2);
        expect(result.closed).toBe(3);
    });

    test("getChinitsu - should detect full flush", () => {
        const hand = [
            // Only pinzu
            { index: 1, type: 0 }, { index: 1, type: 0 }, { index: 1, type: 0 },
            { index: 2, type: 0 }, { index: 2, type: 0 }, { index: 2, type: 0 },
            { index: 3, type: 0 }, { index: 3, type: 0 }, { index: 3, type: 0 },
            { index: 4, type: 0 }, { index: 4, type: 0 }, { index: 4, type: 0 },
            { index: 5, type: 0 }, { index: 5, type: 0 }
        ];
        
        const result = getChinitsu(hand);
        expect(result.open).toBe(3);
        expect(result.closed).toBe(3);
    });

    test("getIttsuu - should detect pure straight", () => {
        const sequences = [
            // 123, 456, 789 in same suit
            { index: 1, type: 0 }, { index: 2, type: 0 }, { index: 3, type: 0 },
            { index: 4, type: 0 }, { index: 5, type: 0 }, { index: 6, type: 0 },
            { index: 7, type: 0 }, { index: 8, type: 0 }, { index: 9, type: 0 }
        ];
        
        const result = getIttsuu(sequences);
        expect(result.open).toBe(1);
        expect(result.closed).toBe(2);
    });
});