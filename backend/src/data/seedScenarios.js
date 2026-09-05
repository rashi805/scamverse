/**
 * Seed script - populates ScamScenario collection with mock, safe,
 * educational scenarios. No real scam functionality is created here;
 * all narratives are simulation-only content for training purposes.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const ScamScenario = require('../models/ScamScenario');

const scenarios = [
  {
    title: 'Suspicious OTP Request',
    category: 'banking',
    subType: 'otp_scam',
    difficulty: 'beginner',
    triggerTags: ['fear', 'urgency', 'authority'],
    description: 'A caller claims to be from your bank and asks for an OTP to "verify" your account.',
    redFlagsSummary: [
      'Banks never ask you to share an OTP over a call.',
      'Urgency and fear were used to pressure a quick decision.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'call',
        narrative:
          '"This is Rohan from your bank\'s security team. We noticed suspicious activity on your account. Please share the OTP you just received so we can block the transaction immediately."',
        options: [
          {
            optionId: 'a',
            text: 'Share the OTP immediately to stop the transaction.',
            isSafe: false,
            isRisky: true,
            explanation:
              'Banks never ask for your OTP over a phone call. Sharing it gives the caller full access to authorize a transaction.',
          },
          {
            optionId: 'b',
            text: 'Hang up and call your bank using the number on your card or official app.',
            isSafe: true,
            isRisky: false,
            explanation:
              'Correct. Verifying through an official, independently-sourced number is the safe way to confirm if there is a real issue.',
          },
          {
            optionId: 'c',
            text: 'Ask the caller to prove their identity, then share the OTP.',
            isSafe: false,
            isRisky: true,
            explanation:
              'Scammers can easily fake employee IDs or names. The OTP itself should never be shared regardless of who is asking.',
          },
        ],
      },
    ],
  },
  {
    title: 'Unexpected UPI Collect Request',
    category: 'digital_payment',
    subType: 'upi_request_scam',
    difficulty: 'beginner',
    triggerTags: ['greed', 'curiosity'],
    description: 'You receive a UPI collect request claiming to be a refund that requires you to "accept" and enter your PIN.',
    redFlagsSummary: [
      'Entering your UPI PIN on a "collect" request SENDS money, it never receives it.',
      'Refunds never require you to enter your PIN.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'app',
        narrative:
          'You get a notification: "You have a payment request for ₹1 from \'Refund Team\'. Approve to receive your refund."',
        options: [
          {
            optionId: 'a',
            text: 'Approve the request and enter your UPI PIN to get the refund.',
            isSafe: false,
            isRisky: true,
            explanation:
              'This is a classic UPI collect scam. Entering your PIN on a "collect" request authorizes YOU to pay, not receive money.',
          },
          {
            optionId: 'b',
            text: 'Decline the request and check your bank app directly for any real refund.',
            isSafe: true,
            isRisky: false,
            explanation:
              'Correct. Real refunds appear automatically in your account; they never require you to approve a request or enter a PIN.',
          },
        ],
      },
    ],
  },
  {
    title: 'Fake Login Page via Email Link',
    category: 'phishing',
    subType: 'fake_login_page',
    difficulty: 'basic',
    triggerTags: ['fear', 'urgency'],
    description: 'An email claims your account will be suspended unless you "verify" by logging in through a link.',
    redFlagsSummary: [
      'Check the actual URL before entering credentials anywhere.',
      'Urgency ("account will be suspended") is a common manipulation tactic.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'email',
        narrative:
          'Subject: "Action Required: Your account will be suspended in 24 hours." The email contains a "Verify Now" button linking to a login-style page.',
        options: [
          {
            optionId: 'a',
            text: 'Click the link and log in right away to avoid suspension.',
            isSafe: false,
            isRisky: true,
            explanation: 'This risks entering credentials on a fake page designed to steal your login details.',
          },
          {
            optionId: 'b',
            text: 'Go directly to the official website/app (not via the email link) to check your account status.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Navigating independently avoids exposing credentials to a potential fake page.',
          },
        ],
      },
    ],
  },
  {
    title: '"Guaranteed 200% Returns" Investment Group',
    category: 'investment',
    subType: 'guaranteed_returns',
    difficulty: 'intermediate',
    triggerTags: ['greed', 'urgency'],
    description: 'A social media message invites you to a "VIP trading group" promising guaranteed high returns.',
    redFlagsSummary: [
      'No legitimate investment can guarantee high fixed returns.',
      'Pressure to invest quickly and recruit others is a classic Ponzi pattern.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'social_media',
        narrative:
          '"Join our VIP group! Guaranteed 200% returns in 30 days. Limited slots left, invest now and double your money."',
        options: [
          {
            optionId: 'a',
            text: 'Invest a small "test" amount to see if it works.',
            isSafe: false,
            isRisky: true,
            explanation: 'Scammers often let early "test" amounts appear to profit to build trust before larger losses.',
          },
          {
            optionId: 'b',
            text: 'Research the platform independently and check for regulatory registration before considering it.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Guaranteed high returns are a major red flag; verify regulatory status independently first.',
          },
        ],
      },
    ],
  },
  {
    title: 'Fake Airdrop — Connect Your Wallet',
    category: 'web3',
    subType: 'fake_airdrop',
    difficulty: 'basic',
    triggerTags: ['greed', 'urgency', 'curiosity'],
    description: 'A pop-up claims you have won free tokens and asks you to connect your wallet to claim them.',
    redFlagsSummary: [
      'Legitimate airdrops never require connecting your wallet to an unknown site first.',
      'Verify project sources through official channels only.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'website',
        narrative:
          '"Congratulations! You have been selected for a free token airdrop. Connect your wallet now to claim before it expires."',
        options: [
          {
            optionId: 'a',
            text: 'Connect your wallet immediately to claim the tokens before time runs out.',
            isSafe: false,
            isRisky: true,
            explanation:
              'Fake airdrop sites often use urgency to get you to connect your wallet, then request token approvals that drain funds.',
          },
          {
            optionId: 'b',
            text: 'Verify the airdrop on the project\'s official website/socials before connecting anything.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Always verify legitimacy through official, independently-found channels first.',
          },
        ],
      },
    ],
  },
  {
    title: 'Multi-Stage: SMS → Fake Website → Call (Banking Chain)',
    category: 'banking',
    subType: 'account_blocking_scam',
    difficulty: 'advanced',
    isMultiStage: true,
    triggerTags: ['fear', 'urgency', 'authority'],
    description: 'A realistic multi-step attack chain simulating account blocking scam escalation.',
    redFlagsSummary: [
      'Multi-channel pressure (SMS + website + call) is a common escalation tactic.',
      'Never enter banking credentials on a link received via SMS.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'sms',
        narrative: '"Your account will be BLOCKED today. Update your KYC immediately: bit.ly/kyc-update-now"',
        options: [
          {
            optionId: 'a',
            text: 'Click the link to update KYC.',
            isSafe: false,
            isRisky: true,
            explanation: 'Shortened, unofficial links in unsolicited SMS are a major red flag.',
            nextStepId: 's2',
          },
          {
            optionId: 'b',
            text: 'Ignore the SMS and check your account status via the official app.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. This safely ends the attack chain before any risk is introduced.',
            nextStepId: null,
          },
        ],
      },
      {
        stepId: 's2',
        channel: 'website',
        narrative: 'The link opens a page that looks like your bank\'s site, asking for your net banking ID and password.',
        options: [
          {
            optionId: 'a',
            text: 'Enter your net banking ID and password.',
            isSafe: false,
            isRisky: true,
            explanation: 'This would hand over your credentials directly to attackers on a fake page.',
            nextStepId: 's3',
          },
          {
            optionId: 'b',
            text: 'Notice the URL looks wrong and close the page.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Checking the URL before entering any credentials stops the chain here safely.',
            nextStepId: null,
          },
        ],
      },
      {
        stepId: 's3',
        channel: 'call',
        narrative: 'Shortly after, you get a call: "This is bank support, please share the OTP to complete your KYC update."',
        options: [
          {
            optionId: 'a',
            text: 'Share the OTP to finish the "KYC update".',
            isSafe: false,
            isRisky: true,
            explanation: 'This is the final step of the attack — sharing the OTP now would let attackers complete a takeover.',
            nextStepId: null,
          },
          {
            optionId: 'b',
            text: 'Refuse, hang up, and report the incident / call your bank\'s official helpline.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct — even at this late stage, refusing and reporting limits the damage.',
            nextStepId: null,
          },
        ],
      },
    ],
  },
  {
    title: 'Fake Wallet Support — "Enter Your Recovery Phrase"',
    category: 'web3',
    subType: 'fake_wallet_support',
    difficulty: 'basic',
    triggerTags: ['fear', 'urgency', 'authority'],
    description: 'A message posing as wallet support claims your wallet is compromised and asks for your recovery phrase.',
    redFlagsSummary: [
      'No legitimate wallet provider or support agent will ever ask for your seed phrase, recovery phrase, or private key.',
      'Anyone with your recovery phrase has complete, irreversible control of your funds.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'whatsapp',
        narrative:
          '"This is MetaMask Support. We detected a security issue with your wallet. Please enter your 12-word recovery phrase here so we can restore and secure your wallet."',
        options: [
          {
            optionId: 'a',
            text: 'Send the 12-word recovery phrase to fix the issue.',
            isSafe: false,
            isRisky: true,
            explanation:
              'This immediately and irreversibly hands over full control of the wallet to the attacker. No legitimate support ever needs your recovery phrase.',
          },
          {
            optionId: 'b',
            text: 'Refuse, and contact support only through the official app or verified website.',
            isSafe: true,
            isRisky: false,
            explanation:
              'Correct. Recovery phrases, seed phrases, and private keys should never be shared with anyone, under any circumstance.',
          },
        ],
      },
    ],
  },
  {
    title: 'Wallet Drainer Website',
    category: 'web3',
    subType: 'wallet_drainer',
    difficulty: 'intermediate',
    triggerTags: ['greed', 'urgency', 'curiosity'],
    description: 'A flashy website asks you to connect your wallet and approve a "claim" transaction that actually grants token spending permission to the attacker.',
    redFlagsSummary: [
      'Understand what you are signing: connecting a wallet, signing a message, and approving a token spend are three very different actions.',
      'Unlimited token approvals to an unknown contract are a common way wallets get drained.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'website',
        narrative:
          'The site says: "Claim your reward! Connect your wallet and approve the transaction to receive 500 free tokens." The approval popup shows an unusually high/unlimited spending limit.',
        options: [
          {
            optionId: 'a',
            text: 'Connect the wallet and approve the transaction to get the reward.',
            isSafe: false,
            isRisky: true,
            explanation:
              'Approving an unlimited/unusual token allowance to an unverified contract lets the attacker drain those tokens from the wallet at any time in the future.',
          },
          {
            optionId: 'b',
            text: 'Check the permission details, see the unlimited approval request, and reject it.',
            isSafe: true,
            isRisky: false,
            explanation:
              'Correct. Always inspect exactly what a transaction is asking to approve before signing; unlimited approvals to unknown contracts should be rejected.',
          },
        ],
      },
    ],
  },
  {
    title: 'Fake NFT Giveaway',
    category: 'web3',
    subType: 'fake_nft_giveaway',
    difficulty: 'basic',
    triggerTags: ['greed', 'curiosity', 'urgency'],
    description: 'A social media post claims a celebrity or project is giving away free NFTs to the first users who connect their wallet and pay a small "gas fee" to an address.',
    redFlagsSummary: [
      'Legitimate giveaways never require you to send crypto first to "unlock" a reward.',
      'Verify official announcements only through a project\'s verified account or website.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'social_media',
        narrative:
          '"🎉 FREE NFT GIVEAWAY! First 100 wallets to send 0.01 ETH to this address get a free NFT worth $500 back instantly!"',
        options: [
          {
            optionId: 'a',
            text: 'Send 0.01 ETH quickly to be among the first 100.',
            isSafe: false,
            isRisky: true,
            explanation:
              'This is a pay-to-win advance-fee scam. No legitimate giveaway requires you to send crypto first, and the "instant refund" never arrives.',
          },
          {
            optionId: 'b',
            text: 'Ignore it and check the project\'s official, verified channels for any real giveaway.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Any giveaway that asks you to pay first is a scam, regardless of who it claims to be from.',
          },
        ],
      },
    ],
  },
  {
    title: 'Fake Crypto Exchange',
    category: 'web3',
    subType: 'fake_exchange',
    difficulty: 'intermediate',
    triggerTags: ['greed', 'urgency'],
    description: 'An ad leads to a crypto exchange website that looks legitimate but is a clone designed to capture deposits and login credentials.',
    redFlagsSummary: [
      'Always verify exchange URLs directly rather than clicking ad links.',
      'Check for the exchange\'s official app store listing and regulatory registration.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'website',
        narrative:
          'You click an ad promising "0% trading fees this week only" and land on a page that looks like a well-known exchange, asking you to deposit funds to "activate" your account.',
        options: [
          {
            optionId: 'a',
            text: 'Deposit funds to activate the account and claim the fee offer.',
            isSafe: false,
            isRisky: true,
            explanation: 'Clone exchange sites are built specifically to capture deposits that can never be withdrawn.',
          },
          {
            optionId: 'b',
            text: 'Close the page and navigate to the exchange by typing its official URL directly.',
            isSafe: true,
            isRisky: false,
            explanation: 'Correct. Independently navigating to a known, official URL avoids clone/phishing sites entirely.',
          },
        ],
      },
    ],
  },
  {
    title: 'Understanding Wallet Permissions',
    category: 'web3',
    subType: 'malicious_approval_awareness',
    difficulty: 'advanced',
    triggerTags: ['curiosity'],
    description: 'A dApp requests several different wallet actions in sequence. Practice telling the difference between them.',
    redFlagsSummary: [
      'Connecting a wallet only shares your public address — it cannot move funds by itself.',
      'Signing a message is usually safe for login, but signing a transaction or approval can move funds or grant spending rights.',
      'Always read exactly what a transaction/approval popup says before confirming.',
    ],
    steps: [
      {
        stepId: 's1',
        channel: 'app',
        narrative:
          'A dApp first asks to "Connect Wallet" (just to view your address), then later asks you to "Approve" a token contract with an unusually large/unlimited spending limit for a small purchase.',
        options: [
          {
            optionId: 'a',
            text: 'Since connecting the wallet felt safe, approve the large spending limit too without checking it.',
            isSafe: false,
            isRisky: true,
            explanation:
              'Connecting a wallet and approving a large/unlimited token allowance are very different in risk. The approval step needs its own scrutiny every time.',
          },
          {
            optionId: 'b',
            text: 'Reduce the approval to the exact amount needed for this one purchase, or reject it if the dApp is unfamiliar.',
            isSafe: true,
            isRisky: false,
            explanation:
              'Correct. Limiting token approvals to what is actually needed (or rejecting unfamiliar dApps) is the core defense against wallet drainers.',
          },
        ],
      },
    ],
  },
];

async function seed() {
  await connectDB();
  await ScamScenario.deleteMany({});
  await ScamScenario.insertMany(scenarios);
  console.log(`[SEED] Inserted ${scenarios.length} scenarios.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
