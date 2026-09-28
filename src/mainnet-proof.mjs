import process from "node:process";

if (!process.env.ARC_PROOF_TX_HASH) {
  console.error("ARC_PROOF_TX_HASH is required. Sign the Arc mainnet transaction in your own wallet, then provide only its public transaction hash.");
  process.exit(1);
}

await import("./demo.mjs");
