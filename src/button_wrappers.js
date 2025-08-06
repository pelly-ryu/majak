// DOM wrapper functions for button event handlers
// These functions handle DOM interactions and call the pure functions

// Import or assume pure functions are available
// In browser context, button_functions.js should be loaded first

/**
 * URL parsing button handlers
 */
function quickTest() {
    const url = document.getElementById('urlInput').value.trim();
    const resultDiv = document.getElementById('result');
    
    const analysisResult = analyzeUrlPure(url);
    const formattedResult = formatUrlAnalysisResult(analysisResult);
    
    if (formattedResult.type === 'success') {
        const data = analysisResult.data;
        resultDiv.innerHTML = formattedResult.html + 
            `\n\n🔗 <a href="test/url_extraction_demo.html?url=${encodeURIComponent(url)}" target="_blank">Open Full Analysis →</a>`;
    } else if (formattedResult.type === 'info') {
        resultDiv.innerHTML = formattedResult.html +
            `\n\n🔗 <a href="test/url_extraction_demo.html?url=${encodeURIComponent(url)}" target="_blank">Analyze Anyway →</a>`;
    } else {
        resultDiv.innerHTML = formattedResult.html;
    }
}

function loadSample() {
    const sampleUrl = getSampleUrl();
    document.getElementById('urlInput').value = sampleUrl;
    quickTest();
}

function clearResult() {
    document.getElementById('result').innerHTML = '';
    document.getElementById('urlInput').value = '';
}

/**
 * Game position button handlers
 */
function loadPosition() {
    const debugString = document.getElementById('debugInput').value.trim();
    const validation = validateDebugString(debugString);
    
    if (!validation.valid) {
        alert(validation.error);
        return;
    }
    
    try {
        // Call existing game engine function
        if (typeof readDebugString === 'function') {
            readDebugString(debugString);
        }
        
        document.getElementById('aiResults').style.display = 'none';
        document.getElementById('comparisonResults').style.display = 'none';
        
        if (typeof displayGamePosition === 'function') {
            displayGamePosition();
        }
        
        alert("Position loaded successfully!");
    } catch (error) {
        alert("Error loading position: " + error.message);
    }
}

function loadExample() {
    const examplePosition = getDefaultExamplePosition();
    document.getElementById('debugInput').value = examplePosition;
}

/**
 * Teaching scenarios button handlers
 */
function showScenarios() {
    const panel = document.getElementById('scenariosPanel');
    const buttonsDiv = document.getElementById('scenarioButtons');
    
    const scenarios = getTeachingScenarios();
    
    // Generate scenario buttons
    buttonsDiv.innerHTML = '';
    for (const [key, scenario] of Object.entries(scenarios)) {
        const scenarioDiv = document.createElement('div');
        scenarioDiv.className = 'hand-section';
        scenarioDiv.innerHTML = `
            <h4>${scenario.name}</h4>
            <p>${scenario.description}</p>
            <p><em>Key concept: ${scenario.concept}</em></p>
            <button onclick="loadScenario('${key}')">Load This Scenario</button>
        `;
        buttonsDiv.appendChild(scenarioDiv);
    }
    
    panel.style.display = 'block';
}

function hideScenarios() {
    document.getElementById('scenariosPanel').style.display = 'none';
}

function loadScenario(scenarioKey) {
    const scenario = getScenario(scenarioKey);
    if (scenario) {
        document.getElementById('debugInput').value = scenario.debugString;
        loadPosition();
        hideScenarios();
        
        // Show the concept for this scenario
        setTimeout(() => {
            alert(`Teaching Concept: ${scenario.concept}\n\nNow get the AI recommendation to see why this position teaches "${scenario.name}"`);
        }, 500);
    }
}

/**
 * AI analysis button handlers
 */
async function getRecommendation() {
    try {
        // Call existing AI function
        let aiChoice;
        if (typeof getAIRecommendation === 'function') {
            aiChoice = await getAIRecommendation();
        } else {
            throw new Error('AI recommendation function not available');
        }
        
        let tileName, tileEmoji;
        if (typeof getTileName === 'function') {
            tileName = getTileName(aiChoice);
        } else {
            tileName = `${aiChoice.index}${['p','m','s','z'][aiChoice.type]}`;
        }
        
        if (typeof getTileEmoji === 'function') {
            tileEmoji = getTileEmoji(aiChoice.type, aiChoice.index, aiChoice.dora);
        } else {
            tileEmoji = tileName; // fallback
        }
        
        document.getElementById('aiResults').innerHTML = `
            <h3>AI Recommendation</h3>
            <div class="hand-section">
                <h4>Recommended discard:</h4>
                <div class="tile-display">${tileEmoji} (${tileName})</div>
            </div>
        `;
        document.getElementById('aiResults').style.display = 'block';
    } catch (error) {
        alert("Error getting AI recommendation: " + error.message);
    }
}

async function compareMove() {
    const playerMoveStr = document.getElementById('playerMove').value.trim();
    const validation = parsePlayerMove(playerMoveStr);
    
    if (!validation.valid) {
        alert(validation.error);
        return;
    }

    try {
        // Get AI recommendation first
        let aiChoice;
        if (typeof getAIRecommendation === 'function') {
            aiChoice = await getAIRecommendation();
        } else {
            throw new Error('AI recommendation function not available');
        }
        
        // Parse player move using existing function
        let playerChoice;
        if (typeof parseTileString === 'function') {
            playerChoice = parseTileString(playerMoveStr)[0];
            if (playerChoice === undefined) {
                alert("Invalid tile format. Use format like '9p', '1m', '7s', '1z'");
                return;
            }
        } else {
            throw new Error('Tile parsing function not available');
        }

        // Compare decisions using existing function
        let comparison, explanation;
        if (typeof compareDecisions === 'function' && typeof generateTeachingExplanation === 'function') {
            comparison = compareDecisions(playerChoice, aiChoice, window.lastAIReasoning || {});
            explanation = generateTeachingExplanation(comparison, 'beginner');
        } else {
            // Fallback basic comparison
            comparison = { quality: playerChoice.index === aiChoice.index && playerChoice.type === aiChoice.type ? 'Optimal' : 'Suboptimal' };
            explanation = 'Detailed analysis requires review engine functions.';
        }

        const qualityClass = 'quality-' + comparison.quality.toLowerCase();
        
        let playerEmoji, aiEmoji, playerTileName, aiTileName;
        if (typeof getTileEmoji === 'function' && typeof getTileName === 'function') {
            playerEmoji = getTileEmoji(playerChoice.type, playerChoice.index, playerChoice.dora);
            aiEmoji = getTileEmoji(aiChoice.type, aiChoice.index, aiChoice.dora);
            playerTileName = getTileName(playerChoice);
            aiTileName = getTileName(aiChoice);
        } else {
            playerEmoji = playerTileName = `${playerChoice.index}${['p','m','s','z'][playerChoice.type]}`;
            aiEmoji = aiTileName = `${aiChoice.index}${['p','m','s','z'][aiChoice.type]}`;
        }
        
        document.getElementById('comparisonResults').innerHTML = `
            <h3>Move Comparison</h3>
            <div class="hand-section">
                <h4>Player choice:</h4>
                <div class="tile-display">${playerEmoji} (${playerTileName})</div>
            </div>
            <div class="hand-section">
                <h4>AI choice:</h4>
                <div class="tile-display">${aiEmoji} (${aiTileName})</div>
            </div>
            <p><strong>Quality:</strong> <span class="${qualityClass}">${comparison.quality}</span></p>
            <h4>Teaching Explanation:</h4>
            <p>${explanation}</p>
        `;
        document.getElementById('comparisonResults').style.display = 'block';
    } catch (error) {
        alert("Error comparing moves: " + error.message);
    }
}

/**
 * Hand builder button handlers
 */
let builtHandTiles = clearHandPure();

function showHandBuilder() {
    const panel = document.getElementById('handBuilderPanel');
    generateTileSelector();
    panel.style.display = 'block';
}

function hideHandBuilder() {
    document.getElementById('handBuilderPanel').style.display = 'none';
}

function generateTileSelector() {
    const selector = document.getElementById('tileSelector');
    selector.innerHTML = '';

    const suits = createTileSelectorData();

    suits.forEach(suit => {
        const suitDiv = document.createElement('div');
        suitDiv.className = 'tile-selector-section';
        suitDiv.innerHTML = `<h4>${suit.name}</h4>`;
        
        const tilesDiv = document.createElement('div');
        suit.tiles.forEach(tileIndex => {
            const button = document.createElement('button');
            button.className = 'tile-button';
            
            // Use emoji function if available, otherwise fallback
            if (typeof getTileEmoji === 'function') {
                button.innerHTML = getTileEmoji(suit.type, tileIndex, false);
            } else {
                button.innerHTML = `${tileIndex}${['p','m','s','z'][suit.type]}`;
            }
            
            if (typeof getNameForType === 'function') {
                button.title = `${tileIndex}${getNameForType(suit.type)}`;
            } else {
                button.title = `${tileIndex}${['p','m','s','z'][suit.type]}`;
            }
            
            button.onclick = () => addTileToHand(suit.type, tileIndex);
            tilesDiv.appendChild(button);
        });
        
        suitDiv.appendChild(tilesDiv);
        selector.appendChild(suitDiv);
    });
}

function addTileToHand(type, index) {
    const result = addTileToHandPure(builtHandTiles, type, index);
    
    if (!result.success) {
        alert(result.error);
        return;
    }
    
    builtHandTiles = result.hand;
    updateHandDisplay();
}

function clearHand() {
    builtHandTiles = clearHandPure();
    updateHandDisplay();
}

function updateHandDisplay() {
    const handDiv = document.getElementById('builtHand');
    if (builtHandTiles.length === 0) {
        handDiv.innerHTML = 'Click tiles below to add to hand';
    } else {
        if (typeof getTileEmoji === 'function') {
            handDiv.innerHTML = builtHandTiles.map(tile => getTileEmoji(tile.type, tile.index, tile.dora)).join(' ');
        } else {
            handDiv.innerHTML = builtHandTiles.map(tile => `${tile.index}${['p','m','s','z'][tile.type]}`).join(' ');
        }
    }
}

function generateDebugString() {
    const result = generateDebugStringFromHand(builtHandTiles);
    
    if (!result.success) {
        alert(result.error);
        return;
    }

    // For a more complete implementation, we'd need to convert tiles properly
    // For now, create a basic debug string
    let handString = '';
    if (typeof getStringForTiles === 'function') {
        handString = getStringForTiles(builtHandTiles);
    } else {
        // Simple fallback conversion
        const grouped = { m: [], p: [], s: [], z: [] };
        builtHandTiles.forEach(tile => {
            const suit = ['p','m','s','z'][tile.type];
            grouped[suit].push(tile.index);
        });
        
        handString = ['m','p','s','z'].map(suit => {
            if (grouped[suit].length > 0) {
                return grouped[suit].sort().join('') + suit;
            }
            return '';
        }).filter(s => s).join('');
    }
    
    const debugString = `1m|${handString}|||||||||0,0,0,0|2|1|50`;
    
    document.getElementById('debugInput').value = debugString;
    hideHandBuilder();
    loadPosition();
    alert("Position generated! You can now analyze your custom hand.");
}

/**
 * General display functions
 */
function displayGamePosition() {
    // Use existing functions if available
    if (typeof getHandDisplay === 'function' && typeof ownHand !== 'undefined' && typeof dora !== 'undefined') {
        const positionHtml = `
            <div class="hand-section">
                <h4>Your Hand:</h4>
                <div class="tile-display">${getHandDisplay(ownHand)}</div>
            </div>
            <div class="hand-section">
                <h4>Dora:</h4>
                <div class="tile-display">${getHandDisplay(dora)}</div>
            </div>
        `;
        
        // Add position display area if it doesn't exist
        let positionDiv = document.getElementById('positionDisplay');
        if (!positionDiv) {
            positionDiv = document.createElement('div');
            positionDiv.id = 'positionDisplay';
            positionDiv.className = 'container';
            positionDiv.innerHTML = '<h2>Current Position</h2>';
            
            const inputContainer = document.querySelector('.container');
            inputContainer.parentNode.insertBefore(positionDiv, inputContainer.nextSibling);
        }
        
        positionDiv.innerHTML = '<h2>Current Position</h2>' + positionHtml;
    }
}

// Auto-initialization if on index page
if (typeof window !== 'undefined') {
    window.onload = function() {
        // Only auto-load sample on index page
        if (document.getElementById('urlInput')) {
            loadSample();
        }
        
        // Initialize review mode if on analyze page
        if (typeof initReviewMode === 'function') {
            initReviewMode();
            console.log("Review system initialized");
        }
    };
}