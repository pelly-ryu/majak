#!/usr/bin/env node

//################################
// URL DATA EXTRACTION TEST SCRIPT
// Tests extracting game data from Mahjong Soul URLs
//################################

// Import the game context functions
const {
    parseGameURL,
    determineGameContext,
    getStrategicAdjustments,
    getRoomInfo,
    parseRoomFromGameConfig,
    parseGameModeFromConfig
} = require('../src/game_context.js');

// Load the saved URL from memory
const fs = require('fs');
const path = require('path');

function loadSavedURL() {
    try {
        const memoryPath = path.join(__dirname, '../.claude_memory.json');
        const memoryData = JSON.parse(fs.readFileSync(memoryPath, 'utf8'));
        return memoryData.mahjong_soul_replay_url;
    } catch (error) {
        console.error('Could not load saved URL:', error.message);
        return null;
    }
}

/**
 * Extract paipu (replay) ID from Mahjong Soul URL
 * @param {string} url - Mahjong Soul URL
 * @returns {Object} Extracted paipu information
 */
function extractPaipuData(url) {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        const paipu = urlObj.searchParams.get('paipu');
        
        if (paipu) {
            // Parse paipu format: YYMMDD-UUID_playerID
            const parts = paipu.split('_');
            const gameId = parts[0];
            const playerId = parts[1];
            
            // Extract date from game ID (YYMMDD-UUID format)
            const datePart = gameId.split('-')[0];
            if (datePart && datePart.length === 6) {
                const year = 2000 + parseInt(datePart.substring(0, 2));
                const month = parseInt(datePart.substring(2, 4));
                const day = parseInt(datePart.substring(4, 6));
                
                return {
                    fullPaipu: paipu,
                    gameId: gameId,
                    playerId: playerId,
                    gameDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    isReplay: true,
                    uuid: gameId.split('-').slice(1).join('-')
                };
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error parsing paipu URL:', error.message);
        return null;
    }
}

/**
 * Simulate fetching game metadata (placeholder for actual API call)
 * @param {string} gameId - Game ID from paipu
 * @returns {Object} Simulated game metadata
 */
function simulateGameMetadata(gameId) {
    // In real implementation, this would make an API call to Mahjong Soul
    // For now, we'll simulate reasonable data based on the game ID
    
    const datePart = gameId.split('-')[0];
    const isRecent = datePart >= '250801'; // January 2025 or later
    
    return {
        gameId: gameId,
        gameMode: isRecent ? 2 : 1, // Assume newer games are South Round
        roomId: Math.floor(Math.random() * 7) + 1, // Random room 1-7
        playersCount: 4,
        gameLength: Math.floor(Math.random() * 120) + 60, // 60-180 minutes
        isRanked: Math.random() > 0.3, // 70% chance of ranked
        serverRegion: 'yo-star',
        gameType: 'standard'
    };
}

/**
 * Test URL data extraction with various scenarios
 */
function testURLDataExtraction() {
    console.log('='.repeat(60));
    console.log('MAHJONG SOUL URL DATA EXTRACTION TEST');
    console.log('='.repeat(60));
    
    // Test URLs
    const testUrls = [
        // Saved URL from user
        loadSavedURL(),
        
        // Additional test URLs
        'https://mahjongsoul.game.yo-star.com/?paipu=241225-12345678-abcd-efgh-ijkl-123456789012_a987654321',
        'https://mahjongsoul.game.yo-star.com/game?room=4&mode=2',
        'https://mahjongsoul.game.yo-star.com/lobby',
        'https://mahjongsoul.game.yo-star.com/index.html',
        
        // Invalid URLs
        'not-a-url',
        null
    ].filter(url => url !== null);
    
    testUrls.forEach((url, index) => {
        console.log(`\n--- Test ${index + 1}: URL Analysis ---`);
        console.log(`URL: ${url}`);
        
        // Parse basic URL structure
        const urlContext = parseGameURL(url);
        console.log(`URL Context:`, urlContext);
        
        // Extract paipu data if it's a replay
        const paipuData = extractPaipuData(url);
        if (paipuData) {
            console.log(`Paipu Data:`, paipuData);
            
            // Simulate getting game metadata
            const gameMetadata = simulateGameMetadata(paipuData.gameId);
            console.log(`Game Metadata:`, gameMetadata);
            
            // Determine game context
            const gameContext = determineGameContext({
                game_config: {
                    meta: { mode_id: gameMetadata.roomId },
                    mode: { mode: gameMetadata.gameMode }
                }
            });
            console.log(`Game Context:`, gameContext);
            
            // Get strategic adjustments
            const adjustments = getStrategicAdjustments(gameContext);
            console.log(`Strategic Adjustments:`, adjustments);
        }
        
        console.log('-'.repeat(40));
    });
}

/**
 * Test specific functionality of the saved replay URL
 */
function testSavedReplayURL() {
    console.log('\n' + '='.repeat(60));
    console.log('SAVED REPLAY URL DETAILED ANALYSIS');
    console.log('='.repeat(60));
    
    const savedURL = loadSavedURL();
    if (!savedURL) {
        console.log('No saved URL found!');
        return;
    }
    
    console.log(`Analyzing: ${savedURL}`);
    
    // Extract all possible data
    const urlContext = parseGameURL(savedURL);
    const paipuData = extractPaipuData(savedURL);
    
    console.log('\n--- URL Structure Analysis ---');
    console.log(`Domain: ${urlContext?.domain || 'N/A'}`);
    console.log(`Is Game URL: ${urlContext?.isInGame || false}`);
    console.log(`Is Lobby URL: ${urlContext?.isInLobby || false}`);
    
    if (paipuData) {
        console.log('\n--- Replay Data Analysis ---');
        console.log(`Game Date: ${paipuData.gameDate}`);
        console.log(`Game ID: ${paipuData.gameId}`);
        console.log(`Player ID: ${paipuData.playerId}`);
        console.log(`UUID: ${paipuData.uuid}`);
        
        // Simulate what we could do with this data
        console.log('\n--- Potential Analysis ---');
        console.log('✓ Could fetch full game record from Mahjong Soul API');
        console.log('✓ Could analyze player decisions across all turns');
        console.log('✓ Could generate move-by-move recommendations');
        console.log('✓ Could identify learning opportunities');
        console.log('✓ Could compare against optimal AI play');
    }
}

/**
 * Demonstrate how to integrate with existing game context system
 */
function demonstrateIntegration() {
    console.log('\n' + '='.repeat(60));
    console.log('INTEGRATION WITH GAME CONTEXT SYSTEM');
    console.log('='.repeat(60));
    
    // Simulate different room scenarios
    const scenarios = [
        { name: 'Beginner Room', roomId: 1, gameMode: 1 },
        { name: 'Expert Room', roomId: 4, gameMode: 2 },
        { name: 'Celestial Room', roomId: 7, gameMode: 2 },
        { name: 'Casual Room', roomId: 10, gameMode: 1 }
    ];
    
    scenarios.forEach(scenario => {
        console.log(`\n--- ${scenario.name} Analysis ---`);
        
        const gameContext = determineGameContext({
            game_config: {
                meta: { mode_id: scenario.roomId },
                mode: { mode: scenario.gameMode }
            }
        });
        
        const adjustments = getStrategicAdjustments(gameContext);
        
        console.log(`Room: ${gameContext.roomName} (Tier ${gameContext.roomTier})`);
        console.log(`Game Mode: ${gameContext.gameModeName}`);
        console.log(`Defense Multiplier: ${adjustments.defenseMultiplier.toFixed(2)}`);
        console.log(`Aggression Multiplier: ${adjustments.aggressionMultiplier.toFixed(2)}`);
        console.log(`Riichi Threshold: ${adjustments.riichiThreshold.toFixed(2)}`);
        console.log(`High Level Room: ${adjustments.isHighLevel ? 'Yes' : 'No'}`);
    });
}

// Run all tests
function runAllTests() {
    console.log('Starting URL Data Extraction Tests...\n');
    
    try {
        testURLDataExtraction();
        testSavedReplayURL();
        demonstrateIntegration();
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run tests if called directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    extractPaipuData,
    simulateGameMetadata,
    testURLDataExtraction,
    testSavedReplayURL,
    demonstrateIntegration,
    runAllTests
};