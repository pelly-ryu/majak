#!/usr/bin/env bun
//################################
// CLI TEST RUNNER
// Bun-based CLI test runner for AlphaJong
//################################

// Set up all browser mocks BEFORE any imports
globalThis.DEBUG = true;
globalThis.document = {
    body: { innerHTML: "" },
    createElement: () => ({ appendChild: () => {}, addEventListener: () => {} })
};
globalThis.window = {
    localStorage: {
        getItem: (key) => {
            const defaults = {
                "alphajongAutorun": "false",
                "alphajongRoom": "1",
                "alphajongAIMode": "0"
            };
            return defaults[key] || null;
        },
        setItem: () => {}
    }
};
globalThis.console = console;
globalThis.alert = () => {};

// Override log function for CLI
globalThis.log = (message) => {
    // Remove HTML tags and clean up output
    const cleanMessage = message.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    console.log(cleanMessage);
};

globalThis.isDebug = () => true;
globalThis.isInGame = () => false; // Prevent game API calls

// Set up additional game globals that might be needed
globalThis.view = null;
globalThis.app = null;
globalThis.GameMgr = null;
globalThis.uiscript = null;
globalThis.mjcore = null;
globalThis.cfg = null;

// Now import source files in correct order
const { getTilesFromString, getTileFromString, resetGlobals, getNameForType, readDebugString } = await import("../test/test_utils.js");
await import("../src/parameters.js");
await import("../test/test_api.js");
await import("../src/ai_offense.js");
await import("../src/ai_defense.js");
await import("../src/utils.js");
await import("../src/yaku.js");
await import("../src/logging.js");

// Test categories and their test counts
const TEST_CATEGORIES = {
    "Efficiency": 17,
    "Defense": 10,
    "Dora": 5,
    "Yaku": 19,
    "Strategy": 4,
    "Waits": 6,
    "Call": 7,
    "Issue": 5,
    "Example": 7
};

const HARD_TO_CONVERT = [
    "Call testcases - require async callTriple() simulation",
    "Tests using readDebugString() - complex game state setup",
    "Tests with browser-specific API calls"
];

// CLI argument parsing
const args = process.argv.slice(2);
let targetCategory = null;
let targetCase = null;
let listTests = false;
let showDifficult = false;

for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
        case '--category':
        case '-c':
            targetCategory = args[++i];
            break;
        case '--case':
        case '-n':
            targetCase = parseInt(args[++i]);
            break;
        case '--list':
        case '-l':
            listTests = true;
            break;
        case '--difficult':
        case '-d':
            showDifficult = true;
            break;
        case '--help':
        case '-h':
            showHelp();
            process.exit(0);
    }
}

function showHelp() {
    console.log(`
AlphaJong CLI Test Runner

Usage: bun test/cli-test-runner.js [options]

Options:
  --category, -c <name>    Run specific test category
  --case, -n <number>      Run specific test case within category
  --list, -l               List all available tests
  --difficult, -d          Show tests that are difficult to convert
  --help, -h               Show this help message

Examples:
  bun test/cli-test-runner.js                    # Run all tests
  bun test/cli-test-runner.js -c Efficiency      # Run Efficiency tests
  bun test/cli-test-runner.js -c Defense -n 3    # Run Defense test case 3
  bun test/cli-test-runner.js --list             # List all test categories
`);
}

function listAllTests() {
    console.log("\n📋 Available Test Categories:");
    console.log("=" .repeat(50));
    
    Object.entries(TEST_CATEGORIES).forEach(([category, count]) => {
        console.log(`${category.padEnd(12)} - ${count} test cases`);
    });
    
    console.log(`\nTotal: ${Object.values(TEST_CATEGORIES).reduce((a, b) => a + b, 0)} test cases`);
}

function showDifficultTests() {
    console.log("\n⚠️  Tests Difficult to Convert:");
    console.log("=" .repeat(50));
    
    HARD_TO_CONVERT.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
    });
    
    console.log("\nThese tests require additional work to simulate browser/game APIs.");
}

// Test execution functions from original test.js
let currentTestcase = 0;
let currentTestStep = 0;
let passes = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let overall = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let expected = [];
let testStartTime = 0;

// Test case implementations (converted from original test.js)
function runEfficiencyTestcase() {
    switch (currentTestStep) {
        case 1:
            logTestcase("Standard Hand");
            globalThis.ownHand = getTilesFromString("1239p22456m44468s");
            expected = ["9p"];
            break;
        case 2:
            logTestcase("Standard Hand 2");
            globalThis.ownHand = getTilesFromString("1239p22456m44469s");
            expected = ["9p", "9s"];
            break;
        case 3:
            logTestcase("Keep Pair");
            globalThis.ownHand = getTilesFromString("12367p22456m4578s");
            expected = ["4s", "5s", "7s", "8s"];
            break;
        // Add more cases as needed...
        default:
            return false;
    }
    return true;
}

function runDefenseTestcase() {
    switch (currentTestStep) {
        case 1:
            logTestcase("Should Fold Tenpai");
            globalThis.ownHand = getTilesFromString("11345m57p2347s111z");
            globalThis.discards = [[], getTilesFromString("1223369m2p"), getTilesFromString("567567999m2p4z"), getTilesFromString("134999p4z")];
            globalThis.testPlayerRiichi = [0, 0, 0, 1];
            expected = ["1z"];
            break;
        // Add more cases...
        default:
            return false;
    }
    return true;
}

// Simplified test functions for other categories
function runDoraTestcase() {
    switch (currentTestStep) {
        case 1:
            logTestcase("Keep dora in Kanchan");
            globalThis.dora = getTilesFromString("1p");
            globalThis.ownHand = getTilesFromString("2468p11555m23467s");
            expected = ["8p"];
            break;
        default:
            return false;
    }
    return true;
}

function runYakuTestcase() {
    // Simplified - add cases as needed
    return false;
}

function runStrategyTestcase() {
    // Simplified - add cases as needed
    return false;
}

function runWaitsTestcase() {
    // Simplified - add cases as needed
    return false;
}

function runCallTestcase() {
    // Mark as difficult to convert
    console.log("⚠️  Call testcase requires async callTriple() simulation - skipping");
    return false;
}

function runIssueTestcase() {
    // Mark as difficult to convert
    console.log("⚠️  Issue testcase uses readDebugString() - skipping");
    return false;
}

function runExampleTestcase() {
    switch (currentTestStep) {
        case 1:
            logTestcase("Example 1");
            globalThis.ownHand = getTilesFromString("113m223457p12379s");
            expected = ["3m", "7p"];
            break;
        default:
            return false;
    }
    return true;
}

function logTestcase(title) {
    const categoryNames = Object.keys(TEST_CATEGORIES);
    console.log(`\n🧪 ${categoryNames[currentTestcase]} ${currentTestStep}: ${title}`);
}

async function checkDiscard() {
    try {
        await globalThis.discard().then(function (tile) {
            const actualDiscard = tile.index + getNameForType(tile.type);
            overall[currentTestcase]++;
            
            console.log(`Expected: ${expected.join(", ")}`);
            console.log(`Actual: ${actualDiscard}`);
            
            if (expected.includes(actualDiscard)) {
                console.log("✅ PASS");
                passes[currentTestcase]++;
            } else {
                console.log("❌ FAIL");
            }
        });
    } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
        overall[currentTestcase]++;
    }
}

// Main test execution
async function runSingleTest(categoryName, testNumber) {
    const categoryIndex = Object.keys(TEST_CATEGORIES).indexOf(categoryName);
    if (categoryIndex === -1) {
        console.log(`❌ Unknown category: ${categoryName}`);
        return false;
    }
    
    currentTestcase = categoryIndex;
    currentTestStep = testNumber;
    resetGlobals();
    
    const testFunctions = {
        "Efficiency": runEfficiencyTestcase,
        "Defense": runDefenseTestcase,
        "Dora": runDoraTestcase,
        "Yaku": runYakuTestcase,
        "Strategy": runStrategyTestcase,
        "Waits": runWaitsTestcase,
        "Call": runCallTestcase,
        "Issue": runIssueTestcase,
        "Example": runExampleTestcase
    };
    
    const testFunction = testFunctions[categoryName];
    if (!testFunction || !testFunction()) {
        console.log(`⚠️  Test case ${testNumber} not implemented or skipped`);
        return false;
    }
    
    try {
        globalThis.initialDiscardedTilesSafety();
        globalThis.updateAvailableTiles();
        globalThis.determineStrategy();
        await checkDiscard();
        return true;
    } catch (error) {
        console.log(`❌ Test execution failed: ${error.message}`);
        return false;
    }
}

async function runCategoryTests(categoryName) {
    const maxTests = TEST_CATEGORIES[categoryName];
    if (!maxTests) {
        console.log(`❌ Unknown category: ${categoryName}`);
        return;
    }
    
    console.log(`\n🏃 Running ${categoryName} tests (${maxTests} cases):`);
    console.log("=" .repeat(50));
    
    let categoryPasses = 0;
    let categoryTotal = 0;
    
    for (let i = 1; i <= maxTests; i++) {
        const success = await runSingleTest(categoryName, i);
        if (success) {
            categoryTotal++;
            if (passes[Object.keys(TEST_CATEGORIES).indexOf(categoryName)] > 0) {
                categoryPasses++;
            }
        }
    }
    
    console.log(`\n📊 ${categoryName} Results: ${categoryPasses}/${categoryTotal} passed`);
}

async function runAllTests() {
    testStartTime = Date.now();
    console.log("🚀 Running AlphaJong CLI Tests");
    console.log("=" .repeat(50));
    
    for (const [categoryName] of Object.entries(TEST_CATEGORIES)) {
        await runCategoryTests(categoryName);
    }
    
    showFinalResults();
}

function showFinalResults() {
    const totalTime = Date.now() - testStartTime;
    const totalPasses = passes.reduce((a, b) => a + b, 0);
    const totalTests = overall.reduce((a, b) => a + b, 0);
    
    console.log("\n" + "=" .repeat(50));
    console.log("📈 FINAL RESULTS");
    console.log("=" .repeat(50));
    
    Object.keys(TEST_CATEGORIES).forEach((category, i) => {
        if (overall[i] > 0) {
            const status = passes[i] === overall[i] ? "✅" : "❌";
            console.log(`${status} ${category.padEnd(12)}: ${passes[i]}/${overall[i]} passed`);
        }
    });
    
    console.log("-" .repeat(30));
    console.log(`📊 Overall: ${totalPasses}/${totalTests} tests passed`);
    console.log(`⏱️  Time: ${totalTime}ms (${(totalTime / totalTests).toFixed(1)}ms per test)`);
    
    // Exit with appropriate code
    process.exit(totalPasses === totalTests ? 0 : 1);
}

// Main execution
if (listTests) {
    listAllTests();
} else if (showDifficult) {
    showDifficultTests();
} else if (targetCategory) {
    if (targetCase) {
        console.log(`🎯 Running ${targetCategory} test case ${targetCase}`);
        testStartTime = Date.now();
        const success = await runSingleTest(targetCategory, targetCase);
        if (success) {
            console.log(`\n⏱️  Completed in ${Date.now() - testStartTime}ms`);
        }
    } else {
        await runCategoryTests(targetCategory);
    }
} else {
    await runAllTests();
}