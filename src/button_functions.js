// Pure functions for button functionality
// These functions contain the core logic without DOM manipulation

/**
 * URL parsing functions
 */
function extractPaipuDataPure(url) {
    if (!url) return null;
    
    try {
        const urlObj = new URL(url);
        const paipu = urlObj.searchParams.get('paipu');
        
        if (paipu) {
            const parts = paipu.split('_');
            const gameId = parts[0];
            const playerId = parts[1];
            
            const datePart = gameId.split('-')[0];
            if (datePart && datePart.length === 6) {
                const year = 2000 + parseInt(datePart.substring(0, 2));
                const month = parseInt(datePart.substring(2, 4));
                const day = parseInt(datePart.substring(4, 6));
                
                return {
                    gameDate: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
                    gameId: gameId,
                    playerId: playerId,
                    isReplay: true
                };
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

function analyzeUrlPure(url) {
    if (!url) return { error: 'Please enter a URL' };
    
    const paipuData = extractPaipuDataPure(url);
    
    if (paipuData) {
        return {
            success: true,
            type: 'replay',
            data: paipuData
        };
    } else {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname.includes('mahjongsoul')) {
                return {
                    success: true,
                    type: 'mahjong_soul',
                    data: {
                        hostname: urlObj.hostname,
                        pathname: urlObj.pathname,
                        message: 'Not a replay URL (no paipu parameter)'
                    }
                };
            } else {
                return { error: '⚠️ Not a Mahjong Soul URL' };
            }
        } catch (e) {
            return { error: '❌ Invalid URL format' };
        }
    }
}

function getSampleUrl() {
    return 'https://mahjongsoul.game.yo-star.com/?paipu=250804-70f742aa-e642-478a-bb72-6d2453cae2fb_a922337773';
}

/**
 * Game position functions
 */
function getDefaultExamplePosition() {
    return "1m|1239p22456m44468s|||||||||0,0,0,0|2|1|50";
}

function validateDebugString(debugString) {
    if (!debugString || typeof debugString !== 'string') {
        return { valid: false, error: 'Debug string is required' };
    }
    
    const parts = debugString.split('|');
    if (parts.length !== 14) {
        return { valid: false, error: 'Debug string must have 14 parts separated by |' };
    }
    
    return { valid: true };
}

function parsePlayerMove(moveStr) {
    if (!moveStr || typeof moveStr !== 'string') {
        return { valid: false, error: 'Move string is required' };
    }
    
    const trimmed = moveStr.trim();
    if (trimmed.length < 2) {
        return { valid: false, error: 'Invalid tile format' };
    }
    
    // Basic validation for tile format (e.g., '9p', '1m', '7s', '1z')
    const match = trimmed.match(/^(\d)([mpsz])$/);
    if (!match) {
        return { valid: false, error: "Invalid tile format. Use format like '9p', '1m', '7s', '1z'" };
    }
    
    const [, number, suit] = match;
    const num = parseInt(number);
    
    if (suit === 'z' && (num < 1 || num > 7)) {
        return { valid: false, error: 'Honor tiles must be 1-7' };
    } else if (suit !== 'z' && (num < 1 || num > 9)) {
        return { valid: false, error: 'Number tiles must be 1-9' };
    }
    
    return { valid: true, move: trimmed };
}

/**
 * Teaching scenarios management
 */
function getTeachingScenarios() {
    return {
        "basic_efficiency": {
            name: "Basic Efficiency",
            description: "Learn when to prioritize tile efficiency over other factors",
            debugString: "1m|1239p22456m44468s|||||||||0,0,0,0|2|1|50",
            concept: "Always aim to improve your hand's efficiency first"
        },
        "safety_vs_speed": {
            name: "Safety vs Speed", 
            description: "Balance between advancing your hand and staying safe",
            debugString: "6z|23467m345p67899s|||||23467m||||0,0,0,0|2|1|30",
            concept: "Sometimes safety is more important than hand advancement"
        },
        "dora_value": {
            name: "Dora Value Assessment",
            description: "Learn how to properly value dora tiles in your decisions",
            debugString: "5p|11223m567p11199s|||||||||0,0,0,0|2|1|40",
            concept: "Dora tiles increase hand value but shouldn't override fundamental strategy"
        },
        "riichi_timing": {
            name: "Riichi Timing",
            description: "Understand when to declare riichi vs staying dama",
            debugString: "7z|1234567m22p789s|||||||||0,0,0,0|2|1|25",
            concept: "Riichi timing depends on hand value, safety, and game situation"
        },
        "defensive_play": {
            name: "Defensive Play",
            description: "Learn defensive discard principles when opponents threaten",
            debugString: "1z|3456789m23p567s|||||1238m|7m9m|||1,0,0,0|2|1|15",
            concept: "Safe tiles are more valuable than hand advancement when under pressure"
        },
        "thirteen_orphans": {
            name: "Thirteen Orphans",
            description: "Recognize when to go for thirteen orphans yakuman",
            debugString: "1m|119m19p19s1234567z|||||||||0,0,0,0|2|1|60",
            concept: "13 orphans requires collecting all terminals and honors"
        },
        "seven_pairs": {
            name: "Seven Pairs (Chiitoitsu)",
            description: "Learn when seven pairs strategy is optimal",
            debugString: "2m|1133p445566m77s|||||||||0,0,0,0|2|1|50",
            concept: "Chiitoitsu works best with many early pairs and no good sequences"
        },
        "end_game": {
            name: "End Game Strategy",
            description: "Adjust strategy when few tiles remain",
            debugString: "4z|23456m11234p89s|||||||||0,0,0,0|2|1|5",
            concept: "With few tiles left, prioritize definite wins over potential improvements"
        }
    };
}

function getScenario(scenarioKey) {
    const scenarios = getTeachingScenarios();
    return scenarios[scenarioKey] || null;
}

/**
 * Hand builder functions
 */
function createTileSelectorData() {
    return [
        { name: 'Characters (Man)', type: 1, tiles: [1,2,3,4,5,6,7,8,9] },
        { name: 'Dots (Pin)', type: 0, tiles: [1,2,3,4,5,6,7,8,9] },
        { name: 'Bamboo (Sou)', type: 2, tiles: [1,2,3,4,5,6,7,8,9] },
        { name: 'Honors', type: 3, tiles: [1,2,3,4,5,6,7] }
    ];
}

function addTileToHandPure(builtHandTiles, type, index) {
    if (builtHandTiles.length >= 14) {
        return { success: false, error: "Hand is full (14 tiles maximum)" };
    }
    
    const newHand = [...builtHandTiles, {type: type, index: index, dora: false}];
    return { success: true, hand: newHand };
}

function clearHandPure() {
    return [];
}

function generateDebugStringFromHand(builtHandTiles) {
    if (builtHandTiles.length === 0) {
        return { success: false, error: "Please add tiles to your hand first" };
    }

    // This would need to use the existing getStringForTiles function
    // For now, return a simple format
    const debugString = `1m|custom_hand|||||||||0,0,0,0|2|1|50`;
    
    return { success: true, debugString: debugString };
}

/**
 * UI state management
 */
function createUIState() {
    return {
        scenariosVisible: false,
        handBuilderVisible: false,
        builtHand: [],
        currentPosition: null,
        aiResults: null,
        comparisonResults: null
    };
}

function toggleScenarios(currentState) {
    return { ...currentState, scenariosVisible: !currentState.scenariosVisible };
}

function toggleHandBuilder(currentState) {
    return { ...currentState, handBuilderVisible: !currentState.handBuilderVisible };
}

function updateBuiltHand(currentState, newHand) {
    return { ...currentState, builtHand: newHand };
}

/**
 * Results formatting functions
 */
function formatUrlAnalysisResult(result) {
    if (result.error) {
        return {
            html: `<div class="result" style="background: #f8d7da; border-color: #f5c6cb;">${result.error}</div>`,
            type: 'error'
        };
    }
    
    if (result.type === 'replay') {
        const data = result.data;
        return {
            html: `<div class="result">✅ <strong>Replay URL Detected!</strong>
Game Date: ${data.gameDate}
Player ID: ${data.playerId}
Game ID: ${data.gameId}</div>`,
            type: 'success'
        };
    }
    
    if (result.type === 'mahjong_soul') {
        const data = result.data;
        return {
            html: `<div class="result">ℹ️ <strong>Mahjong Soul URL</strong>
Domain: ${data.hostname}
Path: ${data.pathname}
${data.message}</div>`,
            type: 'info'
        };
    }
    
    return { html: '', type: 'empty' };
}

// Export functions for both browser and Node.js environments
const exportObject = {
    // URL functions
    extractPaipuDataPure,
    analyzeUrlPure,
    getSampleUrl,
    
    // Position functions
    getDefaultExamplePosition,
    validateDebugString,
    parsePlayerMove,
    
    // Scenario functions
    getTeachingScenarios,
    getScenario,
    
    // Hand builder functions
    createTileSelectorData,
    addTileToHandPure,
    clearHandPure,
    generateDebugStringFromHand,
    
    // UI state functions
    createUIState,
    toggleScenarios,
    toggleHandBuilder,
    updateBuiltHand,
    
    // Formatting functions
    formatUrlAnalysisResult
};

// For browser environment
if (typeof window !== 'undefined') {
    window.ButtonFunctions = exportObject;
}

// For Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = exportObject;
}