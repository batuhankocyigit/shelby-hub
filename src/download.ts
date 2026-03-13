import fs from "fs";
import path from "path";
import { createShelbyClient, loadAccount } from "./client.js";
import { readRegistry, findModel } from "./registry.js";
import { DownloadOptions, ModelMetadata } from "./types.js";

export async function downloadModel(
  options: DownloadOptions
): Promise<ModelMetadata> {
  const client = createShelbyClient();
  const account = loadAccount();

  // -- Load registry and find model --
  const registry = await readRegistry(client, account);
  const model = await findModel(registry, options.modelId);

  if (!model) {
    throw new Error(
      `Model "${options.modelId}" not found in registry.\n` +
        `Run "shelby-hub list" to see available models.`
    );
  }

  // -- Download model weights from Shelby --
  const blob = await client.download({
    account: account.accountAddress,
    blobName: model.blobName,
  });

  // -- Write to output file --
  const outputDir = path.dirname(options.outputPath);
  if (outputDir !== ".") fs.mkdirSync(outputDir, { recursive: true });

  const writeStream = fs.createWriteStream(options.outputPath);

  await new Promise<void>((resolve, reject) => {
    blob.stream.pipe(writeStream);
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  return model;
}
