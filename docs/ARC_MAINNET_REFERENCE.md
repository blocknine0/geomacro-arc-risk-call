# Arc Mainnet Reference

Pinned for this reproducible grant client:

- Network: Arc Mainnet
- Chain ID: `5042` (`0x13B2`)
- RPC: `https://rpc.mainnet.arc.io`
- Explorer: `https://explorer.arc.io`
- Native gas asset: USDC

The runtime verifier does not trust this file alone. It queries `eth_chainId` from the configured RPC and fails if the result is not `5042`.
