//################################
// REVIEW ENGINE
// Game record analysis and decision explanation for teaching
//################################

// Global variables for review mode
var reviewMode = false;
var currentMoveIndex = 0;
var gameRecord = [];
var capturedDecisions = [];

// Data structure for capturing decision reasoning
function DecisionReasoning() {
    return {
        position: currentMoveIndex,
        player: 0, // Which player made the decision
        gameState: captureGameState(),
        strategy: strategy,
        strategyAllowsCalls: strategyAllowsCalls,
        tilePriorities: [], // Will be populated by modified discard()
        chosenTile: null,
        alternativeOptions: [],
        decisionFactors: {
            efficiency: 0,
            safety: 0,
            yaku: 0,
            dora: 0,
            waits: 0,
            shanten: 0
        },
        callDecision: null, // For call decisions (chi/pon/kan)
        timestamp: new Date()
    };
}

// Capture current game state for analysis
function captureGameState() {
    return {
        ownHand: [...ownHand],
        dora: [...dora],
        discards: discards.map(d => [...d]),
        calls: calls.map(c => [...c]),
        seatWind: seatWind,
        roundWind: roundWind,
        tilesLeft: tilesLeft,
        riichiTiles: [...riichiTiles],
        isClosed: isClosed
    };
}

// Extended version of readDebugString for game records
function readGameRecord(gameRecordString) {
    var moves = gameRecordString.split("||");
    gameRecord = [];
    
    for (let moveString of moves) {
        if (moveString.trim() === "") continue;
        
        var moveData = parseMove(moveString);
        if (moveData) {
            gameRecord.push(moveData);
        }
    }
    
    log("Loaded game record with " + gameRecord.length + " moves");
    return gameRecord;
}

// Parse individual move from game record
function parseMove(moveString) {
    // Expected format: "PLAYER|ACTION|STATE|CHOSEN_TILE"
    // STATE follows the debugString format
    // ACTION is "discard", "chi", "pon", "kan", "riichi"
    
    var parts = moveString.split("|");
    if (parts.length < 4) {
        log("Invalid move format: " + moveString);
        return null;
    }
    
    return {
        player: parseInt(parts[0]),
        action: parts[1],
        gameState: parts[2], // debugString format
        chosenTile: parts[3],
        rawString: moveString
    };
}

// Set up game state for a specific move in the record
function setGameStateForMove(moveIndex) {
    if (moveIndex >= gameRecord.length) {
        log("Move index out of range: " + moveIndex);
        return false;
    }
    
    currentMoveIndex = moveIndex;
    var move = gameRecord[moveIndex];
    
    // Use the existing readDebugString to set up the state
    readDebugString(move.gameState);
    
    log("Set game state for move " + moveIndex + " (Player " + move.player + " " + move.action + ")");
    return true;
}

// Get AI recommendation for current game state
async function getAIRecommendation() {
    if (!reviewMode) {
        log("Warning: getAIRecommendation called outside review mode");
    }
    
    // Determine strategy and initialize for analysis
    determineStrategy();
    initialDiscardedTilesSafety();
    updateAvailableTiles();
    
    // Get AI's decision using the existing discard function
    var aiDecision = await discard();
    
    return aiDecision;
}

// Compare player move with AI recommendation
function compareDecisions(playerMove, aiRecommendation, aiReasoning) {
    var comparison = {
        playerChoice: playerMove,
        aiChoice: aiRecommendation,
        isSame: false,
        priorityDifference: 0,
        playerTileRank: -1,
        qualityAssessment: "unknown",
        explanation: "No comparison data available",
        detailedAnalysis: []
    };
    
    if (!playerMove || !aiRecommendation) {
        return comparison;
    }
    
    comparison.isSame = isSameTile(playerMove, aiRecommendation, true);
    
    if (aiReasoning && aiReasoning.tilePriorities) {
        // Find where the player's choice ranks in AI's analysis
        for (var i = 0; i < aiReasoning.tilePriorities.length; i++) {
            if (isSameTile(aiReasoning.tilePriorities[i].tile, playerMove, true)) {
                comparison.playerTileRank = i + 1;
                comparison.priorityDifference = aiReasoning.tilePriorities[0].priority - aiReasoning.tilePriorities[i].priority;
                break;
            }
        }
        
        // Assess the quality of the player's choice
        if (comparison.isSame) {
            comparison.qualityAssessment = "optimal";
            comparison.explanation = "Player choice matches AI recommendation - excellent move!";
        } else if (comparison.playerTileRank <= 2) {
            comparison.qualityAssessment = "good";
            comparison.explanation = "Player choice is among top alternatives (rank " + comparison.playerTileRank + ")";
        } else if (comparison.playerTileRank <= 5) {
            comparison.qualityAssessment = "acceptable";
            comparison.explanation = "Player choice is reasonable but not optimal (rank " + comparison.playerTileRank + ")";
        } else {
            comparison.qualityAssessment = "suboptimal";
            comparison.explanation = "Player choice is significantly worse than AI recommendation";
        }
        
        // Generate detailed analysis
        comparison.detailedAnalysis = generateDetailedComparison(playerMove, aiRecommendation, aiReasoning);
    }
    
    return comparison;
}

// Generate detailed comparison analysis
function generateDetailedComparison(playerMove, aiChoice, aiReasoning) {
    var analysis = [];
    
    if (!aiReasoning || !aiReasoning.tilePriorities) {
        return ["No detailed analysis available"];
    }
    
    // Find player's tile in AI analysis
    var playerTileData = null;
    var aiChoiceData = aiReasoning.tilePriorities[0];
    
    for (var i = 0; i < aiReasoning.tilePriorities.length; i++) {
        if (isSameTile(aiReasoning.tilePriorities[i].tile, playerMove, true)) {
            playerTileData = aiReasoning.tilePriorities[i];
            break;
        }
    }
    
    analysis.push("=== Move Comparison Analysis ===");
    analysis.push("Player discarded: " + getTileName(playerMove));
    analysis.push("AI recommends: " + getTileName(aiChoice));
    
    if (playerTileData) {
        analysis.push("\n--- Score Comparison ---");
        analysis.push("Player choice priority: " + playerTileData.priority.toFixed(3));
        analysis.push("AI choice priority: " + aiChoiceData.priority.toFixed(3));
        analysis.push("Difference: " + (aiChoiceData.priority - playerTileData.priority).toFixed(3));
        
        analysis.push("\n--- Factor Breakdown ---");
        analysis.push("Efficiency: Player=" + (playerTileData.efficiency || 0).toFixed(3) + 
                     " vs AI=" + (aiChoiceData.efficiency || 0).toFixed(3));
        analysis.push("Safety: Player=" + (playerTileData.safe === 1 ? "Safe" : "Dangerous") + 
                     " vs AI=" + (aiChoiceData.safe === 1 ? "Safe" : "Dangerous"));
        analysis.push("Yaku potential: Player=" + ((playerTileData.yaku ? playerTileData.yaku.closed : 0) || 0).toFixed(3) + 
                     " vs AI=" + ((aiChoiceData.yaku ? aiChoiceData.yaku.closed : 0) || 0).toFixed(3));
        analysis.push("Dora value: Player=" + (playerTileData.dora || 0).toFixed(3) + 
                     " vs AI=" + (aiChoiceData.dora || 0).toFixed(3));
        analysis.push("Shanten: Player=" + (playerTileData.shanten || 0) + 
                     " vs AI=" + (aiChoiceData.shanten || 0));
        
        // Identify key differences
        analysis.push("\n--- Key Differences ---");
        if (Math.abs((playerTileData.efficiency || 0) - (aiChoiceData.efficiency || 0)) > 0.5) {
            analysis.push("• Significant efficiency difference: AI choice improves hand shape better");
        }
        if (playerTileData.safe !== aiChoiceData.safe) {
            analysis.push("• Safety difference: " + (aiChoiceData.safe === 1 ? "AI choice is safer" : "Player choice is safer"));
        }
        if (Math.abs((playerTileData.dora || 0) - (aiChoiceData.dora || 0)) > 0.5) {
            analysis.push("• Dora value difference: " + (aiChoiceData.dora > playerTileData.dora ? "AI" : "Player") + " choice has more dora");
        }
    } else {
        analysis.push("\nPlayer's tile choice was not evaluated by AI (very unusual)");
    }
    
    return analysis;
}

// Enhanced comparison for teaching purposes
function generateTeachingExplanation(comparison, skillLevel = "beginner") {
    var explanation = [];
    
    explanation.push("=== Teaching Explanation ===");
    explanation.push("Move Quality: " + comparison.qualityAssessment.toUpperCase());
    
    if (skillLevel === "beginner") {
        if (comparison.isSame) {
            explanation.push("🎉 Perfect! You chose the same tile as the AI.");
            explanation.push("This means you're thinking like a strong player!");
        } else if (comparison.qualityAssessment === "good") {
            explanation.push("👍 Good move! Your choice was one of the top alternatives.");
            explanation.push("You're on the right track, just minor differences in evaluation.");
        } else if (comparison.qualityAssessment === "acceptable") {
            explanation.push("⚠️ Decent move, but there are better options.");
            explanation.push("Try to consider: efficiency, safety, and potential scoring.");
        } else {
            explanation.push("❌ This move could be improved.");
            explanation.push("Focus on: What helps your hand progress toward winning?");
        }
        
        explanation.push("\nKey lesson: " + getKeyLessonForMove(comparison));
    } else {
        // More detailed explanations for advanced players
        explanation.push("Ranking: " + (comparison.playerTileRank > 0 ? "#" + comparison.playerTileRank : "Not evaluated"));
        explanation.push("Priority difference: " + comparison.priorityDifference.toFixed(3));
        explanation.push("\nConsider the trade-offs between efficiency, safety, and scoring potential.");
    }
    
    return explanation.join("\n");
}

// Get key lesson based on comparison
function getKeyLessonForMove(comparison) {
    if (comparison.isSame) {
        return "You're making optimal decisions - keep it up!";
    }
    
    // This would be enhanced with more specific analysis
    if (comparison.qualityAssessment === "suboptimal") {
        return "Always consider: 1) Does this help complete your hand? 2) Is it safe? 3) Does it maintain scoring potential?";
    } else {
        return "Look for small optimizations in hand efficiency and safety balance.";
    }
}

// Initialize review mode
function initReviewMode() {
    reviewMode = true;
    capturedDecisions = [];
    currentMoveIndex = 0;
    log("Review mode initialized");
}

// Exit review mode and return to normal operation
function exitReviewMode() {
    reviewMode = false;
    capturedDecisions = [];
    currentMoveIndex = 0;
    log("Review mode deactivated");
}

// Check if we're currently in review mode
function isReviewMode() {
    return reviewMode;
}

// Capture detailed reasoning for discard decisions
function captureDiscardReasoning(tilePriorities) {
    var reasoning = new DecisionReasoning();
    
    // Store the complete tile priority analysis
    reasoning.tilePriorities = tilePriorities.map(tp => ({
        tile: {...tp.tile},
        priority: tp.priority,
        efficiency: tp.efficiency || 0,
        yaku: {...tp.yaku} || {open: 0, closed: 0},
        dora: tp.dora || 0,
        waits: tp.waits || 0,
        danger: tp.danger || 0,
        shanten: tp.shanten || 0,
        safe: tp.safe || 0,
        score: {...tp.score} || {open: 0, closed: 0, riichi: 0}
    }));
    
    // Capture key decision factors from the top choice
    if (tilePriorities.length > 0) {
        var topChoice = tilePriorities[0];
        reasoning.decisionFactors = {
            efficiency: topChoice.efficiency || 0,
            safety: (topChoice.safe === 1) ? 100 : (100 - (topChoice.danger || 0)),
            yaku: (topChoice.yaku ? topChoice.yaku.closed : 0) || 0,
            dora: topChoice.dora || 0,
            waits: topChoice.waits || 0,
            shanten: topChoice.shanten || 0
        };
    }
    
    // Store alternative options (top 5 choices)
    reasoning.alternativeOptions = tilePriorities.slice(0, 5).map(tp => ({
        tile: {...tp.tile},
        priority: tp.priority,
        reason: "Alternative choice with priority " + tp.priority.toFixed(3)
    }));
    
    return reasoning;
}

// Get detailed explanation for why a specific tile was chosen
function explainTileChoice(reasoning) {
    if (!reasoning || !reasoning.tilePriorities.length) {
        return "No reasoning data available";
    }
    
    var explanation = [];
    var topChoice = reasoning.tilePriorities[0];
    
    // Primary decision factors
    explanation.push("Decision factors for " + getTileName(topChoice.tile) + ":");
    explanation.push("- Priority score: " + topChoice.priority.toFixed(3));
    explanation.push("- Efficiency: " + topChoice.efficiency.toFixed(3));
    explanation.push("- Safety level: " + (topChoice.safe === 1 ? "Safe" : "Dangerous (" + topChoice.danger.toFixed(2) + ")"));
    explanation.push("- Yaku potential: " + (topChoice.yaku.closed || 0).toFixed(3));
    explanation.push("- Dora value: " + (topChoice.dora || 0).toFixed(3));
    explanation.push("- Shanten: " + (topChoice.shanten || 0));
    
    // Strategy context
    explanation.push("- Strategy: " + reasoning.strategy);
    
    // Alternative comparison
    if (reasoning.alternativeOptions.length > 1) {
        explanation.push("Top alternatives:");
        for (var i = 1; i < Math.min(3, reasoning.alternativeOptions.length); i++) {
            var alt = reasoning.alternativeOptions[i];
            explanation.push("  " + (i+1) + ". " + getTileName(alt.tile) + " (priority: " + alt.priority.toFixed(3) + ")");
        }
    }
    
    return explanation.join("\n");
}

// Capture detailed reasoning for call decisions (chi/pon/kan)
function captureCallReasoning(combinations, currentHandValue) {
    var reasoning = new DecisionReasoning();
    reasoning.callDecision = {
        availableTile: getTileForCall ? {...getTileForCall()} : null,
        combinations: combinations.slice(), // Copy the array
        currentHandValue: {
            shanten: currentHandValue.shanten,
            score: {...currentHandValue.score},
            yaku: {...currentHandValue.yaku},
            waits: currentHandValue.waits,
            priority: currentHandValue.priority
        },
        strategyAllowsCalls: strategyAllowsCalls,
        tilesLeft: tilesLeft,
        isClosed: isClosed,
        evaluatedCombinations: []
    };
    
    // Evaluate each combination option
    for (var i = 0; i < combinations.length; i++) {
        var callTiles = combinations[i].split("|");
        callTiles = callTiles.map(t => getTileFromString(t));
        
        var combEvaluation = {
            combination: combinations[i],
            callTiles: callTiles.map(t => ({...t})),
            doraValue: getNumberOfDoras(callTiles),
            evaluation: "Combination " + (i + 1) + " with " + getNumberOfDoras(callTiles) + " dora"
        };
        
        reasoning.callDecision.evaluatedCombinations.push(combEvaluation);
    }
    
    return reasoning;
}

// Get explanation for call decisions
function explainCallDecision(reasoning) {
    if (!reasoning || !reasoning.callDecision) {
        return "No call reasoning data available";
    }
    
    var explanation = [];
    var call = reasoning.callDecision;
    
    explanation.push("=== Call Decision Analysis ===");
    if (call.availableTile) {
        explanation.push("Available tile: " + getTileName(call.availableTile));
    }
    explanation.push("Current hand shanten: " + call.currentHandValue.shanten);
    explanation.push("Current hand score: " + call.currentHandValue.score.closed.toFixed(0) + " (closed)");
    explanation.push("Strategy allows calls: " + call.strategyAllowsCalls);
    explanation.push("Tiles remaining: " + call.tilesLeft);
    explanation.push("Hand is closed: " + call.isClosed);
    
    explanation.push("\nAvailable combinations:");
    for (var i = 0; i < call.evaluatedCombinations.length; i++) {
        var comb = call.evaluatedCombinations[i];
        explanation.push("  " + (i + 1) + ". " + comb.combination + " (dora: " + comb.doraValue + ")");
    }
    
    explanation.push("\nDecision: " + reasoning.decision);
    explanation.push("Reason: " + reasoning.reason);
    if (reasoning.explanation) {
        explanation.push("Explanation: " + reasoning.explanation);
    }
    
    return explanation.join("\n");
}