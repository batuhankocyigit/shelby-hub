/**
 * Registry management.
 *
 * The registry is a JSON file stored as a blob on Shelby under the uploader's
 * address at blobName "shelby-hub/registry.json".  This makes the registry
 * itself decentralised — anyone can read it from Shelby, only the key-holder
 * can write it.
 */

import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import { Ed25519Account } from "@aptos-labs/ts-sdk";
import { Registry, ModelMetadata } from "./types.js";

const REGISTRY_BLOB = "shelby-hub/registry.json";

const EMPTY_REGISTRY: Registry = {
  version: "1",
  models: [],
  lastUpdated: new Date().toISOString(),
};

export async function readRegistry(
  client: ShelbyNodeClient,
  account: Ed25519Account
): Promise<Registry> {
  try {
    const blob = await client.download({
      account: account.accountAddress,
      blobName: REGISTRY_BLOB,
    });

    const chunks: Buffer[] = [];
    for await (const chunk of blob.stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const raw = Buffer.concat(chunks).toString("utf-8");
    return JSON.parse(raw) as Registry;
  } catch {
    // Registry doesn't exist yet — return empty
    return { ...EMPTY_REGISTRY };
  }
}

export async function writeRegistry(
  client: ShelbyNodeClient,
  account: Ed25519Account,
  registry: Registry
): Promise<void> {
  registry.lastUpdated = new Date().toISOString();
  const blobData = Buffer.from(JSON.stringify(registry, null, 2), "utf-8");

  await client.upload({
    account,
    blobData,
    blobName: REGISTRY_BLOB,
    expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 365) * 1000, // 1 year
  });
}

export async function addModel(
  client: ShelbyNodeClient,
  account: Ed25519Account,
  model: ModelMetadata
): Promise<void> {
  const registry = await readRegistry(client, account);

  const existing = registry.models.findIndex((m) => m.id === model.id);
  if (existing >= 0) {
    registry.models[existing] = model; // update
  } else {
    registry.models.push(model);
  }

  await writeRegistry(client, account, registry);
}

export async function findModel(
  registry: Registry,
  modelId: string
): Promise<ModelMetadata | undefined> {
  return registry.models.find((m) => m.id === modelId);
}
