// backend/src/services/aiDetector.js
const fetch = (...args) => globalThis.fetch(...args);

const CANDIDATE_MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite'
];

/**
 * Call Gemini AI to evaluate a URL or message.
 * Returns an object:
 *   { riskScore, riskLevel, reasons, redFlags, suggestions }
 * Returns `null` on failure so the caller falls back to the heuristic engine.
 */
async function detectGemini(content, type = 'content') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const prompt = `You are an expert cybersecurity and anti-fraud analyst.
Analyze the following ${type} for phishing, fraud, financial scams, social engineering, or security threats.
The input may be in English, Hindi, Marathi, or Hinglish.

Evaluate thoroughly and return ONLY a valid JSON object with the following fields:
- "riskScore": integer from 0 to 100 (0 = completely safe/legitimate brand/site, 100 = critical threat/active scam). If it is a known legitimate brand (e.g. google.com, amazon.in, official banks), riskScore must be 0 to 5.
- "riskLevel": exactly one of "LOW RISK" (0-24), "MEDIUM RISK" (25-59), or "HIGH RISK" (60-100)
- "reasons": array of concise strings detailing why this risk was assigned (e.g. legitimate domain, urgency tactics, fake KYC, typosquatting)
- "suggestions": array of 1-3 actionable advice steps for the user

Input to analyze:
"${content}"`;

  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text);

      const score = typeof parsed.riskScore === 'number'
        ? Math.max(0, Math.min(100, Math.round(parsed.riskScore)))
        : 0;

      let level = parsed.riskLevel || 'LOW RISK';
      if (!level.includes('RISK')) {
        level = level === 'HIGH' ? 'HIGH RISK' : level === 'MEDIUM' ? 'MEDIUM RISK' : 'LOW RISK';
      }

      const reasons = Array.isArray(parsed.reasons)
        ? parsed.reasons
        : Array.isArray(parsed.redFlags)
          ? parsed.redFlags
          : ['AI security analysis completed.'];

      const suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];

      return {
        riskScore: score,
        riskLevel: level,
        reasons,
        redFlags: reasons,
        suggestions
      };
    } catch (err) {
      // Continue to next model or fallback
    }
  }

  return null;
}

module.exports = { detectGemini };
