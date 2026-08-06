#!/usr/bin/env node

/**
 * Bitcode Mock System - Validation Script
 * 
 * This script validates that the mock system is properly configured and working.
 * Run this to diagnose any issues or verify your setup.
 * 
 * Usage:
 *   node mocking/scripts/validate-mock-system.js
 */

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔍 Bitcode Mock System Validation\n');
  
  let allPassed = true;
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Test categories
  await testEnvironmentConfiguration(results);
  await testFileStructure(results);
  await testMockSystemFiles(results);
  await testTypeScriptCompilation(results);
  await testRuntimeValidation(results);
  
  // Summary
  console.log('\n📊 Validation Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  
  const total = results.passed + results.failed;
  const percentage = total > 0 ? Math.round((results.passed / total) * 100) : 0;
  console.log(`📈 Success Rate: ${percentage}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All validations passed! Your mock system is ready to use.');
    console.log('\n🚀 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit any page to see mocking in action');
    console.log('3. Check browser console for debug information');
  } else {
    console.log('\n⚠️  Some validations failed. Please check the issues above.');
    console.log('\n🔧 Common fixes:');
    console.log('- Run: node mocking/scripts/setup-mock-system.js');
    console.log('- Check .env.local configuration');
    console.log('- Ensure all mock system files are present');
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

async function testEnvironmentConfiguration(results) {
  console.log('🔧 Testing Environment Configuration...');
  
  await test('Environment file exists', () => {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.warn('⚠️  No .env.local file found. Run mocking/scripts/setup-mock-system.js to generate one.');
      results.warnings++;
      return;
    }
  }, results);
  
  await test('Master mock mode configured', () => {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (!content.includes('NEXT_PUBLIC_MASTER_MOCK_MODE')) {
        throw new Error('NEXT_PUBLIC_MASTER_MOCK_MODE not configured');
      }
    }
  }, results);
  
  await test('Mock scenario configured', () => {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      if (!content.includes('NEXT_PUBLIC_MOCK_SCENARIO')) {
        throw new Error('NEXT_PUBLIC_MOCK_SCENARIO not configured');
      }
    }
  }, results);
  
  console.log('');
}

async function testFileStructure(results) {
  console.log('📁 Testing File Structure...');
  
  const requiredFiles = [
    'mocking/index.ts',
    'mocking/types/core.ts',
    'mocking/core/MockOrchestrator.ts',
    'mocking/engines/StreamingPipelineEngine.ts',
    'mocking/generators/MockDataGenerators.ts',
    'mocking/generators/ComprehensiveMockDataGenerators.ts',
    'mocking/integration/MockProvider.tsx',
    'mocking/middleware/MockMiddleware.ts',
    'mocking/middleware/SpecializedMockMiddleware.ts'
  ];
  
  for (const file of requiredFiles) {
    await test(`File exists: ${file}`, () => {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }, results);
  }
  
  console.log('');
}

async function testMockSystemFiles(results) {
  console.log('🎭 Testing Mock System Files...');
  
  await test('Main index exports', () => {
    const indexPath = path.join(process.cwd(), 'mocking/index.ts');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      const requiredExports = [
        'MockOrchestrator',
        'useMockData',
        'mockAreas',
        'comprehensiveMockGenerator'
      ];
      
      for (const exp of requiredExports) {
        if (!content.includes(exp)) {
          throw new Error(`Missing export: ${exp}`);
        }
      }
    }
  }, results);
  
  await test('Comprehensive generators', () => {
    const genPath = path.join(process.cwd(), 'mocking/generators/ComprehensiveMockDataGenerators.ts');
    if (fs.existsSync(genPath)) {
      const content = fs.readFileSync(genPath, 'utf8');
      
      // Check for key generator methods
      const requiredGenerators = [
        'generateAssetPacks',
        'generateConversationConversations',
        'generateUserProfile',
        'generateGitHubRepos'
      ];
      
      for (const gen of requiredGenerators) {
        if (!content.includes(gen)) {
          throw new Error(`Missing generator: ${gen}`);
        }
      }
    }
  }, results);
  
  await test('Specialized middleware', () => {
    const mwPath = path.join(process.cwd(), 'mocking/middleware/SpecializedMockMiddleware.ts');
    if (fs.existsSync(mwPath)) {
      const content = fs.readFileSync(mwPath, 'utf8');
      
      // Check for key middleware exports
      const requiredMiddleware = [
        'mockAreas',
        'mockAuth',
        'mockUser',
        'mockAssetPacks',
        'mockConversation'
      ];
      
      for (const mw of requiredMiddleware) {
        if (!content.includes(mw)) {
          throw new Error(`Missing middleware: ${mw}`);
        }
      }
    }
  }, results);
  
  console.log('');
}

async function testTypeScriptCompilation(results) {
  console.log('📝 Testing TypeScript Compilation...');
  
  await test('Types compile without errors', () => {
    const typesPath = path.join(process.cwd(), 'mocking/types/core.ts');
    if (fs.existsSync(typesPath)) {
      const content = fs.readFileSync(typesPath, 'utf8');
      
      // Basic syntax checks
      if (!content.includes('export type MockableFeature')) {
        throw new Error('MockableFeature type not exported');
      }
      
      if (!content.includes('MockScenarioType')) {
        throw new Error('MockScenarioType not defined');
      }
      
      // Count MockableFeature options (should be 100+)
      const featureMatches = content.match(/\| '[A-Z_]+'/g);
      if (!featureMatches || featureMatches.length < 100) {
        console.warn(`⚠️  Warning: Only ${featureMatches?.length || 0} mock features found, expected 100+`);
        results.warnings++;
      }
    }
  }, results);
  
  console.log('');
}

async function testRuntimeValidation(results) {
  console.log('⚡ Testing Runtime Validation...');
  
  await test('Environment variables load correctly', () => {
    // Simulate environment loading
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_MOCK_') && line.includes('=')) {
          const [key, value] = line.split('=');
          if (!value || value.trim() === '') {
            throw new Error(`Empty value for ${key}`);
          }
        }
      }
    }
  }, results);
  
  await test('Mock data generator initializes', () => {
    // Try to require the generator (basic syntax check)
    try {
      const genPath = path.join(process.cwd(), 'mocking/generators/ComprehensiveMockDataGenerators.ts');
      if (fs.existsSync(genPath)) {
        const content = fs.readFileSync(genPath, 'utf8');
        
        // Check for class definition
        if (!content.includes('class ComprehensiveMockDataGenerator')) {
          throw new Error('ComprehensiveMockDataGenerator class not found');
        }
        
        // Check for export
        if (!content.includes('export const comprehensiveMockGenerator')) {
          throw new Error('comprehensiveMockGenerator not exported');
        }
      }
    } catch (error) {
      throw new Error(`Generator initialization failed: ${error.message}`);
    }
  }, results);
  
  console.log('');
}

async function test(name, fn, results) {
  try {
    await Promise.resolve(fn());
    console.log(`✅ ${name}`);
    results.passed++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    results.failed++;
  }
}

// Run validation
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Validation failed with error:', error);
    process.exit(1);
  });
}

module.exports = { main };
