//################################
// AI OFFENSE - EDUCATIONAL VERSION
// Hand analysis and strategy evaluation for learning purposes
//################################

//Look at Hand etc. and decide for a strategy.
function determineStrategy() {
	if (strategy != STRATEGIES.FOLD) {
		var handTriples = parseInt(getTriples(getHandWithCalls(ownHand)).length / 3);
		var pairs = getPairsAsArray(ownHand).length / 2;

		if ((pairs == 6 || (pairs >= CHIITOITSU && handTriples < 2)) && isClosed) {
			strategy = STRATEGIES.CHIITOITSU;
			strategyAllowsCalls = false;
		}
		else if (canDoThirteenOrphans()) {
			strategy = STRATEGIES.THIRTEEN_ORPHANS;
			strategyAllowsCalls = false;
		}
		else {
			if (strategy == STRATEGIES.THIRTEEN_ORPHANS ||
				strategy == STRATEGIES.CHIITOITSU) {
				strategyAllowsCalls = true;
			}
			strategy = STRATEGIES.GENERAL;
		}
	}
	log("Strategy: " + strategy);
}

//Evaluate a potential call without executing it
function evaluateCall(combinations, operation) {
	log("Evaluating call on " + getTileName(getTileForCall()));

	var handValue = getHandValues(ownHand);
	
	if (!strategyAllowsCalls && (tilesLeft > 4 || handValue.shanten > 1)) {
		return {
			recommended: false,
			reason: "Strategy does not allow calls",
			analysis: "tiles left: " + tilesLeft + ", shanten: " + handValue.shanten
		};
	}

	//Find best Combination
	var comb = -1;
	var bestCombShanten = 9;
	var bestDora = 0;

	for (var i = 0; i < combinations.length; i++) {
		var callTiles = combinations[i].split("|");
		callTiles = callTiles.map(t => getTileFromString(t));

		var newHand = removeTilesFromTileArray(ownHand, callTiles);
		var newHandTriples = getTriplesAndPairs(newHand);
		var doubles = getDoubles(removeTilesFromTileArray(newHand, newHandTriples.triples.concat(newHandTriples.pairs)));
		var shanten = calculateShanten(parseInt(newHandTriples.triples.length / 3), parseInt(newHandTriples.pairs.length / 2), parseInt(doubles.length / 2));

		if (shanten < bestCombShanten || (shanten == bestCombShanten && getNumberOfDoras(callTiles) > bestDora)) {
			comb = i;
			bestDora = getNumberOfDoras(callTiles);
			bestCombShanten = shanten;
		}
	}

	return {
		recommended: true,
		bestCombination: combinations[comb],
		shanten: bestCombShanten,
		doraValue: bestDora,
		analysis: "Best combination improves hand to " + bestCombShanten + " shanten"
	};
}

//Analyze tile priorities for educational purposes
async function getTilePriorities(inputHand) {
	var tiles = [];
	if (strategy == STRATEGIES.CHIITOITSU && inputHand.length >= 8) {
		return chiitoitsuPriorities();
	}
	if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		return thirteenOrphansPriorities();
	}

	for (let tile of inputHand) {
		var tilePrio = await getSingleTilePriority(tile, inputHand);
		tiles.push(tilePrio);
	}

	tiles.sort(function (p1, p2) {
		return p1.value - p2.value;
	});

	return tiles;
}

//Get the value/priority of a single tile for educational analysis
async function getSingleTilePriority(tile, hand) {
	var efficiency = await getEfficiency(tile, hand);
	var danger = getTileDanger(tile);
	var handValue = getHandValues(removeTilesFromTileArray(hand, [tile]));
	
	return {
		tile: tile,
		efficiency: efficiency,
		danger: danger,
		handValue: handValue,
		value: calculateTilePriority(efficiency, handValue.score.riichi, danger),
		explanation: generateTileExplanation(tile, efficiency, danger, handValue)
	};
}

//Generate educational explanation for tile priority
function generateTileExplanation(tile, efficiency, danger, handValue) {
	var explanations = [];
	
	if (efficiency > 0.8) {
		explanations.push("High efficiency - improves hand significantly");
	} else if (efficiency < 0.3) {
		explanations.push("Low efficiency - minimal hand improvement");
	}
	
	if (danger > 2000) {
		explanations.push("High danger - likely to deal into opponent");
	} else if (danger < 500) {
		explanations.push("Relatively safe discard");
	}
	
	if (handValue.shanten <= 1) {
		explanations.push("Hand is close to tenpai");
	}
	
	return explanations.join(". ");
}

//Educational hand value analysis
function getHandValues(hand, discardedTile) {
	if (strategy == STRATEGIES.CHIITOITSU) {
		return getChiitoitsuHandValue(hand, discardedTile);
	}
	if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		return getThirteenOrphansHandValue(hand);
	}

	var handWithCalls = getHandWithCalls(hand);
	var triples = getTriplesAndPairs(handWithCalls);

	var doubles = getDoubles(removeTilesFromTileArray(handWithCalls, triples.triples.concat(triples.pairs)));

	var shanten = calculateShanten(parseInt(triples.triples.length / 3), parseInt(triples.pairs.length / 2), parseInt(doubles.length / 2));
	var dora = triples.triples.concat(triples.pairs);

	var han = 0;
	var openYaku = 0;
	var closedYaku = 0;

	if (shanten <= 0) {
		var yaku = getYaku(hand, calls[0], triples);
		han = yaku.closed;
		openYaku = yaku.open;
		closedYaku = yaku.closed;
	}

	var waits = 0;
	var waitTiles = [];
	var shape = 0;

	if (shanten == 0) {
		var waitData = getWaits(hand);
		waits = waitData.waits;
		waitTiles = waitData.tiles;
		shape = waitData.shape;
	}

	return {
		shanten: shanten,
		waits: waits,
		waitTiles: waitTiles,
		shape: shape,
		dora: dora,
		yaku: { open: openYaku, closed: closedYaku },
		score: {
			open: calculateScore(0, han + getNumberOfDoras(dora)),
			closed: calculateScore(0, han + getNumberOfDoras(dora)),
			riichi: calculateScore(0, han + getNumberOfDoras(dora) + 1)
		}
	};
}

// Educational efficiency calculation
async function getEfficiency(tile, hand) {
	var newHand = removeTilesFromTileArray(hand, [tile]);
	var usefulTiles = [];

	if (strategy == STRATEGIES.CHIITOITSU) {
		for (let t of newHand) {
			pushTileIfNotExists(usefulTiles, t.index, t.type);
		}
	} else if (strategy == STRATEGIES.THIRTEEN_ORPHANS) {
		var missingTiles = getMissingTilesForThirteenOrphans(getAllTerminalHonorFromHand(newHand));
		usefulTiles = missingTiles.slice();
	} else {
		var triples = getUsefulTilesForTriple(newHand);
		var doubles = getUsefulTilesForDouble(newHand);
		usefulTiles = triples.concat(doubles);
	}

	var efficiency = 0;
	for (let usefulTile of usefulTiles) {
		var availableCount = getNumberOfTilesAvailable(usefulTile.index, usefulTile.type);
		efficiency += availableCount * getWaitQuality(usefulTile);
	}

	return efficiency / usefulTiles.length || 0;
}

//Calculate tile priority for educational display
function calculateTilePriority(efficiency, expectedScore, danger) {
	var tilePrio = (efficiency * (EFFICIENCY * 40)) + (expectedScore * 0.00015) - (danger * SAFETY * 0.002);
	return tilePrio;
}

//Chiitoitsu (7 pairs) priority analysis
function chiitoitsuPriorities() {
	var handWithoutPairs = removeTilesFromTileArray(ownHand, getPairsAsArray(ownHand));
	var pairs = getPairs(ownHand);
	var tiles = [];

	for (let pair of pairs) {
		var tilePrio = {
			tile: pair.tile1,
			efficiency: 0.1,
			danger: getTileDanger(pair.tile1),
			value: 0,
			explanation: "Pair tile - breaking pair reduces chiitoitsu potential"
		};
		tilePrio.value = calculateTilePriority(tilePrio.efficiency, 4000, tilePrio.danger);
		tiles.push(tilePrio);
	}

	handWithoutPairs.forEach(function (tile) {
		var availableTiles = getNumberOfTilesAvailable(tile.index, tile.type);
		var efficiency = (availableTiles * 2) / 10;
		
		var tilePrio = {
			tile: tile,
			efficiency: efficiency,
			danger: getTileDanger(tile),
			value: 0,
			explanation: "Single tile - " + availableTiles + " tiles available to form pair"
		};
		tilePrio.value = calculateTilePriority(tilePrio.efficiency, 4000, tilePrio.danger);
		tiles.push(tilePrio);
	});

	return tiles.sort((a, b) => a.value - b.value);
}

//Thirteen Orphans priority analysis  
function thirteenOrphansPriorities() {
	var terminalHonors = getAllTerminalHonorFromHand(ownHand);
	var missingTiles = getMissingTilesForThirteenOrphans(terminalHonors);
	var tiles = [];

	for (let tile of ownHand) {
		var efficiency = 0.1;
		var explanation = "Non-terminal/honor tile";
		
		if (isTerminalOrHonor(tile)) {
			var count = getNumberOfTilesInTileArray(terminalHonors, tile.index, tile.type);
			if (count == 1) {
				efficiency = 0.05;
				explanation = "Unique terminal/honor - keep for thirteen orphans";
			} else {
				efficiency = 0.9;
				explanation = "Extra terminal/honor - safe to discard";
			}
		} else {
			efficiency = 0.95;
			explanation = "Not needed for thirteen orphans";
		}

		var tilePrio = {
			tile: tile,
			efficiency: efficiency,
			danger: getTileDanger(tile),
			value: 0,
			explanation: explanation
		};
		tilePrio.value = calculateTilePriority(tilePrio.efficiency, 32000, tilePrio.danger);
		tiles.push(tilePrio);
	}

	return tiles.sort((a, b) => a.value - b.value);
}

//Check if thirteen orphans is possible
function canDoThirteenOrphans() {
	var terminalHonors = getAllTerminalHonorFromHand(ownHand);
	return terminalHonors.length >= THIRTEEN_ORPHANS;
}

//Get missing tiles for thirteen orphans
function getMissingTilesForThirteenOrphans(uniqueTerminalHonors) {
	var missingTiles = [];
	var requiredTiles = [
		{index: 1, type: 0}, {index: 9, type: 0}, // Pin
		{index: 1, type: 1}, {index: 9, type: 1}, // Man  
		{index: 1, type: 2}, {index: 9, type: 2}, // Sou
		{index: 1, type: 3}, {index: 2, type: 3}, {index: 3, type: 3}, {index: 4, type: 3}, // Winds
		{index: 5, type: 3}, {index: 6, type: 3}, {index: 7, type: 3}  // Dragons
	];

	for (let required of requiredTiles) {
		if (!uniqueTerminalHonors.some(t => t.index === required.index && t.type === required.type)) {
			missingTiles.push(required);
		}
	}

	return missingTiles;
}

//Analyze recommended discard for educational purposes
function analyzeDiscardRecommendation(inputHand) {
	return getTilePriorities(inputHand).then(tiles => {
		var sortedTiles = sortOutUnsafeTiles(tiles);
		var recommendedDiscard = getDiscardTile(sortedTiles);
		
		return {
			recommendation: recommendedDiscard,
			allPriorities: sortedTiles,
			analysis: generateDiscardAnalysis(recommendedDiscard, sortedTiles),
			safetyConsiderations: getSafetyAnalysis(sortedTiles)
		};
	});
}

//Generate educational analysis of discard choice
function generateDiscardAnalysis(recommendedTile, allTiles) {
	var analysis = [];
	
	analysis.push("Recommended discard: " + getTileName(recommendedTile.tile));
	analysis.push("Efficiency: " + recommendedTile.efficiency.toFixed(2));
	analysis.push("Danger: " + recommendedTile.danger.toFixed(0));
	analysis.push("Reasoning: " + recommendedTile.explanation);
	
	if (allTiles.length > 1) {
		var secondChoice = allTiles[1];
		analysis.push("Alternative: " + getTileName(secondChoice.tile) + 
			" (eff: " + secondChoice.efficiency.toFixed(2) + ", danger: " + secondChoice.danger.toFixed(0) + ")");
	}
	
	return analysis.join("\n");
}

//Safety analysis for teaching
function getSafetyAnalysis(tiles) {
	var safeTiles = tiles.filter(t => t.danger < 500);
	var dangerousTiles = tiles.filter(t => t.danger > 2000);
	
	return {
		safeTileCount: safeTiles.length,
		dangerousTileCount: dangerousTiles.length,
		averageDanger: tiles.reduce((sum, t) => sum + t.danger, 0) / tiles.length,
		recommendation: dangerousTiles.length > safeTiles.length ? 
			"Consider defensive play" : "Relatively safe to push"
	};
}

//Sort out unsafe tiles for educational display
function sortOutUnsafeTiles(tiles) {
	var safeTiles = [];
	var dangerousTiles = [];
	
	for (let tile of tiles) {
		if (shouldFold(tile)) {
			dangerousTiles.push(tile);
		} else {
			safeTiles.push(tile);
		}
	}
	
	// Sort by priority within each category
	safeTiles.sort((a, b) => a.value - b.value);
	dangerousTiles.sort((a, b) => a.value - b.value);
	
	return safeTiles.concat(dangerousTiles);
}

//Get recommended discard tile for teaching
function getDiscardTile(tiles) {
	if (tiles.length == 0) {
		return null;
	}
	return tiles[0];
}

// ES Module exports for testing
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		determineStrategy,
		evaluateCall,
		getTilePriorities,
		getSingleTilePriority,
		generateTileExplanation,
		getHandValues,
		getEfficiency,
		calculateTilePriority,
		chiitoitsuPriorities,
		thirteenOrphansPriorities,
		canDoThirteenOrphans,
		getMissingTilesForThirteenOrphans,
		analyzeDiscardRecommendation,
		generateDiscardAnalysis,
		getSafetyAnalysis,
		sortOutUnsafeTiles,
		getDiscardTile
	};
}