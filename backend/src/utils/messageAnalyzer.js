/**
 * SCAMVERSE 360 - Message Scam Detector (Phase 3, Module 11)
 * Rule-based, explainable text heuristics. Never sends message content
 * anywhere external; analysis happens entirely in-process.
 */

const PATTERNS = [
  {
    key: 'urgency',
    label: 'Urgency pressure',
    regex: /\b(immediately|urgent|right away|act now|within\s+\d+\s*(hours?|minutes?)|expires? (today|soon)|last chance|final notice)\b/i,
    weight: 15,
  },
  {
    key: 'fear',
    label: 'Fear / threat language',
    regex: /\b(suspend(ed)?|block(ed)?|frozen|legal action|arrest(ed)?|penalty|fine|account.*(closed|terminated))\b/i,
    weight: 15,
  },
  {
    key: 'otp_request',
    label: 'Requests an OTP or verification code',
    regex: /\b(otp|one[-\s]?time password|verification code|security code)\b/i,
    weight: 25,
  },
  {
    key: 'payment_request',
    label: 'Requests payment or money transfer',
    regex: /\b(pay(ment)? (now|immediately)|send money|transfer funds|deposit|processing fee|registration fee|gas fee)\b/i,
    weight: 20,
  },
  {
    key: 'fake_authority',
    label: 'Claims to be from an authority/organization',
    regex: /\b(bank|income tax|police|customs|government|rbi|irs|court|cyber cell)\b.{0,40}\b(officer|department|team|official)\b/i,
    weight: 15,
  },
  {
    key: 'guaranteed_returns',
    label: 'Promises guaranteed/unrealistic returns',
    regex: /\b(guaranteed?\s+(returns?|profit)|double your money|\d{2,4}%\s*returns?|risk[-\s]?free investment)\b/i,
    weight: 20,
  },
  {
    key: 'suspicious_link',
    label: 'Contains a link (esp. shortened)',
    regex: /(https?:\/\/|www\.)\S+|bit\.ly|tinyurl\.com/i,
    weight: 10,
  },
  {
    key: 'credential_request',
    label: 'Asks for password, PIN, or recovery phrase',
    regex: /\b(password|pin|cvv|recovery phrase|seed phrase|private key)\b/i,
    weight: 25,
  },
  {
    key: 'emotional_manipulation',
    label: 'Emotional manipulation (sympathy/curiosity)',
    regex: /\b(help me|stranded|emergency|congratulations|you('| ha)ve won|selected|lucky winner)\b/i,
    weight: 10,
  },
];

function analyzeMessage(text) {
  const matched = [];
  let score = 0;

  PATTERNS.forEach((p) => {
    if (p.regex.test(text)) {
      matched.push(p.label);
      score += p.weight;
    }
  });

  score = Math.max(0, Math.min(100, score));

  let riskLevel = 'LOW RISK';
  if (score >= 55) riskLevel = 'HIGH RISK';
  else if (score >= 25) riskLevel = 'MEDIUM RISK';

  if (matched.length === 0) {
    matched.push('No common scam patterns detected in this message.');
  }

  return { riskScore: score, riskLevel, redFlags: matched };
}

module.exports = { analyzeMessage };
