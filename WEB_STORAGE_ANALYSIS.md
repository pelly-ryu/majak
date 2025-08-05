# Web Storage Analysis - AlphaJong

## Overview
Analysis of web storage usage in the AlphaJong educational Mahjong AI project.

## Current Web Storage Usage

### Location: `src/parameters.js` (Lines 85-92)

The project uses **localStorage** to store 3 configuration values:

```javascript
//LOCAL STORAGE
var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
var ROOM = window.localStorage.getItem("alphajongRoom");
var MODE = window.localStorage.getItem("alphajongAIMode");

ROOM = ROOM == null ? 2 : ROOM
MODE = MODE == null ? AIMODE.AUTO : parseInt(MODE);
```

## Storage Items Detailed Analysis

### 1. `alphajongAutorun` (Boolean)
- **Purpose**: Stored bot auto-start preference (LEGACY - from bot days)
- **Values**: `"true"` or `"false"` (stored as string)
- **Default**: `false` when null
- **Current Status**: ⚠️ **OBSOLETE** - No longer relevant since bot functionality removed
- **Recommendation**: **REMOVE** - Part of removed bot functionality

### 2. `alphajongRoom` (Number)
- **Purpose**: Stored preferred Mahjong Soul room/rank for bot (LEGACY - from bot days)
- **Values**: Numeric room ID (stored as string)
- **Default**: `2` when null
- **Current Status**: ⚠️ **OBSOLETE** - No longer relevant since bot functionality removed
- **Recommendation**: **REMOVE** - Part of removed bot functionality

### 3. `alphajongAIMode` (Number)
- **Purpose**: Stored AI mode preference (Auto vs Help mode for bot)
- **Values**: 
  - `0` = `AIMODE.AUTO` (Automatic bot play)
  - `1` = `AIMODE.HELP` (Show recommendations only)
- **Default**: `AIMODE.AUTO` (0) when null
- **Current Status**: ⚠️ **POTENTIALLY OBSOLETE** - Originally for bot modes
- **Recommendation**: **EVALUATE** - Could be repurposed for educational modes

## Educational Repurposing Opportunities

Since this is now an educational tool, the storage could be repurposed for:

### Potential Educational Settings
1. **Learning Mode**: 
   - Beginner, Intermediate, Advanced analysis depth
   - Replace `alphajongAIMode`

2. **User Preferences**:
   - Preferred explanation verbosity
   - Show/hide advanced strategy concepts
   - Display preferences (tiles vs emoji)

3. **Learning Progress**:
   - Completed tutorial sections
   - Practice scenario progress
   - Performance tracking

## Test Mock Implementation

### Current Test Mocking
```javascript
// test/cli-test-runner.js
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

// test/parameters.test.js  
global.window = {
    localStorage: {
        getItem: (key) => null
    }
};
```

## Security & Privacy Assessment

### ✅ **Low Risk** - Current Usage:
- **No sensitive data**: Only stores user preferences
- **No personal information**: No user identification or tracking
- **Local only**: Data stays on user's device
- **Minimal scope**: Only 3 simple configuration values

### ✅ **Appropriate Use**:
- Legitimate user preference storage
- Educational tool configuration
- No tracking or analytics

## Recommendations

### Phase 1: Cleanup (Immediate)
1. **Remove obsolete bot storage**:
   ```javascript
   // Remove these lines from parameters.js:
   var AUTORUN = window.localStorage.getItem("alphajongAutorun") == "true";
   var ROOM = window.localStorage.getItem("alphajongRoom");
   ```

2. **Keep potentially useful**:
   ```javascript
   // Could be repurposed for educational modes:
   var MODE = window.localStorage.getItem("alphajongAIMode");
   ```

### Phase 2: Educational Enhancement (Future)
1. **Repurpose existing storage**:
   - `alphajongAIMode` → `alphajongLearningMode`
   - Values: 0=Beginner, 1=Intermediate, 2=Advanced

2. **Add educational settings**:
   ```javascript
   var LEARNING_MODE = window.localStorage.getItem("alphajongLearningMode") || "0";
   var SHOW_EXPLANATIONS = window.localStorage.getItem("alphajongShowExplanations") == "true";
   var TUTORIAL_PROGRESS = JSON.parse(window.localStorage.getItem("alphajongTutorialProgress") || "{}");
   ```

### Phase 3: Enhanced Features (Optional)
1. **Learning analytics**:
   - Practice session statistics
   - Improvement tracking
   - Scenario completion rates

2. **Customization**:
   - Tile display preferences
   - Analysis detail level
   - Explanation language/style

## Privacy Compliance

✅ **GDPR/Privacy Compliant**:
- No personal data collection
- Local storage only (no server transmission)  
- User controls own data
- Educational purpose only
- No tracking or profiling

## Summary

Current web storage usage is **minimal and legacy-focused**. Most storage items are obsolete remnants from the bot functionality and should be removed. The remaining storage can be repurposed for legitimate educational preferences and learning progress tracking.

**Action Items**:
1. Remove `alphajongAutorun` and `alphajongRoom` (obsolete bot settings)
2. Consider repurposing `alphajongAIMode` for educational learning modes
3. Add educational-focused storage for user preferences and progress tracking
4. Update tests to reflect new storage model