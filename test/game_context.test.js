import { describe, test, expect } from "bun:test";

// Import game context functions
const {
    parseRoomFromGameConfig,
    parseGameModeFromConfig,
    parsePlayerRank,
    getRoomInfo,
    isInRankedRoom,
    getRoomTier,
    determineGameContext,
    parseGameURL,
    getStrategicAdjustments
} = require('../src/game_context.js');

describe("Game Context Parser", () => {
    test("parseRoomFromGameConfig - should extract room ID", () => {
        const gameConfig = {
            meta: { mode_id: 8 }
        };
        
        expect(parseRoomFromGameConfig(gameConfig)).toBe(8);
        expect(parseRoomFromGameConfig(null)).toBe(null);
        expect(parseRoomFromGameConfig({})).toBe(null);
    });

    test("parseGameModeFromConfig - should extract game mode", () => {
        const gameConfig = {
            mode: { mode: 2 }
        };
        
        expect(parseGameModeFromConfig(gameConfig)).toBe(2);
        expect(parseGameModeFromConfig(null)).toBe(null);
        expect(parseGameModeFromConfig({})).toBe(null);
    });

    test("parsePlayerRank - should parse rank format", () => {
        const accountData = { level: 1023 }; // 10x0y format
        const result = parsePlayerRank(accountData);
        
        expect(result.rank).toBe(0);
        expect(result.stars).toBe(3);
        
        expect(parsePlayerRank(null)).toBe(null);
        expect(parsePlayerRank({})).toBe(null);
    });

    test("getRoomInfo - should return room information", () => {
        const expertRoom = getRoomInfo(4);
        expect(expertRoom.name).toBe("Expert");
        expect(expertRoom.isRanked).toBe(true);
        expect(expertRoom.minRank).toBe(3);
        
        const unknownRoom = getRoomInfo(999);
        expect(unknownRoom.name).toBe("Unknown");
        expect(unknownRoom.isRanked).toBe(false);
    });

    test("isInRankedRoom - should identify ranked rooms", () => {
        expect(isInRankedRoom(4)).toBe(true); // Expert
        expect(isInRankedRoom(10)).toBe(false); // Casual
        expect(isInRankedRoom(0)).toBe(false);
        expect(isInRankedRoom(null)).toBe(false);
    });

    test("getRoomTier - should return appropriate tier", () => {
        expect(getRoomTier(1)).toBe(1); // Beginner
        expect(getRoomTier(4)).toBe(4); // Expert
        expect(getRoomTier(7)).toBe(7); // Celestial
        expect(getRoomTier(8)).toBe(4); // Gold East = Expert level
        expect(getRoomTier(999)).toBe(2); // Default
    });

    test("determineGameContext - should extract complete context", () => {
        const mjSoulData = {
            game_config: {
                meta: { mode_id: 4 },
                mode: { mode: 1 },
                players: [1, 2, 3, 4]
            },
            account_data: { level: 1203 }
        };
        
        const context = determineGameContext(mjSoulData);
        
        expect(context.roomId).toBe(4);
        expect(context.roomName).toBe("Expert");
        expect(context.roomTier).toBe(4);
        expect(context.gameMode).toBe(1);
        expect(context.gameModeName).toBe("East Round");
        expect(context.isRanked).toBe(true);
        expect(context.playersCount).toBe(4);
        expect(context.playerRank.rank).toBe(2);
        expect(context.playerRank.stars).toBe(3);
    });

    test("parseGameURL - should parse Mahjong Soul URLs", () => {
        const gameURL = "https://mahjongsoul.game.yo-star.com/game?room=4&mode=1";
        const result = parseGameURL(gameURL);
        
        expect(result.isInGame).toBe(true);
        expect(result.roomParam).toBe(4);
        expect(result.domain).toBe("mahjongsoul.game.yo-star.com");
        
        const lobbyURL = "https://mahjongsoul.game.yo-star.com/lobby";
        const lobbyResult = parseGameURL(lobbyURL);
        expect(lobbyResult.isInLobby).toBe(true);
        expect(lobbyResult.isInGame).toBe(false);
    });

    test("getStrategicAdjustments - should calculate room-based adjustments", () => {
        const beginnerContext = { roomTier: 1 };
        const beginnerAdj = getStrategicAdjustments(beginnerContext);
        
        expect(beginnerAdj.defenseMultiplier).toBeLessThan(1.0);
        expect(beginnerAdj.aggressionMultiplier).toBeGreaterThan(1.0);
        expect(beginnerAdj.riichiThreshold).toBeLessThan(1.0);
        expect(beginnerAdj.isHighLevel).toBe(false);
        
        const masterContext = { roomTier: 6 };
        const masterAdj = getStrategicAdjustments(masterContext);
        
        expect(masterAdj.defenseMultiplier).toBeGreaterThan(1.0);
        expect(masterAdj.aggressionMultiplier).toBeLessThan(1.0);
        expect(masterAdj.riichiThreshold).toBeGreaterThan(1.0);
        expect(masterAdj.isHighLevel).toBe(true);
    });

    test("getStrategicAdjustments - should handle invalid input", () => {
        const result = getStrategicAdjustments(null);
        
        expect(result.defenseMultiplier).toBe(1.0);
        expect(result.aggressionMultiplier).toBe(1.0);
        expect(result.riichiThreshold).toBe(1.0);
    });

    test("parseGameURL - should handle invalid URLs", () => {
        expect(parseGameURL(null)).toBe(null);
        expect(parseGameURL("")).toBe(null);
        expect(parseGameURL("not-a-url")).toBe(null);
    });
});