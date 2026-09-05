/**
 * SCAMVERSE 360 - URL Phishing Detector (Phase 3, Module 10)
 *
 * Rule-based, explainable heuristics only (no external API calls, no
 * browsing of the URL itself) so this works fully offline and cannot be
 * misused to actually visit/interact with a suspicious link.
 */

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'update', 'secure', 'account', 'bank', 'confirm',
  'password', 'signin', 'billing', 'suspend', 'urgent', 'reward', 'claim',
  'kyc', 'refund', 'unlock', 'wallet', 'airdrop',
];

const KNOWN_BRANDS = [
  'paypal', 'amazon', 'google', 'microsoft', 'apple', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'sbi', 'hdfc', 'icici', 'axisbank', 'binance',
  'metamask', 'coinbase',
];

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'ow.ly', 'cutt.ly'];

function analyzeUrl(rawUrl) {
  const reasons = [];
  let score = 0;

  let urlObj;
  let normalized = rawUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) normalized = 'http://' + normalized;

  try {
    urlObj = new URL(normalized);
  } catch (e) {
    return {
      riskScore: 90,
      riskLevel: 'HIGH RISK',
      reasons: ['The URL could not be parsed — it is malformed or not a valid web address.'],
    };
  }

  const host = urlObj.hostname.toLowerCase();
  const fullUrl = rawUrl.toLowerCase();
  const path = urlObj.pathname.toLowerCase();

  // 1. Protocol check
  if (urlObj.protocol !== 'https:') {
    score += 15;
    reasons.push('Site does not use HTTPS.');
  }

  // 2. URL length
  if (rawUrl.length > 75) {
    score += 10;
    reasons.push('Unusually long URL.');
  }

  // 3. Suspicious keywords in path/query
  const keywordHits = SUSPICIOUS_KEYWORDS.filter((k) => fullUrl.includes(k));
  if (keywordHits.length >= 2) {
    score += 20;
    reasons.push(`Multiple login-related keywords detected (${keywordHits.slice(0, 3).join(', ')}).`);
  } else if (keywordHits.length === 1) {
    score += 8;
    reasons.push(`Login-related keyword detected (${keywordHits[0]}).`);
  }

  // 4. Excessive subdomains
  const subdomainCount = host.split('.').length - 2;
  if (subdomainCount >= 3) {
    score += 20;
    reasons.push('Unusual number of subdomains, often used to disguise the real domain.');
  } else if (subdomainCount === 2) {
    score += 8;
    reasons.push('Multiple subdomains detected.');
  }

  // 5. Special characters / hyphens in domain
  const hyphenCount = (host.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    score += 10;
    reasons.push('Multiple hyphens in domain name — a common obfuscation tactic.');
  }

  // 6. Brand impersonation: brand name present but NOT as the actual registrable domain
  const registrableParts = host.split('.');
  const registrableDomain = registrableParts.slice(-2, -1)[0] || host;

  // Digit-for-letter substitution right at brand-like word boundaries (e.g. "payp4l", "g00gle")
  if (/[a-z]{2,}[04][a-z]{2,}|[a-z]{2,}1[a-z]{2,}/.test(registrableDomain)) {
    score += 8;
    reasons.push('Domain contains character substitutions that can mimic letters (e.g. 0/4 for o/a, 1 for l).');
  }

  const brandHit = KNOWN_BRANDS.find((b) => host.includes(b));
  if (brandHit && registrableDomain !== brandHit) {
    score += 30;
    reasons.push(`Possible brand impersonation detected: contains "${brandHit}" but is not that brand's official domain.`);
  }

  // 7. URL shorteners
  if (SHORTENERS.some((s) => host.includes(s))) {
    score += 15;
    reasons.push('URL shortener detected — the real destination is hidden.');
  }

  // 8. IP address as hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    score += 25;
    reasons.push('Uses a raw IP address instead of a domain name — highly unusual for legitimate sites.');
  }

  // 9. "@" symbol trick
  if (rawUrl.includes('@')) {
    score += 20;
    reasons.push('Contains an "@" symbol, which can be used to disguise the true destination.');
  }

  score = Math.max(0, Math.min(100, score));

  let riskLevel = 'LOW RISK';
  if (score >= 60) riskLevel = 'HIGH RISK';
  else if (score >= 30) riskLevel = 'MEDIUM RISK';

  if (reasons.length === 0) {
    reasons.push('No common phishing indicators detected in this URL structure.');
  }

  return { riskScore: score, riskLevel, reasons };
}

module.exports = { analyzeUrl };
