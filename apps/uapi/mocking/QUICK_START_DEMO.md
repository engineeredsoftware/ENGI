# Quick Start Guide - Demo Mode

## 🎯 You're all set up for Demo Mode!

**Scenario:** demo  
**Description:** Rich, engaging demo data perfect for showcasing Bitcode capabilities  
**Complexity:** complex  
**Timing:** realistic  

## 🚀 How to Use

### 1. Start Your Development Server
```bash
npm run dev
# or
yarn dev
```

### 2. Visit Any Page - Mocking is Now Active!
- **AssetPacks:** Rich demo data automatically loads
- **Conversations Chat:** Realistic conversation history
- **User Profile:** Complete user data with `$BTD`, usage, etc.
- **GitHub Integration:** Full repository, branch, and commit data
- **Organizations:** Team and member management data

### 3. See It in Action
Visit these pages to see mocking in action:
- `/assetPacks` - Main pipeline experience
- `/chat` - Conversations chat interface  
- `/profile` - User profile and settings
- `/organizations` - Team management
- `/marketplace` - Business features

## 🎛️ Customization

### Change Scenarios
```bash
# Switch to enterprise mode
NEXT_PUBLIC_MOCK_SCENARIO=enterprise

# Switch to testing mode  
NEXT_PUBLIC_MOCK_SCENARIO=testing
```

### Enable/Disable Specific Features
```bash
# Disable GitHub mocking (use real data)
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false

# Enable only assetPacks mocking
NEXT_PUBLIC_MOCK_ASSET_PACKS=true
NEXT_PUBLIC_MOCK_CONVERSATION_CONVERSATIONS=false
```

### Disable All Mocking
```bash
NEXT_PUBLIC_MASTER_MOCK_MODE=false
```

## 🔧 Debug Tools

Open browser console and use:
```javascript
// Check system status
__bitcodeMockSystem.getMetrics()

// Switch scenarios on the fly
__bitcodeMockSystem.switchScenario('enterprise')

// Validate system health
__bitcodeMockSystem.validateSystem()

// Clear cache
__bitcodeMockSystem.clearCache()
```

## 📊 What's Mocked in Demo Mode


### Rich Demo Experience
- **User Data:** Complete profiles with realistic usage history
- **AssetPacks:** 5-10 completed runs with complex outputs
- **Conversations:** Active conversations with AI responses
- **GitHub:** Multiple repos with branches, commits, issues
- **Organizations:** Teams with multiple members and roles
- **Marketplace:** Featured listings and order history
- **BTD holdings:** Realistic BTD holding and settlement history

## 🆘 Read Help?

- **Documentation:** `/mocking/README.md`
- **Integration Guide:** `/mocking/INTEGRATION_GUIDE.md`
- **System Summary:** `/mocking/COMPREHENSIVE_SYSTEM_SUMMARY.md`

## 🔄 Switch Scenarios

Run the setup script again with a different scenario:
```bash
node scripts/setup-mock-system.js enterprise
node scripts/setup-mock-system.js testing
node scripts/setup-mock-system.js onboarding
```

---
*Generated on 2025-07-04T05:21:36.838Z by Bitcode Mock System Setup*
