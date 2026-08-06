// digest helper fn

async function callAnthropic(endpoint, apiKey, prompt, maxTokens) {
  const body = {
    model: "claude-3-5-sonnet-latest",
    messages: [
      {
        role: "user",
        content: prompt
      }],
    max_tokens: maxTokens,
    temperature: 0.1,
    top_p: 0.8
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'context-500k-2024-09-04,max-tokens-3-5-sonnet-2024-07-15'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText} ${response.text} ${response.body}`);
  }

  const data = await response.json();
  if (!data.content?.[0]?.text) {
    throw new Error('Unexpected Anthropic API response format');
  }

  return data.content[0].text;
}

module.exports = { callAnthropic };
