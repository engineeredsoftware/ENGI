/**
 * Enhanced Web Research Example
 * 
 * This example demonstrates the state-of-the-art URL intelligence and 
 * enhanced search capabilities of the Bitcode web research system.
 */

import {
  searchWithUrlIntelligence,
  analyzeUrlAttachments,
  classifyUrl,
  extractTechnologyContext,
  discoverRelatedDomains,
  search
} from '@bitcode/web-search';

// Example 1: Basic URL Classification
export async function demonstrateUrlClassification() {
  console.log('🏷️  URL Classification Examples\\n');
  
  const urls = [
    'https://reactjs.org/docs/hooks.html',
    'https://github.com/facebook/react/issues/12345',
    'https://stackoverflow.com/questions/react-authentication',
    'https://api.stripe.com/docs/authentication',
    'https://medium.com/@developer/react-patterns',
    'https://arxiv.org/abs/2021.12345',
    'https://npmjs.com/package/react'
  ];

  for (const url of urls) {
    const classification = classifyUrl(url);
    console.log(`📋 ${url}`);
    console.log(`   Type: ${classification.type}`);
    console.log(`   Domain: ${classification.domain}`);
    console.log(`   Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
    console.log(`   Authority: ${classification.metadata.authority}`);
    console.log('');
  }
}

// Example 2: Technology Context Extraction
export async function demonstrateTechnologyExtraction() {
  console.log('🔧 Technology Context Extraction\\n');
  
  const urlSets = [
    {
      name: 'Frontend Stack',
      urls: [
        'https://reactjs.org/docs',
        'https://www.typescriptlang.org/docs',
        'https://nextjs.org/docs'
      ]
    },
    {
      name: 'Backend Stack', 
      urls: [
        'https://nodejs.org/api',
        'https://expressjs.com/guide',
        'https://www.postgresql.org/docs'
      ]
    },
    {
      name: 'Cloud Stack',
      urls: [
        'https://aws.amazon.com/s3',
        'https://cloud.google.com/storage/docs',
        'https://docs.docker.com'
      ]
    }
  ];

  for (const set of urlSets) {
    const technologies = extractTechnologyContext(set.urls);
    console.log(`📚 ${set.name}:`);
    console.log(`   Technologies: ${technologies.join(', ')}`);
    console.log('');
  }
}

// Example 3: Related Domain Discovery
export async function demonstrateRelatedDomains() {
  console.log('🌐 Related Domain Discovery\\n');
  
  const primaryDomains = [
    'reactjs.org',
    'nodejs.org', 
    'python.org',
    'microsoft.com'
  ];

  for (const domain of primaryDomains) {
    const related = discoverRelatedDomains(domain);
    console.log(`🔗 ${domain}:`);
    console.log(`   Related: ${related.slice(0, 5).join(', ')}`);
    console.log('');
  }
}

// Example 4: Comprehensive URL Attachment Analysis
export async function demonstrateUrlAttachmentAnalysis() {
  console.log('📊 Comprehensive URL Attachment Analysis\\n');
  
  const urlAttachments = [
    'https://reactjs.org/docs/hooks.html',
    'https://github.com/facebook/react',
    'https://stackoverflow.com/questions/tagged/react-hooks',
    'https://auth0.com/docs/tokens/json-web-tokens',
    'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API'
  ];

  console.log('📎 Input URLs:');
  urlAttachments.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
  console.log('');

  const analysis = await analyzeUrlAttachments(urlAttachments);
  
  console.log('🔍 Analysis Results:');
  console.log(`   URLs Analyzed: ${analysis.classifications.length}`);
  console.log(`   Suggested Domains: ${analysis.suggestedDomains.join(', ')}`);
  console.log(`   Content Topics: ${analysis.contentTopics.join(', ')}`);
  console.log(`   Related Domains: ${analysis.relatedDomains.slice(0, 5).join(', ')}`);
  console.log('');
  
  console.log('🎯 Search Strategy:');
  console.log(`   Include Domains: ${analysis.searchStrategy.includeDomains.slice(0, 5).join(', ')}`);
  console.log(`   Categories: ${analysis.searchStrategy.categories.join(', ')}`);
  console.log(`   Enhanced Queries: ${analysis.searchStrategy.enhancedQueries.slice(0, 3).join(', ')}`);
  console.log('');
  
  console.log('📋 URL Classifications:');
  analysis.classifications.forEach(classification => {
    console.log(`   📌 ${classification.url}`);
    console.log(`      Type: ${classification.type}`);
    console.log(`      Confidence: ${(classification.confidence * 100).toFixed(1)}%`);
    console.log(`      Authority: ${classification.metadata.authority}`);
  });
  console.log('');
}

// Example 5: Enhanced Search Comparison
export async function demonstrateEnhancedSearchComparison() {
  console.log('⚖️  Enhanced Search vs Regular Search\\n');
  
  const query = 'React authentication with JWT tokens';
  const urlAttachments = [
    'https://reactjs.org/docs/hooks.html',
    'https://auth0.com/docs/tokens/json-web-tokens'
  ];

  console.log(`🔍 Query: \"${query}\"`);
  console.log(`📎 URL Attachments: ${urlAttachments.length}`);
  console.log('');

  // Regular search
  console.log('🔍 Regular Search Results:');
  const regularResults = await search(query, {
    numResults: 5,
    type: 'neural'
  });
  
  regularResults.results.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.title}`);
    console.log(`      URL: ${result.url}`);
    console.log(`      Score: ${(result.score * 100).toFixed(1)}%`);
  });
  console.log('');

  // Enhanced search with URL intelligence
  console.log('🚀 Enhanced Search Results (with URL Intelligence):');
  const enhancedResults = await searchWithUrlIntelligence(
    query,
    urlAttachments,
    {
      numResults: 5,
      type: 'neural',
      contents: {
        text: { maxCharacters: 3000 },
        highlights: { numSentences: 2 },
        summary: { query }
      }
    }
  );
  
  enhancedResults.results.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.title}`);
    console.log(`      URL: ${result.url}`);
    console.log(`      Score: ${(result.score * 100).toFixed(1)}%`);
    if (result.summary) {
      console.log(`      Summary: ${result.summary.slice(0, 100)}...`);
    }
  });
  
  if (enhancedResults.urlAnalysis) {
    console.log('');
    console.log('🧠 URL Intelligence Applied:');
    console.log(`   Domains Scoped: ${enhancedResults.urlAnalysis.suggestedDomains.join(', ')}`);
    console.log(`   Technologies: ${enhancedResults.urlAnalysis.contentTopics.join(', ')}`);
    console.log(`   URL Types: ${enhancedResults.urlAnalysis.classifications.map(c => c.type).join(', ')}`);
  }
  console.log('');
}

// Example 6: Real-World Development Scenario
export async function demonstrateRealWorldScenario() {
  console.log('🏗️  Real-World Development Scenario\\n');
  
  // Scenario: Developer working on a Next.js app with authentication
  const task = 'Implement OAuth2 authentication in Next.js application with TypeScript';
  const projectUrls = [
    'https://nextjs.org/docs/authentication',
    'https://github.com/nextauthjs/next-auth',
    'https://www.typescriptlang.org/docs',
    'https://oauth.net/2/',
    'https://stackoverflow.com/questions/tagged/next.js+authentication'
  ];

  console.log(`📋 Task: ${task}`);
  console.log('📎 Project Context URLs:');
  projectUrls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
  console.log('');

  // Step 1: Analyze project context
  console.log('🔍 Step 1: Analyzing Project Context...');
  const urlAnalysis = await analyzeUrlAttachments(projectUrls);
  
  console.log(`   📊 Technologies Detected: ${urlAnalysis.contentTopics.join(', ')}`);
  console.log(`   🌐 Authoritative Domains: ${urlAnalysis.suggestedDomains.join(', ')}`);
  console.log(`   🔗 Related Domains: ${urlAnalysis.relatedDomains.slice(0, 5).join(', ')}`);
  console.log('');

  // Step 2: Perform enhanced research
  console.log('🚀 Step 2: Performing Enhanced Research...');
  const researchResults = await searchWithUrlIntelligence(
    task,
    projectUrls,
    {
      numResults: 10,
      type: 'neural',
      contents: {
        text: { maxCharacters: 5000 },
        highlights: { numSentences: 3 },
        summary: { query: task }
      }
    }
  );

  // Step 3: Analyze results by category
  console.log('📚 Step 3: Categorized Research Results...');
  
  const categorizedResults = {
    documentation: researchResults.results.filter(r => 
      r.url.includes('docs') || r.url.includes('nextjs.org')
    ),
    repositories: researchResults.results.filter(r => 
      r.url.includes('github.com')
    ),
    tutorials: researchResults.results.filter(r => 
      r.url.includes('tutorial') || r.url.includes('guide')
    ),
    community: researchResults.results.filter(r => 
      r.url.includes('stackoverflow.com') || r.url.includes('reddit.com')
    )
  };

  Object.entries(categorizedResults).forEach(([category, results]) => {
    if (results.length > 0) {
      console.log(`   📖 ${category.toUpperCase()} (${results.length} results):`);
      results.slice(0, 3).forEach((result, i) => {
        console.log(`      ${i + 1}. ${result.title}`);
        console.log(`         ${result.url}`);
        console.log(`         Relevance: ${(result.score * 100).toFixed(1)}%`);
      });
      console.log('');
    }
  });

  // Step 4: Generate implementation insights
  console.log('💡 Step 4: Implementation Insights...');
  const topResults = researchResults.results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  console.log('   🎯 Top Recommendations:');
  topResults.forEach((result, i) => {
    console.log(`   ${i + 1}. ${result.title}`);
    console.log(`      Authority Score: ${(result.score * 100).toFixed(1)}%`);
    if (result.summary) {
      console.log(`      Key Insight: ${result.summary.slice(0, 150)}...`);
    }
    console.log('');
  });

  return {
    taskAnalysis: urlAnalysis,
    researchResults: researchResults.results,
    urlIntelligence: researchResults.urlAnalysis,
    recommendations: topResults,
    technologiesDetected: urlAnalysis.contentTopics
  };
}

// Example 7: Performance and Quality Metrics
export async function demonstrateQualityMetrics() {
  console.log('📈 Quality and Performance Metrics\\n');
  
  const testQuery = 'React performance optimization techniques';
  const testUrls = [
    'https://reactjs.org/docs/optimizing-performance.html',
    'https://web.dev/react',
    'https://github.com/facebook/react/issues'
  ];

  console.log(`🔍 Test Query: \"${testQuery}\"`);
  console.log(`📎 Test URLs: ${testUrls.length}`);
  console.log('');

  const startTime = Date.now();
  
  const results = await searchWithUrlIntelligence(
    testQuery,
    testUrls,
    { numResults: 15 }
  );
  
  const endTime = Date.now();
  const duration = endTime - startTime;

  // Calculate quality metrics
  const avgRelevance = results.results.reduce((sum, r) => sum + r.score, 0) / results.results.length;
  const uniqueDomains = new Set(results.results.map(r => new URL(r.url).hostname));
  const authorityDomains = ['reactjs.org', 'web.dev', 'developer.mozilla.org', 'github.com'];
  const authorityResults = results.results.filter(r => 
    authorityDomains.some(domain => r.url.includes(domain))
  );
  
  console.log('⚡ Performance Metrics:');
  console.log(`   Search Duration: ${duration}ms`);
  console.log(`   Results Retrieved: ${results.results.length}`);
  console.log(`   URL Analysis: ${results.urlAnalysis ? 'Applied' : 'Not Applied'}`);
  console.log('');
  
  console.log('🎯 Quality Metrics:');
  console.log(`   Average Relevance: ${(avgRelevance * 100).toFixed(1)}%`);
  console.log(`   Unique Domains: ${uniqueDomains.size}`);
  console.log(`   Authority Sources: ${authorityResults.length}/${results.results.length} (${((authorityResults.length / results.results.length) * 100).toFixed(1)}%)`);
  console.log(`   Coverage Score: ${Math.min(uniqueDomains.size / 5, 1).toFixed(2)}/1.0`);
  console.log('');
  
  if (results.urlAnalysis) {
    console.log('🧠 URL Intelligence Impact:');
    console.log(`   Domains Scoped: ${results.urlAnalysis.suggestedDomains.length}`);
    console.log(`   Technologies Detected: ${results.urlAnalysis.contentTopics.length}`);
    console.log(`   Enhanced Queries: ${results.urlAnalysis.searchStrategy.enhancedQueries.length}`);
    console.log('');
  }
  
  console.log('🏆 Top Quality Results:');
  results.results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .forEach((result, i) => {
      console.log(`   ${i + 1}. ${result.title}`);
      console.log(`      Domain: ${new URL(result.url).hostname}`);
      console.log(`      Relevance: ${(result.score * 100).toFixed(1)}%`);
      console.log(`      Authority: ${authorityDomains.some(d => result.url.includes(d)) ? 'High' : 'Medium'}`);
    });
}

// Main demonstration function
export async function runEnhancedResearchDemo() {
  console.log('🚀 Enhanced Web Research System Demonstration\\n');
  console.log('=' .repeat(60));
  console.log('');

  try {
    await demonstrateUrlClassification();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    await demonstrateTechnologyExtraction();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    await demonstrateRelatedDomains();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    await demonstrateUrlAttachmentAnalysis();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    await demonstrateEnhancedSearchComparison();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    const realWorldResults = await demonstrateRealWorldScenario();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    await demonstrateQualityMetrics();
    console.log('\\n' + '=' .repeat(60) + '\\n');
    
    console.log('✅ Enhanced Web Research System Demonstration Complete!');
    console.log('');
    console.log('🎯 Key Capabilities Demonstrated:');
    console.log('   • Intelligent URL classification and analysis');
    console.log('   • Technology context extraction and awareness');
    console.log('   • Automatic domain scoping and related domain discovery');
    console.log('   • Enhanced query generation based on URL content');
    console.log('   • Improved search relevance through URL intelligence');
    console.log('   • Real-world development scenario optimization');
    console.log('   • Quality metrics and performance measurement');
    console.log('');
    console.log('Result: State-of-the-art web research for technical knowledge evidence.');
    
    return realWorldResults;
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runEnhancedResearchDemo().catch(console.error);
}
