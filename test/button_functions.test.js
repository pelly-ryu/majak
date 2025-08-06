// Unit tests for button functions
// Run with: bun test test/button_functions.test.js

const { 
    extractPaipuDataPure,
    analyzeUrlPure,
    getSampleUrl,
    getDefaultExamplePosition,
    validateDebugString,
    parsePlayerMove,
    getTeachingScenarios,
    getScenario,
    createTileSelectorData,
    addTileToHandPure,
    clearHandPure,
    generateDebugStringFromHand,
    createUIState,
    toggleScenarios,
    toggleHandBuilder,
    updateBuiltHand,
    formatUrlAnalysisResult
} = require('../src/button_functions.js');

// URL parsing tests
describe('URL parsing functions', () => {
    test('extractPaipuDataPure should extract valid replay data', () => {
        const url = 'https://mahjongsoul.game.yo-star.com/?paipu=250804-70f742aa-e642-478a-bb72-6d2453cae2fb_a922337773';
        const result = extractPaipuDataPure(url);
        
        expect(result).toBeTruthy();
        expect(result.gameDate).toBe('2025-08-04');
        expect(result.gameId).toBe('250804-70f742aa-e642-478a-bb72-6d2453cae2fb');
        expect(result.playerId).toBe('a922337773');
        expect(result.isReplay).toBe(true);
    });

    test('extractPaipuDataPure should return null for invalid URLs', () => {
        expect(extractPaipuDataPure('')).toBeNull();
        expect(extractPaipuDataPure(null)).toBeNull();
        expect(extractPaipuDataPure('invalid-url')).toBeNull();
        expect(extractPaipuDataPure('https://example.com')).toBeNull();
    });

    test('analyzeUrlPure should identify replay URLs', () => {
        const url = 'https://mahjongsoul.game.yo-star.com/?paipu=250804-70f742aa-e642-478a-bb72-6d2453cae2fb_a922337773';
        const result = analyzeUrlPure(url);
        
        expect(result.success).toBe(true);
        expect(result.type).toBe('replay');
        expect(result.data.gameDate).toBe('2025-08-04');
    });

    test('analyzeUrlPure should identify non-replay Mahjong Soul URLs', () => {
        const url = 'https://mahjongsoul.game.yo-star.com/game';
        const result = analyzeUrlPure(url);
        
        expect(result.success).toBe(true);
        expect(result.type).toBe('mahjong_soul');
        expect(result.data.hostname).toContain('mahjongsoul');
    });

    test('analyzeUrlPure should handle empty/invalid URLs', () => {
        expect(analyzeUrlPure('')).toEqual({ error: 'Please enter a URL' });
        expect(analyzeUrlPure('invalid-url')).toEqual({ error: '❌ Invalid URL format' });
        expect(analyzeUrlPure('https://google.com')).toEqual({ error: '⚠️ Not a Mahjong Soul URL' });
    });

    test('getSampleUrl should return a valid sample URL', () => {
        const url = getSampleUrl();
        expect(url).toContain('mahjongsoul.game.yo-star.com');
        expect(url).toContain('paipu=');
    });
});

// Position validation tests
describe('Position validation functions', () => {
    test('getDefaultExamplePosition should return valid debug string', () => {
        const position = getDefaultExamplePosition();
        expect(typeof position).toBe('string');
        expect(position.split('|')).toHaveLength(14);
    });

    test('validateDebugString should validate correct format', () => {
        const validString = "1m|1239p22456m44468s|||||||||0,0,0,0|2|1|50";
        const result = validateDebugString(validString);
        expect(result.valid).toBe(true);
    });

    test('validateDebugString should reject invalid formats', () => {
        expect(validateDebugString('').valid).toBe(false);
        expect(validateDebugString(null).valid).toBe(false);
        expect(validateDebugString('short').valid).toBe(false);
        expect(validateDebugString('1m|2m|3m').valid).toBe(false); // too few parts
    });

    test('parsePlayerMove should validate tile formats', () => {
        expect(parsePlayerMove('9p').valid).toBe(true);
        expect(parsePlayerMove('1m').valid).toBe(true);
        expect(parsePlayerMove('7s').valid).toBe(true);
        expect(parsePlayerMove('4z').valid).toBe(true);

        expect(parsePlayerMove('').valid).toBe(false);
        expect(parsePlayerMove('10p').valid).toBe(false);
        expect(parsePlayerMove('0m').valid).toBe(false);
        expect(parsePlayerMove('8z').valid).toBe(false); // honors only go 1-7
        expect(parsePlayerMove('abc').valid).toBe(false);
    });
});

// Scenario management tests
describe('Scenario management functions', () => {
    test('getTeachingScenarios should return all scenarios', () => {
        const scenarios = getTeachingScenarios();
        expect(Object.keys(scenarios)).toContain('basic_efficiency');
        expect(Object.keys(scenarios)).toContain('safety_vs_speed');
        expect(Object.keys(scenarios)).toContain('thirteen_orphans');
        
        expect(scenarios.basic_efficiency.name).toBeTruthy();
        expect(scenarios.basic_efficiency.debugString).toBeTruthy();
        expect(scenarios.basic_efficiency.concept).toBeTruthy();
    });

    test('getScenario should return specific scenario', () => {
        const scenario = getScenario('basic_efficiency');
        expect(scenario).toBeTruthy();
        expect(scenario.name).toBe('Basic Efficiency');
        
        expect(getScenario('nonexistent')).toBeNull();
    });
});

// Hand builder tests
describe('Hand builder functions', () => {
    test('createTileSelectorData should return correct structure', () => {
        const data = createTileSelectorData();
        expect(data).toHaveLength(4); // man, pin, sou, honors
        
        expect(data[0].tiles).toEqual([1,2,3,4,5,6,7,8,9]);
        expect(data[3].tiles).toEqual([1,2,3,4,5,6,7]); // honors only 1-7
    });

    test('addTileToHandPure should add tiles correctly', () => {
        const emptyHand = [];
        const result = addTileToHandPure(emptyHand, 1, 5);
        
        expect(result.success).toBe(true);
        expect(result.hand).toHaveLength(1);
        expect(result.hand[0]).toEqual({type: 1, index: 5, dora: false});
    });

    test('addTileToHandPure should reject full hands', () => {
        const fullHand = Array(14).fill({type: 1, index: 1, dora: false});
        const result = addTileToHandPure(fullHand, 1, 5);
        
        expect(result.success).toBe(false);
        expect(result.error).toBe("Hand is full (14 tiles maximum)");
    });

    test('clearHandPure should return empty array', () => {
        expect(clearHandPure()).toEqual([]);
    });

    test('generateDebugStringFromHand should handle empty hands', () => {
        const result = generateDebugStringFromHand([]);
        expect(result.success).toBe(false);
        expect(result.error).toBe("Please add tiles to your hand first");
    });

    test('generateDebugStringFromHand should generate string for valid hand', () => {
        const hand = [
            {type: 1, index: 1, dora: false},
            {type: 0, index: 9, dora: false}
        ];
        const result = generateDebugStringFromHand(hand);
        expect(result.success).toBe(true);
        expect(result.debugString).toContain('|');
    });
});

// UI state management tests
describe('UI state management functions', () => {
    test('createUIState should return initial state', () => {
        const state = createUIState();
        expect(state.scenariosVisible).toBe(false);
        expect(state.handBuilderVisible).toBe(false);
        expect(state.builtHand).toEqual([]);
    });

    test('toggleScenarios should toggle scenarios visibility', () => {
        let state = createUIState();
        expect(state.scenariosVisible).toBe(false);
        
        state = toggleScenarios(state);
        expect(state.scenariosVisible).toBe(true);
        
        state = toggleScenarios(state);
        expect(state.scenariosVisible).toBe(false);
    });

    test('toggleHandBuilder should toggle hand builder visibility', () => {
        let state = createUIState();
        expect(state.handBuilderVisible).toBe(false);
        
        state = toggleHandBuilder(state);
        expect(state.handBuilderVisible).toBe(true);
        
        state = toggleHandBuilder(state);
        expect(state.handBuilderVisible).toBe(false);
    });

    test('updateBuiltHand should update hand state', () => {
        const state = createUIState();
        const newHand = [{type: 1, index: 1, dora: false}];
        
        const newState = updateBuiltHand(state, newHand);
        expect(newState.builtHand).toEqual(newHand);
        expect(newState.scenariosVisible).toBe(false); // other properties preserved
    });
});

// Result formatting tests
describe('Result formatting functions', () => {
    test('formatUrlAnalysisResult should format error results', () => {
        const errorResult = { error: 'Test error' };
        const formatted = formatUrlAnalysisResult(errorResult);
        
        expect(formatted.type).toBe('error');
        expect(formatted.html).toContain('Test error');
        expect(formatted.html).toContain('#f8d7da');
    });

    test('formatUrlAnalysisResult should format replay results', () => {
        const replayResult = {
            success: true,
            type: 'replay',
            data: {
                gameDate: '2025-08-04',
                playerId: 'test123',
                gameId: 'game123'
            }
        };
        const formatted = formatUrlAnalysisResult(replayResult);
        
        expect(formatted.type).toBe('success');
        expect(formatted.html).toContain('✅');
        expect(formatted.html).toContain('2025-08-04');
        expect(formatted.html).toContain('test123');
    });

    test('formatUrlAnalysisResult should format Mahjong Soul URL results', () => {
        const msResult = {
            success: true,
            type: 'mahjong_soul',
            data: {
                hostname: 'mahjongsoul.game.yo-star.com',
                pathname: '/game',
                message: 'Not a replay URL'
            }
        };
        const formatted = formatUrlAnalysisResult(msResult);
        
        expect(formatted.type).toBe('info');
        expect(formatted.html).toContain('ℹ️');
        expect(formatted.html).toContain('mahjongsoul.game.yo-star.com');
        expect(formatted.html).toContain('Not a replay URL');
    });
});