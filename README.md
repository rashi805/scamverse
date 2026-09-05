# SCAMVERSE 360
**Experience the scam before the scammer finds you.**

A blockchain-powered financial & Web3 scam simulator, awareness, and threat-intelligence platform.

> ⚠️ All 5 phases of the original spec (Core MVP → Web3 simulator/adaptive training → detection → blockchain → evidence/certificates/admin) are implemented end to end — see the phase-by-phase notes below for what each one covers and how to enable the optional pieces (blockchain, real IPFS).
> All simulations use mock, clearly-labeled, educational content only. No real credential capture,
> OTP collection, or financial transactions are ever performed.

---

## Recent fixes & UI update

**Auth/session bug fixed:** previously, `AuthContext` cleared the token and logged the user out on *any* failure of the `/auth/me` check — including transient network errors or a slow-to-wake backend — which is what caused "refresh sends me back to login." Now:
- The session (JWT + last-known user object) is cached in `localStorage` and hydrated **synchronously** on load, so a refresh shows the authenticated app immediately with no flash or redirect.
- The session is only cleared on a genuine `401`/`403` from the server (handled both in `AuthContext`'s background re-verification and via a global axios response interceptor in `services/api.js`). Network errors, timeouts, or 5xx responses leave the cached session intact.

**UI restyle:** the whole authenticated app now uses a dark command-center layout (fixed left sidebar with grouped navigation, stat-tile rows, and priority/status cards with colored risk badges) — see `components/Sidebar.jsx`, `components/PageHeader.jsx`, `components/StatCard.jsx`, and `components/PriorityCard.jsx`. Public pages (landing/login/signup) keep a simple top bar. `App.jsx` switches between the two shells based on auth state.

---

## Phase 4 additions (now included)

- **`backend/src/blockchain/blockchainService.js`** — an `ethers.js` service wrapping the deployed `ScamThreatRegistry` contract. It fails **safe**: if `BLOCKCHAIN_RPC_URL` / `BLOCKCHAIN_PRIVATE_KEY` / `THREAT_REGISTRY_CONTRACT_ADDRESS` aren't set, every call no-ops and the platform keeps working exactly as in Phases 1–3, entirely off-chain.
- **`registerThreat`** — called automatically from `POST /api/threats/report`. Derives a deterministic on-chain `threatId` from the MongoDB `_id` (keccak256) and registers the existing SHA-256 `threatHash` on-chain, storing the returned `threatId` back onto the Mongo record as `blockchainThreatId`.
- **`updateStatus`** — called automatically from `PATCH /api/threats/:id/status`, mirroring lifecycle changes (verify/revoke/other) on-chain whenever a report has a `blockchainThreatId`.
- **`GET /api/threats/:id/chain-record`** (new) — compares the off-chain MongoDB record against the on-chain record: current on-chain status, whether the on-chain hash matches the stored hash, and the full on-chain status history.
- **One server-side signer wallet** submits all transactions on behalf of the platform (users don't need MetaMask for every report). That wallet should be the contract's deployer (admin) or a wallet the admin granted the Verifier role to via `addVerifier()`.
- **Frontend**: Report a Threat shows an "⛓ Registered on-chain" confirmation; the Threat Registry shows an on-chain badge per report and a "Details" toggle that fetches the live chain record (status, hash match, status-change count).

### Deploying and connecting the contract

```bash
cd blockchain
npm install
npx hardhat node                       # terminal 1: local EVM node
npm run deploy:localhost                # terminal 2: deploys, prints the contract address
```

Then in `backend/.env`, set:
```
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
BLOCKCHAIN_PRIVATE_KEY=<private key of one of the Hardhat node's local accounts>
THREAT_REGISTRY_CONTRACT_ADDRESS=<address printed by the deploy script>
```
Restart the backend — new threat reports will now register on-chain automatically.

> Note: compiling/testing the Solidity contract requires downloading the `solc` compiler binary from `binaries.soliditylang.org`, which this sandbox's network policy doesn't allow — that's an environment restriction here, not a code issue. `npx hardhat compile` / `npm test` inside `blockchain/` will work normally in a regular development environment with internet access. The contract and its existing test suite (`blockchain/test/ScamThreatRegistry.test.js`) were reviewed for correctness but could not be executed in this sandbox.

## Phase 3 additions (now included)

- **URL Phishing Detector** (`POST /api/detectors/url`): rule-based, fully offline analysis — HTTPS check, URL length, IP-as-domain, punycode, excessive subdomains/hyphens, suspicious keywords, `@` disguise trick, and a brand-impersonation heuristic (Levenshtein distance against known brand names). Returns a 0–100 risk score, LOW/MEDIUM/HIGH RISK label, and plain-language reasons. Never visits the link.
- **Message Scam Detector** (`POST /api/detectors/message`): pattern-based detection of urgency, fear/threats, OTP requests, payment requests, fake-authority framing, guaranteed-returns language, suspicious/shortened links, credential requests, and emotional manipulation. Same scoring/label format as the URL detector.
- **Threat Reporting** (`POST /api/threats/report`): users report phishing URLs, scam phone numbers, fake UPI IDs, fake emails, scam domains, or crypto wallet addresses. Every report is SHA-256 hashed (normalized `type:value`) immediately and registered on-chain when Phase 4 is configured, and starts at `pending`, never auto-published as verified.
- **Threat Lifecycle**: `pending → suspicious → verified → expired/revoked/archived`, with a full status history array on each report (`PATCH /api/threats/:id/status`, restricted to `verifier`/`admin` roles).
- **Reporter Reputation**: increases when a report is verified, decreases when revoked/archived — used only to prioritize review, never treated as proof.
- **Threat Registry & Wallet/URL Checker** (`GET /api/threats/registry`, `GET /api/threats/check`): browse reviewed threats and check any value (wallet address, URL, phone number, etc.) against the registry.
- **4 new frontend pages**: URL Detector, Message Detector, Report a Threat, and Threat Registry — all cross-linked.

## Phase 2 additions (now included)

- **Full Web3 scam simulator**: fake airdrop, fake wallet support (recovery phrase request), wallet drainer (malicious token approval), fake NFT giveaway, fake crypto exchange, and a wallet-permissions awareness scenario — 6 Web3 scenarios total
- **Psychological trigger tracking**: every scenario is tagged with the manipulation tactics it uses (fear, urgency, authority, greed, curiosity, sympathy); the vulnerability engine now updates a live exposure percentage per trigger based on real decisions
- **Adaptive training engine** (`GET /api/training/recommendations`): identifies your highest-risk categories, recommends a difficulty level using an explainable rule (score ≤40 → beginner ... score >85 → expert), and surfaces matching scenarios; recommendations are persisted so they don't reset
- **Vulnerability Profile page** (frontend): high/medium/low risk categories plus a live bar chart of psychological trigger exposure
- **Training page** (frontend): shows the adaptive recommendations with reasons in plain language

## Phase 5 additions (now included)

- **Evidence Integrity Verification** (Module 16): `POST /api/evidence/upload` (multipart) hashes every uploaded file with SHA-256 immediately. Sensitive evidence (the default) is AES-256-GCM encrypted and written to a private, never-served directory (`backend/secure-evidence-store/`); non-sensitive evidence goes through the IPFS mock instead. Only the **hash** — never the file — is registered on-chain via the same Phase 4 `blockchainService`. `POST /api/evidence/:id/verify` lets you re-upload a file later to confirm `VALID` (hash matches) or `MISMATCH` (file changed or different file). Frontend: **Evidence Vault** page.
- **IPFS Storage** (Module 20): `backend/src/services/ipfsService.js` supports a mock mode (default — derives a CID-shaped identifier from the content hash, no real network call) and a real mode (see Polish pass below for enabling a real Kubo/IPFS node). Sensitive files never touch this path — that gate is enforced server-side in `evidenceController.js`, not left to client trust.
- **Blockchain Certificates** (Module 18): `POST /api/certificates/generate` checks eligibility against an explainable ladder (simulations completed + overall score → beginner/intermediate/advanced/expert), hashes the certificate payload, and registers that hash on-chain via the same generic threat-registry mechanism used for threats and evidence. `GET /api/certificates/verify/:certificateId` is a fully **public**, unauthenticated endpoint that returns `VALID`/`NOT FOUND` plus level/score/on-chain hash match — no personal data exposed. Frontend: **Certificate** page (generate/view yours) and a public **Certificate Verification** page reachable without logging in.
- **Web3 Wallet Threat Checker** (Module 19): reuses the Phase 3 `GET /api/threats/check` endpoint — the underlying logic (does this value appear in the registry?) is identical whether the value is a wallet address, URL, or phone number. Frontend: **Wallet Checker** page with Web3-specific framing and caveats ("no match doesn't guarantee safety").
- **Admin Dashboard** (Module 32): `GET /api/admin/analytics` (user/simulation/report counts, most-practiced categories, average category scores across all users), scenario CRUD (soft-delete via `isActive` so historical sessions stay valid), full report management with lifecycle status buttons (mirrors on-chain automatically via Phase 4), and user/verifier management (promoting a user to `verifier` also grants the role on-chain if they've linked a wallet). All routes require the `admin` role. Frontend: **Admin Dashboard** page with tabs, only visible in the sidebar to admins, with a frontend `AdminRoute` guard as a second layer on top of the backend's own role check.

## Polish pass (now included)

- **Pagination**: `GET /api/threats/registry`, `GET /api/admin/scenarios`, `GET /api/admin/reports`, and `GET /api/admin/users` now accept `?page=&limit=` and return a consistent `{ data, pagination: { page, limit, total, totalPages, hasMore } }` shape (`backend/src/utils/pagination.js`). Frontend: Threat Registry and every Admin Dashboard tab use a shared `LoadMoreButton` component that appends results incrementally.
- **Hardened evidence upload validation** (`backend/src/utils/fileValidation.js`): client-supplied MIME types and extensions are trivially spoofable, so uploads are verified by inspecting the file's actual magic bytes against an allowlist (JPEG/PNG/GIF/WebP/PDF/plain text). An executable renamed to `.png` is rejected — verified with a real test using an `MZ`-header buffer disguised with a `.png` extension. Everything else (scripts, archives, Office macro formats) is rejected outright rather than sanitized.
- **Real IPFS client (optional)** (`backend/src/services/ipfsService.js`): setting `IPFS_API_URL` to a running Kubo/IPFS HTTP API endpoint pins non-sensitive evidence for real via `/api/v0/add`; leaving it unset keeps the original mock. If a real node is configured but unreachable, it fails safe and falls back to the mock automatically (verified: pointed at a closed port, got a clean mock fallback + logged warning, no crash) — the frontend distinguishes "IPFS" vs "IPFS (mock)" per record.

## What's implemented right now (Phase 1)

- **Auth**: signup, login, guest mode, JWT, bcrypt password hashing, onboarding (user category, age group, digital experience level)
- **Dashboard**: overall safety score, per-category scores, strong/weak areas, recent simulations
- **Interactive Scam Simulator**: banking, digital payment, phishing, investment, and Web3 mock scenarios, including a multi-stage attack chain (SMS → fake website → call)
- **Decision Evaluation Engine**: every decision produces an explainable +/- score with a plain-language reason
- **Awareness Score Engine**: per-category scores (0–100) using an explainable exponential-moving-average update, plus an overall score
- **Personal Vulnerability Profile endpoint**: categorizes the user's high/medium/low risk areas from their scores
- **Emergency Response page**: "I think I am being scammed" flow with situation-specific guidance
- **Security basics**: helmet, CORS, rate limiting, input validation, no sensitive data ever requested in simulations

## Notes on optional/pluggable pieces

- `blockchain/contracts/ScamThreatRegistry.sol` — Solidity contract with role-based access (Admin/Verifier/Reporter), threat lifecycle, and history tracking (Phase 4). Has a full Hardhat test suite (`blockchain/test/`); see the Phase 4 section above for compiling/deploying.
- `backend/src/blockchain/blockchainService.js` — the `ethers.js` service layer that calls the deployed contract. Fails safe (no-ops) if not configured, so the rest of the app works without it.
- `backend/src/services/ipfsService.js` — real-or-mock IPFS pinning, toggled by `IPFS_API_URL` (see Polish pass above).
- All MongoDB collections listed above are modeled and in active use; nothing is stubbed out.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router + Axios + Ethers.js |
| Backend | Node.js + Express + JWT + bcrypt + Mongoose |
| Database | MongoDB |
| Blockchain (scaffold) | Solidity + Hardhat + Ethers.js + MetaMask |

---

## Getting started

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally (or an Atlas connection string)

### 2. Backend

```bash
cd backend
cp .env.example .env      # edit MONGO_URI / JWT_SECRET if needed
npm install
npm run seed               # loads mock scam scenarios into MongoDB
npm run dev                 # starts API on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS config is needed locally beyond what's already in `backend/src/server.js`.

### 4. Try it out
1. Open http://localhost:5173
2. Sign up (or continue as guest)
3. Complete onboarding
4. Go to **Simulator**, pick a scenario, make decisions
5. Check your **Dashboard** for updated scores
6. Try the **🚨 Emergency** button

---

## API endpoints (Phase 1)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/guest` | No | Guest session |
| GET | `/api/auth/me` | Yes | Current user |
| POST | `/api/auth/onboarding` | Yes | Save onboarding info |
| POST | `/api/auth/wallet` | Yes | Link MetaMask address (optional) |
| GET | `/api/simulations` | Yes | List scenarios (filter by `category`, `difficulty`) |
| POST | `/api/simulations/:id/start` | Yes | Start a simulation session |
| POST | `/api/simulations/session/:sessionId/decide` | Yes | Submit a decision, get evaluation + next step |
| GET | `/api/dashboard` | Yes | Dashboard summary |
| GET | `/api/dashboard/vulnerability-profile` | Yes | High/medium/low risk category breakdown |
| GET | `/api/training/recommendations` | Yes | Adaptive training plan (Phase 2) |
| POST | `/api/detectors/url` | Yes | URL phishing risk analysis (Phase 3) |
| POST | `/api/detectors/message` | Yes | Message scam risk analysis (Phase 3) |
| POST | `/api/threats/report` | Yes | Submit a threat report (Phase 3) |
| GET | `/api/threats/my-reports` | Yes | Reports submitted by the current user |
| GET | `/api/threats/registry?page=&limit=` | Yes | Browse verified/suspicious threats (paginated) |
| GET | `/api/threats/check` | Yes | Check a value against the registry |
| PATCH | `/api/threats/:id/status` | Verifier/Admin | Update a threat's lifecycle status (mirrors on-chain if configured) |
| GET | `/api/threats/:id/chain-record` | Yes | Compare off-chain vs on-chain record (Phase 4) |
| POST | `/api/evidence/upload` | Yes | Upload & hash evidence (multipart, Phase 5) |
| GET | `/api/evidence/mine` | Yes | List your evidence records |
| POST | `/api/evidence/:id/verify` | Yes | Re-upload a file to check hash integrity (multipart) |
| POST | `/api/certificates/generate` | Yes | Generate/refresh your awareness certificate |
| GET | `/api/certificates/mine` | Yes | List your certificates |
| GET | `/api/certificates/verify/:certificateId` | **No auth** | Public certificate verification |
| GET | `/api/threats/check` (reused) | Yes | Wallet/Web3 threat check (same endpoint as URL/value check) |
| GET | `/api/admin/analytics` | Admin | Platform-wide analytics |
| GET/POST/PUT/DELETE | `/api/admin/scenarios?page=&limit=` | Admin | Scenario CRUD, paginated list (delete = soft deactivate) |
| GET | `/api/admin/reports?page=&limit=` | Admin | All threat reports regardless of status (paginated) |
| GET | `/api/admin/users?page=&limit=` | Admin | List users (paginated) |
| PATCH | `/api/admin/users/:id/role` | Admin | Change a user's role (also grants on-chain verifier if wallet linked) |

---

## MongoDB collections

Implemented now: `Users`, `ScamScenarios`, `SimulationSessions`, `UserDecisions`, `AwarenessScores`, `TrainingRecommendations`, `ThreatReports`, `Evidence`, `Certificates`.

To add in later refinement (same pattern — Mongoose schema + controller + routes):
`VulnerabilityProfiles` (currently computed on the fly, can be persisted), `EmergencySessions` (the Emergency page is currently stateless client-side guidance; persisting sessions would enable follow-up support or analytics).

---

## Roadmap (matches the original spec's phases)

- **Phase 1 — Core MVP** ✅ done (this repo)
- **Phase 2 — Unique features** ✅ done (this update): multi-stage attack chains, personal vulnerability + psychological trigger engine, adaptive training difficulty recommendations, full Web3 scam simulator
- **Phase 3 — Detection** ✅ done (this update): URL phishing detector, message scam detector, threat reporting flow, threat lifecycle, reporter reputation, threat registry & wallet/URL checker
- **Phase 4 — Blockchain** ✅ done (this update): `ScamThreatRegistry.sol` (already scaffolded) is now wired up via an `ethers.js` service (`backend/src/blockchain/blockchainService.js`); every threat report registers on-chain and status changes sync automatically when the blockchain layer is configured, with graceful no-op fallback when it isn't
- **Phase 5 — Advanced** ✅ done (this update): evidence SHA-256 hash verification with encrypted off-chain storage, mock IPFS integration for non-sensitive content, blockchain-verifiable certificates with a public verification page, wallet/Web3 threat checker, and an admin analytics dashboard

**All 5 phases from the original roadmap are now implemented end to end.** What remains is polish rather than new modules: replacing the IPFS mock with a real client, hardening file-upload limits/AV scanning for evidence, adding pagination to the admin/registry lists, and wiring MetaMask connect flows in the frontend for users who want to sign transactions themselves instead of relying on the server-side signer wallet.

---

## Security notes

- Passwords hashed with bcrypt (cost factor 12)
- JWT-based auth with expiry
- Rate limiting on auth endpoints and globally
- Helmet for HTTP security headers
- No real OTPs, passwords, seed phrases, or private keys are ever requested by any simulation — this is enforced by design (scenario content is static, developer-authored data, not user input)
- Blockchain layer (when implemented) must only ever store hashes/metadata, never raw evidence or personal data — see comments in `ScamThreatRegistry.sol`
