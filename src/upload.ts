import fs from "fs/promises";
import path from "path";
import { createShelbyClient, loadAccount } from "./client.js";
import { addModel } from "./registry.js";
import { UploadOptions, ModelMetadata } from "./types.js";

export async function uploadModel(options: UploadOptions): Promise<ModelMetadata> {
  const client = createShelbyClient();
  const account = loadAccount();

  const absolutePath = path.resolve(options.filePath);
  const blobData = await fs.readFile(absolutePath);
  const sizeBytes = blobData.byteLength;
  const blobName = `models/${options.id}/weights${path.extname(options.filePath)}`;

  await client.upload({
    signer: account as any,
    blobData,
    blobName,
    expirationMicros: (Date.now() + 1000 * 60 * 60 * 24 * 365) * 1000,
  });

  const metadata: ModelMetadata = {
    id: options.id,
    name: options.name,
    description: options.description,
    author: account.accountAddress.toString(),
    tags: options.tags,
    format: options.format,
    sizeBytes,
    blobName,
    uploadedAt: new Date().toISOString(),
    pricePerReadUSD: options.pricePerReadUSD,
    license: options.license,
    baseModel: options.baseModel,
  };

  await addModel(client, account, metadata);
  return metadata;
}
