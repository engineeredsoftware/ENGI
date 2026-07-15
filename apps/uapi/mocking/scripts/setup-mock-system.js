#!/usr/bin/env node

/**
 * Bitcode Mock System - Easy Setup Script
 * 
 * This script automatically sets up the comprehensive mock system for your Bitcode commercial surface.
 * Run this script to get started with mocking in seconds!
 * 
 * Usage:
 *   node scripts/setup-mock-system.js [scenario]
 * 
 * Examples:
 *   node scripts/setup-mock-system.js              # Demo mode (default)
 *   node scripts/setup-mock-system.js demo         # Rich demo data
 *   node scripts/setup-mock-system.js enterprise   # Enterprise-scale data
 *   node scripts/setup-mock-system.js testing      # Minimal test data
 *   node scripts/setup-mock-system.js onboarding   # New user experience
 */

const fs = require('fs');
const path = require('path');

// Configuration options
const SCENARIOS = {
  demo: {
    name: 'Demo Mode',
    description: 'Rich, engaging demo data perfect for showcasing Bitcode capabilities',
    complexity: 'complex',
    timing: 'realistic'
  },
  enterprise: {
    name: 'Enterprise Scale',
    description: 'Large-scale data representing enterprise usage patterns',
    complexity: 'enterprise', 
    timing: 'realistic'
  },
  testing: {
    name: 'Testing Mode',
    description: 'Minimal, predictable data perfect for automated testing',
    complexity: 'minimal',
    timing: 'fast'
  },
  onboarding: {
    name: 'Onboarding Experience',
    description: 'Optimized for new user onboarding flows',
    complexity: 'moderate',
    timing: 'realistic'
  },
  empty: {
    name: 'Empty States',
    description: 'Empty data for testing zero-state experiences',
    complexity: 'minimal',
    timing: 'fast'
  }
};

function main() {
  console.log('🚀 Bitcode Mock System Setup\n');
  
  // Get scenario from command line args
  const scenario = process.argv[2] || 'demo';
  
  if (!SCENARIOS[scenario]) {
    console.error(`❌ Invalid scenario: ${scenario}`);
    console.log('\nAvailable scenarios:');
    Object.entries(SCENARIOS).forEach(([key, config]) => {
      console.log(`  ${key.padEnd(12)} - ${config.description}`);
    });
    process.exit(1);
  }
  
  const config = SCENARIOS[scenario];
  console.log(`📋 Setting up: ${config.name}`);
  console.log(`📝 Description: ${config.description}\n`);
  
  // Setup environment file
  setupEnvironmentFile(scenario, config);
  
  // Create documentation
  createQuickStartGuide(scenario, config);
  
  // Display next steps
  displayNextSteps(scenario);
}

function setupEnvironmentFile(scenario, config) {
  console.log('⚙️  Configuring environment variables...');
  
  const envPath = path.join(process.cwd(), '.env.local');
  const envBackupPath = path.join(process.cwd(), '.env.local.backup');
  
  // Backup existing .env.local if it exists
  if (fs.existsSync(envPath)) {
    console.log('💾 Backing up existing .env.local to .env.local.backup');
    fs.copyFileSync(envPath, envBackupPath);
  }
  
  // Read existing .env.local or create new
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Remove existing mock configuration
  envContent = envContent.replace(/^NEXT_PUBLIC_MOCK.*$/gm, '');
  envContent = envContent.replace(/^\s*\n/gm, ''); // Remove empty lines
  
  // Add mock configuration
  const mockConfig = `
# ============================================================================
# BITCODE MOCK SYSTEM - ${config.name.toUpperCase()}
# Generated on ${new Date().toISOString()}
# ============================================================================

# Master mock control - Enable/disable entire mock system
NEXT_PUBLIC_MASTER_MOCK_MODE=true

# Scenario configuration
NEXT_PUBLIC_MOCK_SCENARIO=${scenario}
NEXT_PUBLIC_MOCK_COMPLEXITY=${config.complexity}
NEXT_PUBLIC_MOCK_TIMING=${config.timing}

# Debug and performance monitoring
NEXT_PUBLIC_MOCK_DEBUG=true
NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING=true

# Cache configuration (optimized for ${scenario})
NEXT_PUBLIC_MOCK_CACHE_ENABLED=true
NEXT_PUBLIC_MOCK_CACHE_TTL_SECONDS=${scenario === 'testing' ? '60' : '300'}
NEXT_PUBLIC_MOCK_CACHE_MAX_SIZE_MB=${scenario === 'enterprise' ? '200' : '100'}

# Error injection (disabled for demo/production scenarios)
NEXT_PUBLIC_MOCK_ERROR_INJECTION=${scenario === 'testing' ? 'true' : 'false'}
NEXT_PUBLIC_MOCK_ERROR_PROBABILITY=0.01

# Validation and system health
NEXT_PUBLIC_MOCK_VALIDATION_ENABLED=true

# Feature-specific overrides (examples - uncomment to customize)
# NEXT_PUBLIC_MOCK_ASSET_PACKS=true
# NEXT_PUBLIC_MOCK_ASSET_PACKS_SCENARIO=enterprise
# NEXT_PUBLIC_MOCK_CONVERSATION_CONVERSATIONS=true
# NEXT_PUBLIC_MOCK_GITHUB_REPOS=false

# ============================================================================
# END BITCODE MOCK SYSTEM CONFIGURATION
# ============================================================================
`;
  
  // Write updated .env.local
  envContent = envContent.trim() + mockConfig;
  fs.writeFileSync(envPath, envContent);
  
  console.log(`✅ Environment configured for ${config.name}`);
  console.log(`📄 Configuration written to .env.local`);
  if (fs.existsSync(envBackupPath)) {
    console.log(`🔄 Backup saved to .env.local.backup`);
  }
}

function createQuickStartGuide(scenario, config) {
  console.log('\n📚 Creating quick start guide...');
  
  const guidePath = path.join(process.cwd(), 'mocking', `QUICK_START_${scenario.toUpperCase()}.md`);
  
  const guideContent = `# Quick Start Guide - ${config.name}

## 🎯 You're all set up for ${config.name}!

**Scenario:** ${scenario}  
**Description:** ${config.description}  
**Complexity:** ${config.complexity}  
**Timing:** ${config.timing}  

## 🚀 How to Use

### 1. Start Your Development Server
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

### 2. Visit Any Page - Mocking is Now Active!
- **AssetPacks:** Rich ${scenario} data automatically loads
- **Conversations Chat:** Realistic conversation history
- **User Profile:** Complete user data with BTD holdings and BTC fee-readiness, etc.
- **GitHub Integration:** Full repository, branch, and commit data
- **Organizations:** Team and member management data

### 3. See It in Action
Visit these pages to see mocking in action:
- \`/assetPacks\` - Main pipeline experience
- \`/chat\` - Conversations chat interface  
- \`/profile\` - User profile and settings
- \`/organizations\` - Team management
- \`/marketplace\` - Business features

## 🎛️ Customization

### Change Scenarios
\`\`\`bash
# Switch to enterprise mode
NEXT_PUBLIC_MOCK_SCENARIO=enterprise

# Switch to testing mode  
NEXT_PUBLIC_MOCK_SCENARIO=testing
\`\`\`

### Enable/Disable Specific Features
\`\`\`bash
# Disable GitHub mocking (use real data)
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false

# Enable only assetPacks mocking
NEXT_PUBLIC_MOCK_ASSET_PACKS=true
NEXT_PUBLIC_MOCK_CONVERSATION_CONVERSATIONS=false
\`\`\`

### Disable All Mocking
\`\`\`bash
NEXT_PUBLIC_MASTER_MOCK_MODE=false
\`\`\`

## 🔧 Debug Tools

Open browser console and use:
\`\`\`javascript
// Check system status
__bitcodeMockSystem.getMetrics()

// Switch scenarios on the fly
__bitcodeMockSystem.switchScenario('enterprise')

// Validate system health
__bitcodeMockSystem.validateSystem()

// Clear cache
__bitcodeMockSystem.clearCache()
\`\`\`

## 📊 What's Mocked in ${config.name}

${getScenarioFeatures(scenario)}

## 🆘 Read Help?

- **Documentation:** \`/mocking/README.md\`
- **Integration Guide:** \`/mocking/INTEGRATION_GUIDE.md\`
- **System Summary:** \`/mocking/COMPREHENSIVE_SYSTEM_SUMMARY.md\`

## 🔄 Switch Scenarios

Run the setup script again with a different scenario:
\`\`\`bash
node scripts/setup-mock-system.js enterprise
node scripts/setup-mock-system.js testing
node scripts/setup-mock-system.js onboarding
\`\`\`

---
*Generated on ${new Date().toISOString()} by Bitcode Mock System Setup*
`;

  fs.writeFileSync(guidePath, guideContent);
  console.log(`✅ Quick start guide created: ${guidePath}`);
}

function getScenarioFeatures(scenario) {
  const features = {
    demo: `
### Rich Demo Experience
- **User Data:** Complete profiles with realistic usage history
- **AssetPacks:** 5-10 completed runs with complex outputs
- **Conversations:** Active conversations with AI responses
- **GitHub:** Multiple repos with branches, commits, issues
- **Organizations:** Teams with multiple members and roles
- **Marketplace:** Featured listings and order history
- **BTD holdings:** Realistic BTD holding and settlement history`,

    enterprise: `
### Enterprise-Scale Data
- **User Data:** Large organizations with many team members
- **AssetPacks:** 50+ runs across multiple repositories
- **Conversations:** Extensive conversation histories
- **GitHub:** 100+ repositories with full branch/commit data
- **Organizations:** Complex team structures and permissions
- **Marketplace:** Full catalog with order management
- **BTD holdings:** Enterprise BTD holding and BTC fee-readiness analytics`,

    testing: `
### Minimal Test Data
- **User Data:** Single user with basic profile
- **AssetPacks:** 1-3 simple runs with predictable outputs
- **Conversations:** Basic conversation structure
- **GitHub:** Minimal repo data for consistent testing
- **Organizations:** Single organization setup
- **Marketplace:** Basic listing structure
- **BTD holdings:** Simple BTD holding state and settlement rows`,

    onboarding: `
### New User Experience
- **User Data:** Fresh user profile ready for onboarding
- **AssetPacks:** Empty state with tutorial prompts
- **Conversations:** Welcome conversation and guidance
- **GitHub:** Repository connection prompts
- **Organizations:** Team invitation workflows
- **Marketplace:** Discovery and browsing experience
- **BTD holdings:** Initial BTD acquisition and Terminal minting previews`,

    empty: `
### Empty State Testing
- **User Data:** Minimal user with no activity
- **AssetPacks:** Empty run history
- **Conversations:** No conversations
- **GitHub:** No connected repositories
- **Organizations:** No team memberships
- **Marketplace:** Empty catalog views
- **BTD holdings:** Zero holdings and empty settlement history`
  };

  return features[scenario] || features.demo;
}

function displayNextSteps(scenario) {
  console.log(`\n🎉 Setup Complete! Your Bitcode commercial surface is now running in ${SCENARIOS[scenario].name}.`);
  console.log('\n📋 Next Steps:');
  console.log('1. Start your development server: npm run dev');
  console.log('2. Open your browser and navigate to any Bitcode page');
  console.log('3. See rich, realistic mock data automatically!');
  console.log(`4. Check the quick start guide: mocking/QUICK_START_${scenario.toUpperCase()}.md`);
  
  console.log('\n🔧 Debug Tips:');
  console.log('- Open browser console for debug tools: __bitcodeMockSystem');
  console.log('- Watch for mock system logs in console');
  console.log('- Check response headers for mock indicators');
  
  console.log('\n🎛️ Customize Further:');
  console.log('- Edit .env.local to adjust configuration');
  console.log('- Run this script again with different scenarios');
  console.log('- See INTEGRATION_GUIDE.md for API route integration');
  
  console.log('\n🚀 Happy mocking!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, SCENARIOS };
