import process from "node:process";

const BASE_URL = (process.env.GEOMACRO_BASE_URL || "https://geomacro.live").replace(/\/$/, "");
const RPC_URL = process.env.ARC_MAINNET_RPC_URL || "https://rpc.mainnet.arc.io";
const EXPECTED_CHAIN_ID = Number(process.env.ARC_MAINNET_CHAIN_ID || "5042");
const EXPLORER = process.env.ARC_MAINNET_EXPLORER || "https://explorer.arc.io";
const PROOF_TX_HASH = (process.env.ARC_PROOF_TX_HASH || "").trim();
const SMOKE = process.argv.includes("--smoke");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function scenarioSubject(value) {
  const raw = (value || "USA>CHN").trim().toUpperCase();
  if (raw.includes(">")) {
    const [origin, destination] = raw.split(">").map((x) => x.trim());
    if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination) || origin === destination) {
      throw new Error("GEOMACRO_SCENARIO must be ISO3>ISO3, for example USA>CHN");
    }
    return { type: "corridor", origin_country_iso3: origin, destination_country_iso3: destination };
  }
  if (!/^[A-Z]{3}$/.test(raw)) throw new Error("GEOMACRO_SCENARIO must be an ISO3 country code or ISO3>ISO3 corridor");
  return { type: "country", country_iso3: raw };
}

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!response.ok) throw new Error(`Arc RPC HTTP ${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`Arc RPC ${body.error.code}: ${body.error.message}`);
  return body.result;
}

async function verifyArcMainnet() {
  const chainHex = await rpc("eth_chainId");
  const chainId = Number.parseInt(chainHex, 16);
  if (chainId !== EXPECTED_CHAIN_ID) throw new Error(`Wrong Arc network: expected ${EXPECTED_CHAIN_ID}, got ${chainId}`);
  const blockHex = await rpc("eth_blockNumber");
  const blockNumber = Number.parseInt(blockHex, 16);
  console.log(`Arc mainnet RPC: OK (chain ${chainId}, block ${blockNumber})`);
  return { chainId, blockNumber };
}

async function requestRiskDecision() {
  const recipient = process.env.GEOMACRO_RECIPIENT || "0x1111111111111111111111111111111111111111";
  const payload = {
    subject: scenarioSubject(process.env.GEOMACRO_SCENARIO),
    policy_preset: process.env.GEOMACRO_POLICY || "balanced",
    action_type: process.env.GEOMACRO_ACTION_TYPE || "agent_payment",
    amount_usdc: process.env.GEOMACRO_AMOUNT_USDC || "0.001",
    recipient,
    client_request_id: `arc-mainnet-proof-${Date.now()}`,
  };

  const response = await fetch(`${BASE_URL}/api/tameion/decision`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    throw new Error(`Geomacro decision failed (${response.status}): ${JSON.stringify(body)}`);
  }
  if (!body.audit_id) throw new Error("Geomacro response has no audit_id");
  if (body?.risk_gate?.execution_authorized !== false) throw new Error("Risk Gate execution boundary violated");
  if (!["AUTO_EXECUTE", "REQUIRE_APPROVAL", "BLOCK"].includes(body?.agent_decision?.action)) {
    throw new Error("Unexpected agent decision");
  }
  console.log(`Geomacro audit: ${body.audit_id}`);
  console.log(`Risk Gate: ${body.risk_gate.decision} / ${body.risk_gate.recommended_action}`);
  console.log(`Policy action: ${body.agent_decision.action}`);
  return body;
}

async function verifyProofTransaction(hash) {
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) throw new Error("ARC_PROOF_TX_HASH is not a valid transaction hash");
  const [tx, receipt] = await Promise.all([
    rpc("eth_getTransactionByHash", [hash]),
    rpc("eth_getTransactionReceipt", [hash]),
  ]);
  if (!tx) throw new Error("Arc mainnet proof transaction not found");
  if (!receipt) throw new Error("Arc mainnet proof transaction has no receipt yet");
  if (receipt.status !== "0x1") throw new Error("Arc mainnet proof transaction did not succeed");
  const txChainId = tx.chainId ? Number.parseInt(tx.chainId, 16) : EXPECTED_CHAIN_ID;
  if (txChainId !== EXPECTED_CHAIN_ID) throw new Error(`Proof transaction chain mismatch: ${txChainId}`);
  console.log(`Arc proof transaction: VERIFIED ${EXPLORER}/tx/${hash}`);
  return { tx, receipt };
}

try {
  await verifyArcMainnet();
  const decision = await requestRiskDecision();

  if (PROOF_TX_HASH) {
    await verifyProofTransaction(PROOF_TX_HASH);
  } else if (!SMOKE) {
    console.log("Arc mainnet proof transaction: not configured yet (set ARC_PROOF_TX_HASH after wallet signing).");
  }

  console.log("Safety boundary: Geomacro evaluates risk; this verifier never holds keys or signs transactions.");
  if (decision?.boundaries?.risk_gate_execution_authorized !== false) fail("Unexpected boundary response");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
