// English translation dictionary
const en = {
  // ── App / Nav ──────────────────────────────────────────────────────────────
  appName: 'SCAMVERSE 360',
  appTagline: 'Awareness & Threat Intel',
  appSubtitle: 'Simulation-based scam training and community threat reporting.',
  langLabel: 'EN',

  // ── Sidebar sections ──────────────────────────────────────────────────────
  nav_train: 'Train',
  nav_detect: 'Detect & Report',
  nav_admin: 'Admin',
  nav_dashboard: 'Dashboard',
  nav_simulator: 'Simulator',
  nav_training: 'Training',
  nav_vulnerability: 'Vulnerability Profile',
  nav_certificate: 'Certificate',
  nav_url: 'URL Detector',
  nav_message: 'Message Detector',
  nav_wallet: 'Wallet Checker',
  nav_report: 'Report a Threat',
  nav_registry: 'Threat Registry',
  nav_evidence: 'Evidence Vault',
  nav_admin_dashboard: 'Admin Dashboard',
  nav_emergency: '🚨 I think I\'m being scammed',
  nav_signout: 'Sign out',

  // ── Public top-bar ────────────────────────────────────────────────────────
  nav_verify_cert: 'Verify a Certificate',
  nav_login: 'Login',
  nav_signup: 'Sign Up',

  // ── Landing ───────────────────────────────────────────────────────────────
  landing_headline: 'Experience the scam before the scammer finds you.',
  landing_sub: 'Safe, realistic simulations of banking, payment, phishing, investment and Web3 scams — with zero real risk.',
  landing_cta: 'Get Started',
  landing_login: 'Login',
  landing_cat_banking: 'Banking',
  landing_cat_upi: 'UPI & Payments',
  landing_cat_phishing: 'Phishing',
  landing_cat_web3: 'Web3 & Crypto',

  // ── Login ────────────────────────────────────────────────────────────────
  login_title: 'Login',
  login_email: 'Email',
  login_password: 'Password',
  login_btn: 'Login',
  login_loading: 'Please wait...',
  login_guest: 'Continue as Guest',
  login_no_account: 'No account?',
  login_signup_link: 'Sign up',
  login_failed: 'Login failed',
  login_guest_failed: 'Guest login failed',

  // ── Sign up ───────────────────────────────────────────────────────────────
  signup_title: 'Create Account',
  signup_name: 'Full Name',
  signup_email: 'Email',
  signup_password: 'Password (min 8 chars)',
  signup_btn: 'Create Account',
  signup_loading: 'Creating account...',
  signup_already: 'Already have an account?',
  signup_login_link: 'Login',

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dash_eyebrow: 'Awareness Platform',
  dash_badge: 'Simulation Data',
  dash_title: 'Command Dashboard',
  dash_desc: 'Your personal view across simulations, awareness scores, and recommended training.',
  dash_stat_score: 'Overall Safety Score',
  dash_stat_sims: 'Simulations Completed',
  dash_stat_weak: 'Weak Areas',
  dash_stat_strong: 'Strong Areas',
  dash_priorities: 'Training Priorities',
  dash_focus: 'Recommended Focus',
  dash_scores: 'All Category Scores',
  dash_recent: 'Recent Simulations',
  dash_no_sims: 'No simulations completed yet.',
  dash_start: 'Start a Simulation',
  dash_plan: 'View Training Plan',
  dash_emergency: '🚨 I think I\'m being scammed',
  dash_weak_title: (cat) => `${cat} needs attention`,
  dash_weak_desc: (score) => `Your score in this category is ${score}/100 based on past simulation decisions.`,
  dash_strong_title: (cat) => `${cat} is a strength`,
  dash_strong_desc: (score) => `You consistently make safe decisions in this category (${score}/100).`,
  dash_loading: 'Loading dashboard...',
  dash_error: 'Could not load dashboard',

  // ── Simulator ─────────────────────────────────────────────────────────────
  sim_eyebrow: 'Training Module',
  sim_title: 'Interactive Scam Simulator',
  sim_desc: 'Pick a scenario and make decisions exactly as you would in real life — with zero real risk.',
  sim_mode_banner: 'SIMULATION MODE — NO REAL MONEY OR PERSONAL INFORMATION IS REQUIRED',
  sim_safe: 'Safe choice',
  sim_risky: 'Risky choice',
  sim_continue: 'Continue →',
  sim_complete: 'Simulation Complete',
  sim_correct: 'Correct',
  sim_incorrect: 'Incorrect',
  sim_risky_count: 'Risky',
  sim_red_flags: 'Key red flags to remember:',
  sim_back: 'Back to scenarios',

  // ── Training ─────────────────────────────────────────────────────────────
  train_eyebrow: 'Adaptive Training',
  train_title: 'Personalized Training',
  train_desc: 'Recommendations update automatically as your scores and past decisions change.',
  train_loading: 'Building your personalized training plan...',
  train_no_scenarios: 'No scenarios available at this level yet.',
  train_practice: 'Practice →',
  train_view_profile: 'View full vulnerability profile →',
  train_section: (cat) => `${cat} Training`,

  // ── Emergency ────────────────────────────────────────────────────────────
  em_heading: 'I THINK I AM BEING SCAMMED',
  em_sub: 'Stay calm. Select what happened for immediate guidance.',
  em_disclaimer: 'This guidance is general information, not a substitute for advice from your bank, service provider, or local authorities.',
  em_back: 'Back',
  em_sent_money: 'I sent money',
  em_clicked_link: 'I clicked a suspicious link',
  em_shared_info: 'I shared sensitive information',
  em_installed_app: 'I installed an unknown app',
  em_suspicious_call: 'I received a suspicious call',
  em_account_compromised: 'My account may be compromised',
  em_wallet_compromised: 'My wallet may be compromised',
  em_steps: {
    sent_money: [
      'Stop interacting with the suspected scammer.',
      'Do not share additional information or send more money.',
      'Contact your bank/payment provider immediately using their official app or the number on your card.',
      'Preserve screenshots and transaction details.',
      "File a report through your country's official cybercrime reporting channel.",
    ],
    clicked_link: [
      'Do not enter any personal or banking details on the page if you have not already.',
      'Close the browser tab/app.',
      'Run a security scan on your device if possible.',
      'Change passwords for any account you may have entered, from a separate, trusted device.',
    ],
    shared_info: [
      'Stop interacting with the suspected scammer.',
      'Change passwords immediately from a trusted device.',
      'Enable two-factor authentication where possible.',
      'Contact the relevant service provider using official contact information.',
    ],
    installed_app: [
      'Disconnect the device from the internet if you suspect malware.',
      'Uninstall the unknown app.',
      'Run a trusted antivirus/security scan.',
      'Change important passwords from a different, trusted device.',
    ],
    suspicious_call: [
      'Do not share OTPs, passwords, or personal details.',
      'Hang up if pressure or urgency is being used.',
      'Verify by calling the organization back using an official number you find independently.',
    ],
    account_compromised: [
      'Change your password immediately.',
      'Enable two-factor authentication.',
      "Contact the service provider's official support.",
      'Review recent account activity for unauthorized actions.',
    ],
    wallet_compromised: [
      'Disconnect your wallet from any suspicious website immediately.',
      'Review and revoke suspicious token approvals using a trusted revocation tool.',
      'Never share your recovery phrase or private key with anyone, ever.',
      'If assets remain, consider moving them to a new, secure wallet only after you understand the situation and using a trusted process.',
    ],
  },

  // ── URL Detector ─────────────────────────────────────────────────────────
  url_eyebrow: 'Detection Tools',
  url_title: 'URL Phishing Detector',
  url_desc: 'Paste a suspicious link below. We analyze its structure only — we never visit the link.',
  url_placeholder: 'e.g. http://paypal-verify-account.tk/login',
  url_btn: 'Check',
  url_checking: 'Checking...',
  url_error: 'Could not analyze this URL',
  url_risk_score: 'Risk Score',

  // ── Message Detector ──────────────────────────────────────────────────────
  msg_eyebrow: 'Detection Tools',
  msg_title: 'Message Scam Detector',
  msg_desc: 'Paste an SMS, email, or WhatsApp message to check for common scam red flags.',
  msg_placeholder: 'Paste the message here...',
  msg_btn: 'Analyze Message',
  msg_checking: 'Checking...',
  msg_error: 'Could not analyze this message',
  msg_risk_score: 'Risk Score',
  msg_red_flags: 'Detected red flags:',

  // ── Wallet Checker ───────────────────────────────────────────────────────
  wallet_eyebrow: 'Detection Tools',
  wallet_title: 'Wallet Risk Checker',
  wallet_desc: 'Enter a blockchain wallet address to check for known scam associations in our threat registry.',
  wallet_placeholder: '0x... wallet address',
  wallet_btn: 'Check Wallet',
  wallet_checking: 'Checking...',

  // ── Report Threat ────────────────────────────────────────────────────────
  report_eyebrow: 'Community Intelligence',
  report_title: 'Report a Threat',
  report_desc: 'Help the community by reporting a scam. Reports are reviewed before appearing in the public registry.',
  report_type: 'Threat Type',
  report_value: 'Value (URL, phone number, wallet address…)',
  report_details: 'Description / additional details (optional)',
  report_btn: 'Submit Report',
  report_submitting: 'Submitting...',

  // ── Threat Registry ──────────────────────────────────────────────────────
  registry_eyebrow: 'Threat Intelligence',
  registry_title: 'Threat Registry',
  registry_desc: 'Community-reported threats. Only reviewed reports appear here — a "verified" status reflects reviewer confirmation, not an absolute guarantee.',
  registry_check_placeholder: 'Check a wallet address, URL, phone number...',
  registry_check_btn: 'Check',
  registry_no_threats: 'No reviewed threats yet.',
  registry_details: 'Details',
  registry_hide: 'Hide',
  registry_on_chain: '⛓ On-chain',

  // ── Vulnerability Profile ────────────────────────────────────────────────
  vuln_eyebrow: 'Self-Awareness',
  vuln_title: 'Vulnerability Profile',
  vuln_desc: 'Built from your simulation decisions. Shows which psychological triggers you are most susceptible to.',

  // ── Certificate ──────────────────────────────────────────────────────────
  cert_eyebrow: 'Achievements',
  cert_title: 'Your Certificate',
  cert_desc: 'Earn a Scam Awareness Certificate by completing simulations and building your safety score.',

  // ── Common ───────────────────────────────────────────────────────────────
  loading: 'Loading...',
  back: 'Back',
  close: 'Close',
  submit: 'Submit',
  error_generic: 'Something went wrong. Please try again.',
};

export default en;
