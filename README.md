# Geomacro Arc Risk Call

A minimal, reproducible client for the Geomacro Tameion / Arc Testnet risk-aware business flow.

## What this repo demonstrates

An external agent can ask Geomacro for a bounded business decision before moving funds:

1. describe the country or corridor and payment intent;
2. request a decision from `https://geomacro.live/api/tameion/decision`;
3. inspect the Risk Gate result and policy outcome;
4. stop on `BLOCK`, require approval on `REQUIRE_APPROVAL`, or continue only when the policy allows it;
5. keep the Geomacro Risk Gate itself non-executing (`execution_authorized=false`).

The production Geomacro backend, signed Risk Objects, risk methodology, payment verification and audit service live in the main project. This repository is intentionally a small hackathon-facing reproduction client, not a duplicate backend.

## Tameion positioning

Primary fit: **RFB 4 — Autonomous Business Operator**.

Geomacro acts as a machine-readable economic-risk and policy layer before an autonomous business agent moves value. The Tameion workflow combines country/corridor risk, bounded spending policy, human escalation and Arc Testnet payment verification.

## Quick start

Requirements: Node.js 20+.

```bash
cp .env.example .env
npm install
npm run demo
```

No private key is required for the default risk-call demo. It calls the public Geomacro Tameion decision endpoint only.

## Example

```bash
GEOMACRO_SCENARIO=USA\>CHN \
GEOMACRO_AMOUNT_USDC=1 \
GEOMACRO_POLICY=balanced \
npm run demo
```

The client exits non-zero if the response violates the expected safety boundary or schema.

## Expected safety boundary

The demo requires all of the following:

- HTTP success from the public endpoint;
- an `audit_id`;
- a Tameion status of `AUTO_EXECUTE_READY`, `AWAITING_APPROVAL`, or `BLOCKED`;
- a Risk Gate decision;
- `risk_gate.execution_authorized === false`;
- an agent action of `AUTO_EXECUTE`, `REQUIRE_APPROVAL`, or `BLOCK`.

The agent/business-policy layer may recommend an action, but the underlying Geomacro Risk Gate does not directly authorize execution.

## Live demo

- Geomacro: https://geomacro.live
- Tameion Agent Mode: https://geomacro.live/tameion
- Arc Testnet explorer: https://testnet.arcscan.app

## Repository structure

```text
.
├── .env.example
├── .github/workflows/smoke.yml
├── package.json
└── src/demo.mjs
```

## Security

Do not commit wallet private keys, API secrets or production credentials. The default demo is read/evaluate-only and does not sign or broadcast a payment.

## License

MIT
