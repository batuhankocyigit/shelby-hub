import fs from "fs";
import path from "path";
import { createShelbyClient, loadAccount } from "./client.js";
import { readRegistry, findModel } from "./registry.js";
import { DownloadOptions, ModelMetadata } from "./types.js";

export async function downloadModel(options: DownloadOptions): Promise<ModelMetadata> {
  const client = createShelbyClient();
  const account = loadAccount();

  const registry = await readRegistry(client, account);
  const model = await findModel(registry, options.modelId);
  if (!model) throw new Error(`Model "${options.modelId}" not found.`);

  const blob = await client.download({ account: account.accountAddress.toString(), blobName: model.blobName });

  const outputDir = path.dirname(options.outputPath);
  if (outputDir !== ".") fs.mkdirSync(outputDir, { recursive: true });

  const reader = blob.readable.getReader();
  const writeStream = fs.createWriteStream(options.outputPath);
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) writeStream.write(value);
  }
  writeStream.end();

  return model;
}
