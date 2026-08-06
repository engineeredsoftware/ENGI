
const { log } = require('@bitcode/logger');

async function callGemini(endpoint, apiKey, prompt, maxOutputTokens) {
  const body = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      maxOutputTokens,
      temperature: 0.05,
      topP: 0.8,
      topK: 40
    }
  };

  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Unexpected Gemini API response format');
  }

  return data.candidates[0].content.parts[0].text;
}

module.exports = { callGemini };
