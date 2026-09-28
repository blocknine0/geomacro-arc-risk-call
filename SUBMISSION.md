# Arc Microgrants Submission Draft

## Project name

Geomacro Arc Risk Call

## One-line description

A risk checkpoint for autonomous USDC workflows on Arc that lets agents check country and corridor risk before value moves.

## Short description

Geomacro Arc Risk Call connects Geomacro's machine-readable economic risk engine with Arc Mainnet verification. An agent can request a bounded risk decision for a country or payment corridor, receive an explicit allow, approval, or block path, and independently verify that the execution environment is Arc Mainnet.

The important boundary is simple: Geomacro evaluates risk, but it does not hold wallet keys or directly authorize a transaction. Wallet signing stays with the user or execution system.

## What problem does it solve?

Autonomous payment systems can make decisions faster than people can manually review them. A payment may be technically valid while the surrounding country, corridor, or economic conditions have changed.

Geomacro adds a pre-transaction risk layer. It turns macro and corridor context into a structured decision that another system can consume before moving USDC.

## How it works

1. The client sends a payment context and country or corridor to Geomacro.
2. Geomacro returns an audited Risk Gate decision plus a bounded business-policy action.
3. The client rejects any response that tries to cross the non-execution safety boundary.
4. The client verifies Arc Mainnet directly by RPC and requires chain ID 5042.
5. After the wallet owner signs a mainnet transaction, the public transaction hash can be verified directly against Arc and linked as onchain proof.

## Why Arc?

Arc is designed around programmable money and USDC-denominated economic activity. Geomacro is intended for the decision immediately before an agent or business moves value, so Arc is a natural execution network for a risk-aware payment workflow.

## Safety model

Geomacro never receives a wallet signing secret in this project. The Risk Gate returns `execution_authorized=false`, and the client fails closed if that boundary changes. Mainnet transaction signing happens outside this repository in the wallet owner's environment.

## Technical links

- Live product: https://geomacro.live
- Risk workflow: https://geomacro.live/tameion
- GitHub: https://github.com/blocknine0/geomacro-arc-risk-call
- Arc Mainnet explorer: https://explorer.arc.io

## Mainnet proof

Add the verified Arc Mainnet transaction here before final submission:

- Transaction hash: `PENDING_WALLET_SIGNATURE`
- Explorer URL: `PENDING_WALLET_SIGNATURE`

Do not replace these placeholders until `npm run mainnet:proof` passes for the exact hash.

## Reproduce locally

```bash
cp .env.example .env
npm run demo
```

After a mainnet transaction is signed in the owner's wallet:

```bash
ARC_PROOF_TX_HASH=0x... npm run mainnet:proof
```

## Final submission checklist

- [x] Public GitHub repository
- [x] Live Geomacro product
- [x] Arc Mainnet RPC verification
- [x] Automated smoke test
- [x] Non-custodial, no-secret verifier
- [x] Risk Gate safety-boundary assertion
- [ ] Wallet owner signs one small Arc Mainnet transaction
- [ ] `npm run mainnet:proof` passes for that transaction
- [ ] Replace the two proof placeholders above
- [ ] Submit the final project on DoraHacks
