# Architecture

## Trust boundary

Geomacro provides decision context. It does not sign or broadcast Arc transactions.

```text
payment intent
    |
    v
Geomacro risk decision
    |
    +--> BLOCK --------------------------> stop
    |
    +--> REQUIRE_APPROVAL --------------> human / policy approval
    |
    +--> AUTO_EXECUTE ------------------> execution system may continue
                                            |
                                            v
                                      wallet-owned signing
                                            |
                                            v
                                        Arc Mainnet
                                            |
                                            v
                                 public tx hash verification
```

## Components

### Geomacro

The live Geomacro service evaluates country or directional-corridor context and returns an audited Risk Gate result. The client requires `risk_gate.execution_authorized` to remain `false`.

### Arc verifier

The repository calls Arc Mainnet JSON-RPC directly and checks chain ID `5042`. If a public transaction hash is supplied, it verifies that the transaction exists and has a successful receipt.

### Wallet boundary

No signing key is stored by this repository, GitHub Actions, or Geomacro. A wallet owner signs independently. Only the resulting public transaction hash is used for proof verification.

## Failure policy

The verifier fails closed when:

- Arc RPC reports a different chain;
- Geomacro does not return an audit ID;
- the Risk Gate execution boundary is not explicitly false;
- the policy action is unknown;
- a configured proof transaction is missing or failed.
