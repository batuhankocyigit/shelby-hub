import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Account, Aptos, AptosConfig, Ed25519Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import dotenv from "dotenv";
dotenv.config();

function getNetwork(): Network.TESTNET | Network.SHELBYNET | Network.LOCAL {
  const net = process.env.SHELBY_NETWORK ?? "SHELBYNET";
  if (net === "TESTNET") return Network.TESTNET;
  if (net === "LOCAL") return Network.LOCAL;
  return Network.SHELBYNET;
}

export function createShelbyClient(): ShelbyNodeClient {
  const apiKey = process.env.APTOS_API_KEY;
  if (!apiKey) throw new Error("APTOS_API_KEY is not set in .env");
  return new ShelbyNodeClient({ network: getNetwork(), apiKey });
}

export function createAptosClient(): Aptos {
  const apiKey = process.env.APTOS_API_KEY;
  if (!apiKey) throw new Error("APTOS_API_KEY is not set in .env");
  return new Aptos(new AptosConfig({ network: getNetwork(), clientConfig: { API_KEY: apiKey } }));
}

export function loadAccount(): Ed25519Account {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) throw new Error("PRIVATE_KEY is not set in .env");
  return new Ed25519Account({ privateKey: new Ed25519PrivateKey(pk) });
}

export function generateAccount(): Ed25519Account {
  return Account.generate() as Ed25519Account;
}
