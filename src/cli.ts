#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Table from "cli-table3";
import { uploadModel } from "./upload.js";
import { downloadModel } from "./download.js";
import { createShelbyClient, loadAccount } from "./client.js";
import { readRegistry } from "./registry.js";

const program = new Command();

program
  .name("shelby-hub")
  .description(
    chalk.bold("ShelbyHub") +
      " — Decentralized AI model registry on Shelby Protocol"
  )
  .version("0.1.0");

// ─── UPLOAD ───────────────────────────────────────────────────────────────────
program
  .command("upload")
  .description("Upload an AI model to Shelby and register it")
  .requiredOption("-f, --file <path>", "Path to model weights file")
  .requiredOption(
    "-i, --id <id>",
    'Model ID in "username/model-name" format (e.g. batu0x25/llama3-turkish)'
  )
  .requiredOption("-n, --name <name>", "Human-readable model name")
  .requiredOption("-d, --description <desc>", "Model description")
  .option(
    "--tags <tags>",
    "Comma-separated tags (e.g. llm,turkish,llama)",
    "llm"
  )
  .option(
    "--format <format>",
    "Model format: safetensors | gguf | pytorch",
    "safetensors"
  )
  .option("--price <usd>", "Intended price per read/inference (USD)", "0.001")
  .option("--license <license>", "License identifier", "MIT")
  .option("--base-model <base>", "Base model this was fine-tuned from")
  .action(async (opts) => {
    console.log(chalk.cyan("\n  🧠 ShelbyHub — Model Upload\n"));

    const spinner = ora("Uploading model weights to Shelby...").start();

    try {
      const metadata = await uploadModel({
        filePath: opts.file,
        id: opts.id,
        name: opts.name,
        description: opts.description,
        tags: opts.tags.split(",").map((t: string) => t.trim()),
        format: opts.format,
        pricePerReadUSD: parseFloat(opts.price),
        license: opts.license,
        baseModel: opts.baseModel,
      });

      spinner.succeed(chalk.green("Upload complete!"));

      console.log(`
  ${chalk.bold("Model ID:")}     ${chalk.yellow(metadata.id)}
  ${chalk.bold("Blob:")}         ${metadata.blobName}
  ${chalk.bold("Size:")}         ${(metadata.sizeBytes / 1024 / 1024).toFixed(2)} MB
  ${chalk.bold("Author:")}       ${metadata.author}
  ${chalk.bold("Price/Read:")}   $${metadata.pricePerReadUSD}
  ${chalk.bold("Uploaded At:")}  ${metadata.uploadedAt}
`);
    } catch (err: unknown) {
      spinner.fail(chalk.red("Upload failed"));
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

// ─── DOWNLOAD ─────────────────────────────────────────────────────────────────
program
  .command("download")
  .description("Download a model from Shelby by its ID")
  .requiredOption("-i, --id <id>", "Model ID (e.g. batu0x25/llama3-turkish)")
  .requiredOption("-o, --output <path>", "Output file path")
  .action(async (opts) => {
    console.log(chalk.cyan("\n  ⬇️  ShelbyHub — Model Download\n"));

    const spinner = ora(`Fetching model ${chalk.yellow(opts.id)}...`).start();

    try {
      const model = await downloadModel({
        modelId: opts.id,
        outputPath: opts.output,
      });

      spinner.succeed(chalk.green(`Downloaded to ${opts.output}`));

      console.log(`
  ${chalk.bold("Name:")}         ${model.name}
  ${chalk.bold("Description:")}  ${model.description}
  ${chalk.bold("Author:")}       ${model.author}
  ${chalk.bold("License:")}      ${model.license}
  ${chalk.bold("Size:")}         ${(model.sizeBytes / 1024 / 1024).toFixed(2)} MB
`);
    } catch (err: unknown) {
      spinner.fail(chalk.red("Download failed"));
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

// ─── LIST ─────────────────────────────────────────────────────────────────────
program
  .command("list")
  .description("List all models in the registry")
  .option("--tag <tag>", "Filter by tag")
  .option("--format <format>", "Filter by format")
  .action(async (opts) => {
    console.log(chalk.cyan("\n  📦 ShelbyHub — Model Registry\n"));

    const spinner = ora("Loading registry...").start();

    try {
      const client = createShelbyClient();
      const account = loadAccount();
      const registry = await readRegistry(client, account);

      spinner.stop();

      let models = registry.models;

      if (opts.tag) {
        models = models.filter((m) => m.tags.includes(opts.tag));
      }
      if (opts.format) {
        models = models.filter((m) => m.format === opts.format);
      }

      if (models.length === 0) {
        console.log(chalk.yellow("  No models found."));
        return;
      }

      const table = new Table({
        head: [
          chalk.bold("ID"),
          chalk.bold("Name"),
          chalk.bold("Format"),
          chalk.bold("Tags"),
          chalk.bold("Price/Read"),
          chalk.bold("Size"),
        ],
        style: { head: [], border: [] },
      });

      for (const m of models) {
        table.push([
          chalk.yellow(m.id),
          m.name,
          m.format,
          m.tags.join(", "),
          `$${m.pricePerReadUSD}`,
          `${(m.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
        ]);
      }

      console.log(table.toString());
      console.log(
        chalk.gray(`\n  ${models.length} model(s) • Last updated: ${registry.lastUpdated}\n`)
      );
    } catch (err: unknown) {
      spinner.fail(chalk.red("Failed to load registry"));
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

// ─── INFO ─────────────────────────────────────────────────────────────────────
program
  .command("info")
  .description("Show detailed info about a specific model")
  .requiredOption("-i, --id <id>", "Model ID")
  .action(async (opts) => {
    const spinner = ora("Loading model info...").start();

    try {
      const client = createShelbyClient();
      const account = loadAccount();
      const registry = await readRegistry(client, account);
      const model = registry.models.find((m) => m.id === opts.id);

      spinner.stop();

      if (!model) {
        console.log(chalk.red(`Model "${opts.id}" not found.`));
        process.exit(1);
      }

      console.log(`
  ${chalk.bold("━━━ " + model.name + " ━━━")}

  ${chalk.bold("ID:")}           ${chalk.yellow(model.id)}
  ${chalk.bold("Description:")}  ${model.description}
  ${chalk.bold("Author:")}       ${model.author}
  ${chalk.bold("Base Model:")}   ${model.baseModel ?? "—"}
  ${chalk.bold("Format:")}       ${model.format}
  ${chalk.bold("Size:")}         ${(model.sizeBytes / 1024 / 1024).toFixed(2)} MB
  ${chalk.bold("Tags:")}         ${model.tags.join(", ")}
  ${chalk.bold("License:")}      ${model.license}
  ${chalk.bold("Price/Read:")}   $${model.pricePerReadUSD} USD
  ${chalk.bold("Blob Path:")}    ${model.blobName}
  ${chalk.bold("Uploaded:")}     ${model.uploadedAt}
`);
    } catch (err: unknown) {
      spinner.fail(chalk.red("Failed"));
      console.error(chalk.red((err as Error).message));
      process.exit(1);
    }
  });

program.parse();
