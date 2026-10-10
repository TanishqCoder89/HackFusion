import dotenv from 'dotenv';

dotenv.config();

/**
 * Minimal provider-agnostic JSON generator.
 * Configure ONE of: ANTHROPIC_API_KEY or GEMINI_API_KEY in Backend/.env
 */
export const isAiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY);

const extractJson = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('AI response did not contain a JSON object.');
  return JSON.parse(candidate.slice(start, end + 1));
};

const callAnthropic = async (system, prompt) => {
  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
      max_tokens: 4096,
      system,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic API error (${res.status}).`);
  return data.content?.map((c) => c.text || '').join('') || '';
};

const callGemini = async (system, prompt) => {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini API error (${res.status}).`);
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
};

export const generateJson = async (system, prompt) => {
  if (!isAiConfigured()) {
    throw Object.assign(
      new Error('AI generation is not configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY in Backend/.env and restart the server.'),
      { status: 503 }
    );
  }
  const text = process.env.ANTHROPIC_API_KEY ? await callAnthropic(system, prompt) : await callGemini(system, prompt);
  return extractJson(text);
};
