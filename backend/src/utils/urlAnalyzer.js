/**
 * SCAMVERSE 360 - URL Phishing Detector (Phase 3, Module 10)
 *
 * Rule-based, explainable heuristics engine (works fully offline and fallback).
 */

const SUSPICIOUS_KEYWORDS = [
  'login', 'verify', 'update', 'secure', 'account', 'bank', 'confirm',
  'password', 'signin', 'billing', 'suspend', 'urgent', 'reward', 'claim',
  'kyc', 'refund', 'unlock', 'wallet', 'airdrop', 'free-gift', 'lottery',
  'prize', 'bonus', 'claim-now'
];

const KNOWN_BRANDS = [
  'paypal', 'amazon', 'google', 'microsoft', 'apple', 'netflix', 'facebook',
  'instagram', 'whatsapp', 'sbi', 'hdfc', 'icici', 'axisbank', 'binance',
  'metamask', 'coinbase', 'telegram', 'flipkart', 'paytm'
];

const TRUSTED_DOMAINS = new Set([
  'google.com', 'google.co.in', 'youtube.com', 'amazon.com', 'amazon.in',
  'apple.com', 'microsoft.com', 'github.com', 'wikipedia.org', 'netflix.com',
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
  'reddit.com', 'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'flipkart.com', 'paytm.com', 'gov.in', 'nic.in'
]);

const SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'is.gd', 'ow.ly', 'cutt.ly', 'rb.gy'];
const HIGH_RISK_TLDS = ['.xyz', '.top', '.buzz', '.work', '.click', '.monster', '.loan', '.tk', '.ga', '.cf', '.gq', '.ml'];

function analyzeUrl(rawUrl) {
  const reasons = [];
  const suggestions = [];
  let score = 0;

  let normalized = rawUrl.trim();
  const explicitlyHttp = /^http:\/\//i.test(normalized);

  // If no protocol was provided, default to https (standard web behavior)
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }

  let urlObj;
  try {
    urlObj = new URL(normalized);
  } catch (e) {
    return {
      riskScore: 90,
      riskLevel: 'HIGH RISK',
      reasons: ['The URL is malformed or not a valid web address.'],
      redFlags: ['Malformed URL structure'],
      suggestions: ['Do not visit or click on this link.']
    };
  }

  const host = urlObj.hostname.toLowerCase();
  const fullUrl = rawUrl.toLowerCase();
  const domainParts = host.split('.');
  const domainBase = domainParts.length >= 2 ? domainParts.slice(-2).join('.') : host;

  // Check if trusted domain
  if (TRUSTED_DOMAINS.has(domainBase) || TRUSTED_DOMAINS.has(host)) {
    // Only flag if suspicious query parameters exist
    const keywordHits = SUSPICIOUS_KEYWORDS.filter((k) => urlObj.search.toLowerCase().includes(k));
    if (keywordHits.length === 0 && !explicitlyHttp) {
      return {
        riskScore: 0,
        riskLevel: 'LOW RISK',
        reasons: ['Verified legitimate domain with standard structure.', 'No suspicious redirection or phishing parameters detected.'],
        redFlags: [],
        suggestions: ['This is a well-known legitimate domain. Always verify the address bar in your browser.']
      };
    }
  }

  // 1. Explicit unencrypted HTTP
  if (explicitlyHttp) {
    score += 15;
    reasons.push('Uses unencrypted HTTP connection instead of secure HTTPS.');
    suggestions.push('Avoid entering passwords or sensitive personal data on non-HTTPS sites.');
  }

  // 2. High risk TLD
  if (HIGH_RISK_TLDS.some(tld => host.endsWith(tld))) {
    score += 25;
    reasons.push('Uses a top-level domain (.xyz, .top, .click, etc.) frequently associated with disposable scam sites.');
  }

  // 3. URL length
  if (rawUrl.length > 85) {
    score += 10;
    reasons.push('Unusually long URL, often used to hide the true target.');
  }

  // 4. Suspicious keywords in path/query
  const keywordHits = SUSPICIOUS_KEYWORDS.filter((k) => fullUrl.includes(k));
  if (keywordHits.length >= 2) {
    score += 25;
    reasons.push(`Multiple suspicious phishing keywords detected (${keywordHits.slice(0, 3).join(', ')}).`);
  } else if (keywordHits.length === 1) {
    score += 10;
    reasons.push(`Contains keyword commonly used in phishing campaigns (${keywordHits[0]}).`);
  }

  // 5. Excessive subdomains
  const subdomainCount = domainParts.length - 2;
  if (subdomainCount >= 3) {
    score += 20;
    reasons.push('Unusual number of subdomains, frequently used to spoof legitimate brand structures.');
  } else if (subdomainCount === 2) {
    score += 8;
    reasons.push('Multiple subdomains detected.');
  }

  // 6. Special characters / hyphens in domain
  const hyphenCount = (host.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    score += 15;
    reasons.push('Multiple hyphens in domain name (common brand-mimicking tactic).');
  }

  // 7. Brand impersonation / Typosquatting
  const brandHit = KNOWN_BRANDS.find((b) => host.includes(b));
  if (brandHit && !TRUSTED_DOMAINS.has(domainBase)) {
    score += 35;
    reasons.push(`Possible brand impersonation: Contains brand name "${brandHit}" but is not hosted on its official domain.`);
    suggestions.push(`Navigate directly to the official ${brandHit} website rather than using this link.`);
  }

  // Character substitution (e.g., payp4l, g00gle)
  if (/[a-z]{2,}[04][a-z]{2,}|[a-z]{2,}1[a-z]{2,}/.test(domainBase)) {
    score += 20;
    reasons.push('Domain contains digit-for-letter substitutions (lookalike characters mimicking letters).');
  }

  // 8. URL shorteners
  if (SHORTENERS.some((s) => host.includes(s))) {
    score += 20;
    reasons.push('URL shortener detected — the final destination and domain are masked.');
    suggestions.push('Use a URL expander to inspect the destination before opening short links.');
  }

  // 9. IP address as hostname
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    score += 35;
    reasons.push('Uses a raw IP address instead of a domain name — highly characteristic of rogue servers.');
  }

  // 10. "@" symbol trick
  if (rawUrl.includes('@')) {
    score += 25;
    reasons.push('Contains an "@" symbol, which browsers can interpret to route to an unexpected destination.');
  }

  score = Math.max(0, Math.min(100, score));

  let riskLevel = 'LOW RISK';
  if (score >= 60) riskLevel = 'HIGH RISK';
  else if (score >= 25) riskLevel = 'MEDIUM RISK';

  if (reasons.length === 0) {
    reasons.push('No obvious phishing indicators or malicious signatures detected.');
    suggestions.push('Always ensure the address matches the expected company or service.');
  }

  if (suggestions.length === 0) {
    if (score >= 60) {
      suggestions.push('Do NOT click this link or enter personal or payment information.');
    } else if (score >= 25) {
      suggestions.push('Proceed with caution. Check the certificate and domain spellings closely.');
    } else {
      suggestions.push('Standard precaution: verify the sender before opening unknown attachments.');
    }
  }

  return {
    riskScore: score,
    riskLevel,
    reasons,
    redFlags: reasons,
    suggestions
  };
}

module.exports = { analyzeUrl };
