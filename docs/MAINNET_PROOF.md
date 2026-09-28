# Arc Mainnet Proof Procedure

This project deliberately separates code verification from wallet signing.

## Before signing

Run:

```bash
npm run demo
```

Proceed only when the command reports:

- Arc mainnet chain ID `5042`;
- a Geomacro audit ID;
- `risk_gate.execution_authorized === false`;
- a known policy action.

## Sign in your own wallet

Create one small, clearly attributable Arc Mainnet transaction using a wallet you control. Do not expose wallet credentials to this repository or CI.

## Verify the public proof

Copy only the public transaction hash and run:

```bash
ARC_PROOF_TX_HASH=0x... npm run mainnet:proof
```

The verifier checks the transaction and successful receipt directly through Arc Mainnet RPC.

## Submission evidence

After verification passes, add the public transaction hash and explorer URL to `SUBMISSION.md`. Until then, the project must not claim a completed onchain mainnet proof.
