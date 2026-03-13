# 🧠 ShelbyHub

> **Decentralized AI Model Registry on [Shelby Protocol](https://shelby.xyz)**  
> Upload, discover, and monetize AI model weights — on-chain, permissionlessly.

---

## The Problem

HuggingFace is the backbone of the open AI ecosystem. But it's centralized:

- A single company controls access to billions of model weights
- Model creators earn **zero revenue** from their work
- Any model can be taken down or censored at any time
- Inference pipelines have a single point of failure

## The Solution

ShelbyHub stores AI model weights as blobs on **Shelby Protocol** — a high-performance decentralized storage network built on Aptos. Every model in the registry is:

- **Permissionless** — no platform can censor or remove your model
- **Monetizable** — Shelby's paid-reads mechanism lets creators charge per inference
- **Fast** — sub-second retrieval latency, unlike cold storage alternatives (Filecoin, Arweave)
- **Transparent** — the registry itself is stored on Shelby, readable by anyone

```
Researcher                    Shelby Protocol              Inference Provider
    │                               │                              │
    │── Upload weights + price ──►  │                              │
    │── Register in registry ────►  │                              │
    │                               │  ◄── Fetch weights (pay) ───│
    │  ◄── Micropayment ────────────│                              │
```

---

## Architecture

| Component | Description |
|-----------|-------------|
| **Model Weights** | Stored as blobs on Shelby (`models/<id>/weights.<ext>`) |
| **Registry** | A JSON file stored on Shelby (`shelby-hub/registry.json`) — decentralized, no DB |
| **Identity** | Aptos Ed25519 wallet — the uploader's address is the model author |
| **Monetization** | Shelby's native paid-reads layer (coming to mainnet) |
| **CLI** | TypeScript CLI for upload / download / list / info |

---

## Getting Started

### 1. Prerequisites

- Node.js v18+
- An [Aptos Labs API key](https://docs.shelby.xyz/sdks/typescript/acquire-api-keys)
- Access to [Shelby testnet](https://discord.com/invite/shelbyserves)

### 2. Install

```bash
git clone https://github.com/batuhankocyigit/shelby-hub
cd shelby-hub
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Generate a new wallet (or use your existing Aptos private key):

```bash
npx ts-node scripts/generate-account.ts
```

Then fill in `.env`:

```env
APTOS_API_KEY=aptoslabs_your_key_here
PRIVATE_KEY=ed25519-priv-your_key_here
SHELBY_NETWORK=SHELBYNET
```

Fund your account:
- **APT** (for gas): use the [Aptos testnet faucet](https://aptos.dev/en/network/faucet)
- **ShelbyUSD** (for storage): use the [Shelby faucet](https://docs.shelby.xyz/sdks/typescript/fund-your-account)

---

## CLI Usage

### Upload a Model

```bash
npx ts-node src/cli.ts upload \
  --file ./my-model.safetensors \
  --id "batu0x25/llama3-turkish" \
  --name "Llama 3 Turkish Fine-tune" \
  --description "Llama 3 8B fine-tuned on Turkish instruction dataset" \
  --tags "llm,turkish,llama,instruction" \
  --format safetensors \
  --price 0.001 \
  --license Apache-2.0 \
  --base-model "meta-llama/Llama-3-8B"
```

Output:
```
  ✔ Upload complete!

  Model ID:     batu0x25/llama3-turkish
  Blob:         models/batu0x25/llama3-turkish/weights.safetensors
  Size:         4823.12 MB
  Author:       0xabc...
  Price/Read:   $0.001
  Uploaded At:  2025-03-13T10:00:00.000Z
```

---

### Download a Model

```bash
npx ts-node src/cli.ts download \
  --id "batu0x25/llama3-turkish" \
  --output ./downloads/llama3-turkish.safetensors
```

---

### List All Models

```bash
npx ts-node src/cli.ts list
```

```
┌─────────────────────────────┬───────────────────────────┬─────────────┬──────────────────────┬────────────┬──────────┐
│ ID                          │ Name                      │ Format      │ Tags                 │ Price/Read │ Size     │
├─────────────────────────────┼───────────────────────────┼─────────────┼──────────────────────┼────────────┼──────────┤
│ batu0x25/llama3-turkish     │ Llama 3 Turkish Fine-tune │ safetensors │ llm, turkish, llama  │ $0.001     │ 4823 MB  │
└─────────────────────────────┴───────────────────────────┴─────────────┴──────────────────────┴────────────┴──────────┘

  1 model(s) • Last updated: 2025-03-13T10:00:00.000Z
```

Filter by tag or format:

```bash
npx ts-node src/cli.ts list --tag turkish
npx ts-node src/cli.ts list --format gguf
```

---

### Model Info

```bash
npx ts-node src/cli.ts info --id "batu0x25/llama3-turkish"
```

---

## SDK Usage (Programmatic)

```typescript
import { uploadModel, downloadModel, readRegistry } from "shelby-hub";

// Upload
const metadata = await uploadModel({
  filePath: "./model.safetensors",
  id: "batu0x25/llama3-turkish",
  name: "Llama 3 Turkish",
  description: "Fine-tuned on Turkish instructions",
  tags: ["llm", "turkish"],
  format: "safetensors",
  pricePerReadUSD: 0.001,
  license: "Apache-2.0",
  baseModel: "meta-llama/Llama-3-8B",
});

// Download
await downloadModel({
  modelId: "batu0x25/llama3-turkish",
  outputPath: "./model.safetensors",
});
```

---

## Roadmap

- [x] Model upload to Shelby blob storage
- [x] On-Shelby JSON registry (no centralized DB)
- [x] CLI: upload / download / list / info
- [ ] Paid-reads enforcement via Aptos smart contract
- [ ] Token-gated access (whitelist specific wallet addresses)
- [ ] Web UI — browser-based model browser
- [ ] Model versioning (`batu0x25/llama3-turkish@v2`)
- [ ] Search by embedding similarity (semantic model discovery)
- [ ] Inference API wrapper (serve model directly from Shelby)

---

## Why Shelby?

| Feature | Shelby | Filecoin | Arweave | S3 |
|---------|--------|----------|---------|----|
| Sub-second reads | ✅ | ❌ | ❌ | ✅ |
| Decentralized | ✅ | ✅ | ✅ | ❌ |
| Native paid reads | ✅ | ❌ | ❌ | ❌ |
| On-chain access control | ✅ | ❌ | ❌ | ❌ |
| Inference-grade latency | ✅ | ❌ | ❌ | ✅ |

---

## Contributing

PRs welcome! Open an issue first for larger changes.

---

## Author

**Batuhan Koçyiğit**  
GitHub: [@batuhankocyigit](https://github.com/batuhankocyigit)  
Twitter: [@batu0x25](https://x.com/batu0x25)  
Discord: `batuhankocyigit`

Built on [Shelby Protocol](https://shelby.xyz) — high-performance decentralized blob storage by Jump Crypto & Aptos Labs.

---

## License

MIT
