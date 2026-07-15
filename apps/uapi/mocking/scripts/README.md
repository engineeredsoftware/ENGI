# 🚀 Bitcode Mock System Scripts

**One-command setup and validation for the comprehensive Bitcode mock system**

## Quick Start

```bash
# Navigate to your uapi directory
cd apps/uapi

# Run the easy setup script
node mocking/scripts/setup-mock-system.js

# Validate everything is working
node mocking/scripts/validate-mock-system.js
```

## Available Scripts

### 🎯 Setup Script
```bash
# Setup with default demo scenario
node mocking/scripts/setup-mock-system.js

# Setup with specific scenarios
node mocking/scripts/setup-mock-system.js demo         # Rich demo data
node mocking/scripts/setup-mock-system.js enterprise   # Enterprise scale
node mocking/scripts/setup-mock-system.js testing      # Minimal testing
node mocking/scripts/setup-mock-system.js onboarding   # New user experience
node mocking/scripts/setup-mock-system.js empty        # Empty states
```

**What the setup script does:**
- ✅ Configures `.env.local` with optimal settings
- ✅ Backs up existing configuration 
- ✅ Creates scenario-specific quick start guide
- ✅ Sets up performance monitoring
- ✅ Enables debug tools

### 🔍 Validation Script
```bash
node mocking/scripts/validate-mock-system.js
```

**What the validation script checks:**
- ✅ Environment configuration
- ✅ File structure integrity
- ✅ TypeScript compilation
- ✅ Runtime validation
- ✅ Mock system health

## Script Features

### 🎭 Scenario Configurations

#### Demo Mode (Default)
- **Purpose:** Showcasing, sales, product demos
- **Data:** Rich, interconnected, engaging
- **Perfect for:** Client presentations, feature showcases

#### Enterprise Mode
- **Purpose:** Enterprise sales, scalability testing
- **Data:** Large-scale organizational structures
- **Perfect for:** Enterprise demos, performance validation

#### Testing Mode  
- **Purpose:** Automated testing, CI/CD pipelines
- **Data:** Minimal, predictable, consistent
- **Perfect for:** Unit tests, integration tests

#### Onboarding Mode
- **Purpose:** New user experience, tutorials
- **Data:** Progressive empty-to-populated states
- **Perfect for:** User onboarding flows, UX testing

#### Empty Mode
- **Purpose:** Zero-state testing, edge cases
- **Data:** Empty arrays, null values
- **Perfect for:** Empty state design, error boundaries

### 🛠️ What Gets Configured

#### Environment Variables
```bash
# Master controls
NEXT_PUBLIC_MASTER_MOCK_MODE=true
NEXT_PUBLIC_MOCK_SCENARIO=demo
NEXT_PUBLIC_MOCK_DEBUG=true

# Performance optimization  
NEXT_PUBLIC_MOCK_CACHE_ENABLED=true
NEXT_PUBLIC_MOCK_PERFORMANCE_MONITORING=true

# Scenario-specific tuning
NEXT_PUBLIC_MOCK_COMPLEXITY=complex
NEXT_PUBLIC_MOCK_TIMING=realistic
```

#### Generated Documentation
- **Quick Start Guide** - Scenario-specific usage instructions
- **Feature Overview** - What's mocked in your chosen scenario
- **Debug Instructions** - How to troubleshoot and customize

#### Safety Features
- **Backup Creation** - Existing `.env.local` backed up to `.env.local.backup`
- **Validation Checks** - Comprehensive system validation
- **Error Handling** - Graceful failure with helpful error messages

## Output Examples

### Successful Setup
```
🚀 Bitcode Mock System Setup

📋 Setting up: Demo Experience
📝 Description: Rich, engaging demo data perfect for showcasing Bitcode capabilities

⚙️  Configuring environment variables...
💾 Backing up existing .env.local to .env.local.backup
✅ Environment configured for Demo Experience
📄 Configuration written to .env.local

📚 Creating quick start guide...
✅ Quick start guide created: mocking/QUICK_START_DEMO.md

🎉 Setup Complete! Your Bitcode commercial surface is now running in Demo Experience.

📋 Next Steps:
1. Start your development server: npm run dev
2. Open your browser and navigate to any Bitcode page
3. See rich, realistic mock data automatically!
4. Check the quick start guide: mocking/QUICK_START_DEMO.md

🚀 Happy mocking!
```

### Successful Validation
```
🔍 Bitcode Mock System Validation

🔧 Testing Environment Configuration...
✅ Environment file exists
✅ Master mock mode configured
✅ Mock scenario configured

📁 Testing File Structure...
✅ File exists: mocking/index.ts
✅ File exists: mocking/types/core.ts
✅ File exists: mocking/core/MockOrchestrator.ts
...

🎭 Testing Mock System Files...
✅ Main index exports
✅ Comprehensive generators
✅ Specialized middleware

📝 Testing TypeScript Compilation...
✅ Types compile without errors

⚡ Testing Runtime Validation...
✅ Environment variables load correctly
✅ Mock data generator initializes

📊 Validation Summary:
✅ Passed: 15
❌ Failed: 0
⚠️  Warnings: 0
📈 Success Rate: 100%

🎉 All validations passed! Your mock system is ready to use.

🚀 Next steps:
1. Start your development server: npm run dev
2. Visit any page to see mocking in action
3. Check browser console for debug information
```

## Troubleshooting

### Common Issues

#### Permission Errors
```bash
# Make scripts executable
chmod +x mocking/scripts/*.js

# Or run with node explicitly
node mocking/scripts/setup-mock-system.js
```

#### Missing Dependencies
```bash
# Ensure you're in the right directory
cd apps/uapi

# Check Node.js version (should be 16+)
node --version
```

#### Configuration Issues
```bash
# Run validation to diagnose
node mocking/scripts/validate-mock-system.js

# Check existing .env.local
cat .env.local | grep MOCK

# Restore from backup if needed
cp .env.local.backup .env.local
```

### Manual Cleanup
```bash
# Remove mock configuration from .env.local
sed -i '/NEXT_PUBLIC_MOCK/d' .env.local

# Restore from backup
cp .env.local.backup .env.local

# Re-run setup
node mocking/scripts/setup-mock-system.js
```

## Advanced Usage

### Custom Scenario Setup
```bash
# You can modify the generated configuration
# Edit .env.local after running setup script

# Example customizations:
NEXT_PUBLIC_MOCK_ASSET_PACKS_SCENARIO=enterprise
NEXT_PUBLIC_MOCK_GITHUB_REPOS=false  # Use real GitHub data
NEXT_PUBLIC_MOCK_ERROR_INJECTION=true
```

### Integration with Package Scripts
```json
{
  "scripts": {
    "mock:setup": "node mocking/scripts/setup-mock-system.js",
    "mock:demo": "node mocking/scripts/setup-mock-system.js demo",
    "mock:enterprise": "node mocking/scripts/setup-mock-system.js enterprise",
    "mock:validate": "node mocking/scripts/validate-mock-system.js"
  }
}
```

### CI/CD Integration
```bash
# In your CI pipeline
node mocking/scripts/setup-mock-system.js testing
node mocking/scripts/validate-mock-system.js
npm run test
```

## Success Indicators

After running the setup script, you should see:

✅ **Environment configured** - `.env.local` contains mock settings  
✅ **Quick start guide created** - Scenario-specific documentation  
✅ **Backup created** - Original `.env.local` preserved  
✅ **Validation passes** - All system checks successful  
✅ **Mock data appears** - Rich data in your app when you start the server  

## What's Next?

1. **Start your server:** `npm run dev`
2. **Visit any page** - See mocking in action automatically
3. **Check browser console** - See debug information and tools
4. **Customize as needed** - Edit `.env.local` for specific requirements
5. **Integrate with APIs** - Follow the INTEGRATION_GUIDE.md

---

**One script, entire platform mocked. Zero code changes required.** 🎭
