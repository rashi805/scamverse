# SCAMVERSE 360

**Experience the scam before the scammer finds you.**

A web app that teaches people to spot scams through safe, fake simulations — plus tools to check suspicious links/messages, report real scams, and a blockchain-backed threat registry.

---

## What it does

- 🎮 **Simulator** — practice real-looking scam scenarios (banking, UPI, phishing, investment, Web3) and get scored on your choices
- 📊 **Dashboard** — see your safety score and where you're weak/strong
- 🎯 **Adaptive Training** — get personalized practice based on your weak spots
- 🔗 **URL & Message Detectors** — paste a link or message, get a risk score
- 🚩 **Threat Reporting** — report scams; verified ones go on a public registry
- ⛓ **Blockchain** — threat hashes and certificates are optionally recorded on-chain for proof/integrity
- 🔒 **Evidence Vault** — upload proof of a scam; we hash it so you can prove it wasn't tampered with later
- 🎓 **Certificates** — earn a verifiable certificate as your score improves
- 🚨 **Emergency Help** — "I think I'm being scammed" button with step-by-step guidance
- 🛠️ **Admin Dashboard** — manage scenarios, review reports, promote verifiers

---

## Tech stack

| Part | Tech |
|---|---|
| Frontend | React + Vite + Tailwind |
| Backend | Node.js + Express + MongoDB |
| Blockchain | Solidity + Hardhat (optional) |

---

## How to run it

### 1. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed        # loads sample scam scenarios
npm run dev         # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

### 3. Open the app
Go to **http://localhost:5173**, sign up (or continue as guest), and start practicing.

> Blockchain is optional — the app works fully without it. See `README.md` for how to turn it on.

---

## Becoming an admin

1. Sign up normally
2. In MongoDB, run:
   ```js
   db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
   ```
3. Log out and log back in (this refreshes your permissions)
4. An **Admin** link will appear in the sidebar

---

## Project status

All 5 planned phases are built: core training, Web3 scams + adaptive training, scam detectors, blockchain registry, and evidence/certificates/admin tools.

Good for a demo/hackathon/college project as-is. For real-world production use, it would still need: automated tests, a full end-to-end run-through, and security hardening (real secrets, rate-limit tuning, etc.).

For full technical details (API endpoints, database schema, blockchain setup, folder structure), see `README.md`.
