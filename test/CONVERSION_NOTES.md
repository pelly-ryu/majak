# CLI Test Conversion Notes

## Successfully Converted ✅

### Easy to Convert (Pure Logic Tests)
- **Efficiency Tests**: 17 cases - Basic tile efficiency calculations
- **Defense Tests**: 10 cases - Folding/pushing decisions (partial)
- **Dora Tests**: 5 cases - Dora value considerations
- **Example Tests**: 7 cases - Simple reference scenarios

These tests only require:
- Setting up `ownHand`, `dora`, `discards` arrays
- Calling AI decision functions
- Comparing expected vs actual tile discards

## Difficult to Convert ⚠️

### 1. Call Tests (7 cases)
**Problem**: Require `async callTriple()` API simulation
```javascript
// Original code:
var callResult = await callTriple(["6p|7p"], 0);
if (callResult) { //Should decline
    expected = ["0z"];
}
```
**Solution needed**: Mock the callTriple function to return predetermined results

### 2. Issue Tests (5 cases) 
**Problem**: Use `readDebugString()` for complex game state
```javascript
// Original code:
readDebugString("6z|1m33p406777s77z|576m||231m|999s|93p261z1s|8s2z91s2p|1s9p51z2p|35z1m94p|0,0,0,0|1|1|48");
```
**Solution needed**: Parse debug strings and set up complete game state

### 3. Yaku Tests (19 cases) - Partially Complex
**Problem**: Some tests modify global parameters mid-execution
```javascript
// Original code:
isClosed = false;
calls = [[{index: 1, type: 1, dora: false, doraValue: 0}, ...]];
discards = [[], [{index: 8, type: 0, dora: false, doraValue: 0}], ...];
```
**Solution**: Most are convertible, but require careful state management

### 4. Strategy Tests (4 cases) - Mixed Difficulty
**Problem**: Mix of simple and complex test scenarios
- Cases 1-2: Simple (Chiitoitsu, Thirteen Orphans)
- Cases 3-4: Complex (require opponent hand simulation)

### 5. Waits Tests (6 cases) - Complex
**Problem**: Require furiten detection and complex game state
```javascript
// Original code:
readDebugString("6z|1m33p406777s77z|576m||231m|999s|93p261z1s|...");
discards = [[{index: 2, type: 1, dora: false, doraValue: 0}], [], [], []];
```

## Conversion Strategy

### Phase 1: Immediate (Completed)
- Basic test runner infrastructure ✅
- Simple test categories (Efficiency, basic Defense, Dora, Example) ✅
- CLI argument parsing and test selection ✅

### Phase 2: Medium Complexity
1. **Mock API Functions**: Create stub implementations for browser-dependent calls
2. **Complete Yaku Tests**: Add remaining yaku test cases
3. **Enhanced Defense Tests**: Add complex folding scenarios

### Phase 3: High Complexity  
1. **Debug String Parser**: Implement full `readDebugString()` functionality
2. **Call API Simulation**: Mock `callTriple()` and related functions
3. **Complete Strategy/Waits Tests**: Full game state simulation

## Implementation Progress

### Current Status: ~40% Complete
- ✅ Test runner framework
- ✅ CLI interface 
- ✅ Basic test categories (35/75 total test cases)
- ⚠️  Complex tests marked for future implementation

### Files Created
- `test/cli-test-runner.js` - Main CLI test runner
- `test/CONVERSION_NOTES.md` - This documentation

### Usage Examples
```bash
# Run all converted tests
bun test/cli-test-runner.js

# Run specific category
bun test/cli-test-runner.js -c Efficiency

# Run specific test case
bun test/cli-test-runner.js -c Defense -n 3

# List available tests
bun test/cli-test-runner.js --list

# Show difficult-to-convert tests
bun test/cli-test-runner.js --difficult
```

## Next Steps for Full Conversion

1. **Create Mock APIs**: Implement stubs for `callTriple()`, `readDebugString()`
2. **Add Remaining Test Cases**: Systematically convert each category
3. **Game State Management**: Better isolation between test runs
4. **Error Handling**: Improve error reporting for failed tests
5. **Performance**: Optimize test execution speed

The current implementation provides a solid foundation and covers the most important basic functionality tests.