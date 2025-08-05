import { describe, test, expect } from "bun:test";

// This test verifies basic parameter structure and functionality
// Parameters.js contains configuration constants for the educational Mahjong analyzer

describe("Parameters configuration validation", () => {
    test("Performance mode constants should exist", () => {
        // Test that we can read the parameters file without syntax errors
        const fs = require('fs');
        const path = require('path');
        const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
        
        expect(parametersCode).toContain('PERFORMANCE_MODE');
        expect(parametersCode).toContain('EFFICIENCY');
        expect(parametersCode).toContain('SAFETY');
    });

    test("Strategy constants should be defined", () => {
        const fs = require('fs');
        const path = require('path');
        const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
        
        expect(parametersCode).toContain('STRATEGIES');
        expect(parametersCode).toContain('GENERAL');
        expect(parametersCode).toContain('CHIITOITSU');
        expect(parametersCode).toContain('THIRTEEN_ORPHANS');
    });

    test("Tile emoji definitions should exist", () => {
        const fs = require('fs');
        const path = require('path');
        const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
        
        expect(parametersCode).toContain('tileEmojiList');
        expect(parametersCode).toContain('🀙'); // Pin tiles
        expect(parametersCode).toContain('🀇'); // Man tiles
        expect(parametersCode).toContain('🀐'); // Sou tiles
        expect(parametersCode).toContain('🀀'); // Honor tiles
    });

    test("Educational configuration should be present", () => {
        const fs = require('fs');
        const path = require('path');
        const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
        
        // Should contain configuration for analysis modes
        expect(parametersCode).toContain('AIMODE');
        expect(parametersCode).toContain('AUTO');
        expect(parametersCode).toContain('HELP');
        
        // Should contain strategy configuration
        expect(parametersCode).toContain('RIICHI');
        expect(parametersCode).toContain('CALL_PON_CHI');
        expect(parametersCode).toContain('CALL_KAN');
    });

    test("File should not contain syntax errors", () => {
        const fs = require('fs');
        const path = require('path');
        
        expect(() => {
            const parametersCode = fs.readFileSync(path.join(__dirname, '../src/parameters.js'), 'utf8');
            // Try to parse it as JavaScript to check for syntax errors
            new Function(parametersCode);
        }).not.toThrow();
    });
});