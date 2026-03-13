import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Registry, ModelMetadata } from "./types.js";

const REGISTRY_BLOB = "shelby-hub/registry.json";
const EMPTY_REGISTRY: Registry = { version: "1", models: [], lastUpdated: new Date().toISOString() };

async function readableToBuffer(readable: ReadableStream): Promise<Buffer> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function readRegistry(client: ShelbyNodeClient, account: Ed25519Account): Promise<Registry> {
  try {
    const blob = await client.download({ account: account.accountAddress.toString(), blobName: REGISTRY_BLOB });
    const buf = await readableToBuffer(blob.readable);
    return JSON.parse(buf.toString("utf-8")) as Registry;
  } catch {
    return { ...EMPTY_REGISTRY };
  }
}

export async function writeRegistry(client: ShelbyNodeClient, account: Ed25519Account, registry: Registry): Promise<void> {
  registry.lastUpdated = new Date().toISOString();
  const blobData = Buffer.from(JSON.stringify(registry, null, 2), "utf-8");
  await client.upload({ signer: account as any, blobData, blobName: REGISTRY_BLOB, expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 365) * 1000 });
}

export async function addModel(client: ShelbyNodeClient, account: Ed25519Account, model: ModelMetadata): Promise<void> {
  const registry = await readRegistry(client, account);
  const existing = registry.models.findIndex((m) => m.id === model.id);
  if (existing >= 0) registry.models[existing] = model;
  else registry.models.push(model);
  await writeRegistry(client, account, registry);
}

export async function findModel(registry: Registry, modelId: string): Promise<ModelMetadata | undefined> {
  return registry.models.find((m) => m.id === modelId);
}
