// backend/src/services/aiDetector.js
const fetch = (...args) => globalThis.fetch(...args);

/**
 * Call Gemini 1.5 Flash to evaluate a URL or message.
 * Returns an object like:
 *   { riskScore, riskLevel, redFlags, suggestions }
 * Returns `null` on any error (missing API key, network failure, etc.)
 * so the caller can fall back to the heuristic engine.
 */
async function detectGemini(content) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn('GEMINI_API_KEY not set – skipping AI detection');
        return null;
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `You are a security analyst. Evaluate the following input for scam likelihood.
Return a JSON object with the fields:
  - riskScore (0‑100 integer)
  - riskLevel ("LOW", "MEDIUM", or "HIGH")
  - redFlags (array of short strings describing detected scam patterns)
  - suggestions (array of short user‑visible advice)
The input may be in English, Hindi, or Marathi.
Input: ${content}`;

    const requestBody = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
    };

    try {
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!resp.ok) {
            console.error('Gemini API error:', resp.status, resp.statusText);
            return null;
        }

        const data = await resp.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse Gemini response as JSON', e);
            return null;
        }
    } catch (err) {
        console.error('Error calling Gemini API', err);
        return null;
    }
}

module.exports = { detectGemini };
