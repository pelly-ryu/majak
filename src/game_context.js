//################################
// GAME CONTEXT PARSER
// Pure functions for extracting game information from URLs and game state
// Recovered from original bot functionality for educational analysis
//################################

/**
 * Parse room ID from Mahjong Soul game configuration
 * @param {Object} gameConfig - Game configuration object from view.DesktopMgr.Inst.game_config
 * @returns {number|null} Room ID or null if not found
 */
function parseRoomFromGameConfig(gameConfig) {
    if (!gameConfig || !gameConfig.meta) return null;
    return gameConfig.meta.mode_id || null;
}

/**
 * Parse game mode from Mahjong Soul game configuration
 * @param {Object} gameConfig - Game configuration object
 * @returns {number|null} Game mode (1 = East Round, 2 = South Round) or null
 */
function parseGameModeFromConfig(gameConfig) {
    if (!gameConfig || !gameConfig.mode) return null;
    return gameConfig.mode.mode || null;
}

/**
 * Parse player rank from account data
 * @param {Object} accountData - Account data from GameMgr.Inst.account_data
 * @returns {Object|null} {rank: number, stars: number} or null
 */
function parsePlayerRank(accountData) {
    if (!accountData || !accountData.level) return null;
    
    const level = accountData.level;
    // Format is 10x0y or 20x0y where x is rank, y is stars
    const rank = Math.floor(level / 100) % 10;
    const stars = level % 10;
    
    return { rank, stars };
}

/**
 * Get room information by room ID
 * @param {number} roomId - Room ID
 * @returns {Object} Room information including level limits and type
 */
function getRoomInfo(roomId) {
    const roomData = {
        1: { name: "Beginner", levelLimit: 0, isRanked: true, minRank: 1 },
        2: { name: "Novice", levelLimit: 0, isRanked: true, minRank: 1 },
        3: { name: "Adept", levelLimit: 200, isRanked: true, minRank: 2 },
        4: { name: "Expert", levelLimit: 400, isRanked: true, minRank: 3 },
        5: { name: "Master", levelLimit: 600, isRanked: true, minRank: 4 },
        6: { name: "Saint", levelLimit: 800, isRanked: true, minRank: 5 },
        7: { name: "Celestial", levelLimit: 1000, isRanked: true, minRank: 6 },
        8: { name: "Gold East 4P", levelLimit: 400, isRanked: true, minRank: 3 },
        9: { name: "Gold South 4P", levelLimit: 400, isRanked: true, minRank: 3 },
        10: { name: "Casual", levelLimit: 0, isRanked: false, minRank: 1 }
    };
    
    return roomData[roomId] || { name: "Unknown", levelLimit: 0, isRanked: false, minRank: 1 };
}

/**
 * Determine if room is ranked based on room ID
 * @param {number} roomId - Room ID
 * @returns {boolean} True if ranked room
 */
function isInRankedRoom(roomId) {
    if (!roomId || roomId < 1) return false;
    const roomInfo = getRoomInfo(roomId);
    return roomInfo.isRanked;
}

/**
 * Get room tier for strategic adjustments
 * @param {number} roomId - Room ID  
 * @returns {number} Room tier (1-7, higher = more skilled players)
 */
function getRoomTier(roomId) {
    const tierMap = {
        1: 1, // Beginner
        2: 2, // Novice  
        3: 3, // Adept
        4: 4, // Expert
        5: 5, // Master
        6: 6, // Saint
        7: 7, // Celestial
        8: 4, // Gold East (Expert level)
        9: 4, // Gold South (Expert level)
        10: 2 // Casual (Novice level)
    };
    
    return tierMap[roomId] || 2;
}

/**
 * Extract complete game context from Mahjong Soul data
 * @param {Object} mjSoulData - Mahjong Soul game data
 * @returns {Object} Complete game context
 */
function determineGameContext(mjSoulData) {
    const gameConfig = mjSoulData?.desktopMgr?.game_config || mjSoulData?.game_config;
    const accountData = mjSoulData?.gameMgr?.account_data || mjSoulData?.account_data;
    
    const roomId = parseRoomFromGameConfig(gameConfig);
    const gameMode = parseGameModeFromConfig(gameConfig);
    const playerRank = parsePlayerRank(accountData);
    const roomInfo = getRoomInfo(roomId);
    
    return {
        roomId: roomId,
        roomName: roomInfo.name,
        roomTier: getRoomTier(roomId),
        gameMode: gameMode,
        gameModeName: gameMode === 1 ? "East Round" : gameMode === 2 ? "South Round" : "Unknown",
        isRanked: isInRankedRoom(roomId),
        playerRank: playerRank,
        playersCount: gameConfig?.players?.length || 4,
        minRequiredRank: roomInfo.minRank,
        levelLimit: roomInfo.levelLimit
    };
}

/**
 * Parse Mahjong Soul URL for game information
 * @param {string} url - Current page URL
 * @returns {Object} URL-based game context
 */
function parseGameURL(url) {
    if (!url || typeof url !== 'string') return null;
    
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch (error) {
        return null;
    }
    
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;
    
    // Check if in game
    const isInGame = pathname.includes('/game') || pathname.includes('/play');
    const isInLobby = pathname.includes('/lobby') || pathname.includes('/main');
    
    // Extract room from URL parameters if available
    const roomParam = searchParams.get('room') || searchParams.get('mode');
    const gameId = searchParams.get('game') || searchParams.get('id');
    
    return {
        isInGame: isInGame,
        isInLobby: isInLobby,
        roomParam: roomParam ? parseInt(roomParam) : null,
        gameId: gameId,
        fullURL: url,
        domain: urlObj.hostname
    };
}

/**
 * Get current browser game context (for browser environment)
 * @returns {Object} Current game context or null
 */
function getCurrentGameContext() {
    // Only works in browser environment
    if (typeof window === 'undefined') return null;
    
    try {
        // Try to access Mahjong Soul game data
        const mjSoulData = {
            desktopMgr: window.view?.DesktopMgr?.Inst,
            gameMgr: window.GameMgr?.Inst
        };
        
        const urlContext = parseGameURL(window.location.href);
        const gameContext = determineGameContext(mjSoulData);
        
        return {
            ...gameContext,
            url: urlContext,
            timestamp: Date.now()
        };
    } catch (error) {
        console.warn('Could not extract game context:', error);
        return null;
    }
}

/**
 * Calculate strategic adjustments based on room context
 * @param {Object} gameContext - Game context from determineGameContext
 * @returns {Object} Strategic adjustment factors
 */
function getStrategicAdjustments(gameContext) {
    if (!gameContext || !gameContext.roomTier) {
        return { defenseMultiplier: 1.0, aggressionMultiplier: 1.0, riichiThreshold: 1.0 };
    }
    
    const tier = gameContext.roomTier;
    
    // Higher tier rooms = more defensive play, opponents more likely to be tenpai
    const defenseMultiplier = Math.min(1.0 + (tier - 3) * 0.1, 1.5);
    
    // Lower tier rooms = can be more aggressive  
    const aggressionMultiplier = Math.max(1.0 - (tier - 3) * 0.1, 0.7);
    
    // Adjust riichi threshold based on room level
    const riichiThreshold = tier > 4 ? 1.2 : tier < 3 ? 0.8 : 1.0;
    
    return {
        defenseMultiplier: defenseMultiplier,
        aggressionMultiplier: aggressionMultiplier, 
        riichiThreshold: riichiThreshold,
        roomTier: tier,
        isHighLevel: tier >= 5
    };
}

// Export functions for testing and modular use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseRoomFromGameConfig,
        parseGameModeFromConfig, 
        parsePlayerRank,
        getRoomInfo,
        isInRankedRoom,
        getRoomTier,
        determineGameContext,
        parseGameURL,
        getCurrentGameContext,
        getStrategicAdjustments
    };
}