export interface ModelMetadata {
  id: string;               // unique slug: "username/model-name"
  name: string;             // human-readable name
  description: string;
  author: string;           // Aptos wallet address of uploader
  tags: string[];           // e.g. ["llm", "turkish", "llama"]
  format: string;           // e.g. "safetensors", "gguf", "pytorch"
  sizeBytes: number;
  blobName: string;         // path on Shelby: "models/<id>/weights"
  uploadedAt: string;       // ISO timestamp
  pricePerReadUSD: number;  // intended price per inference read (USD)
  license: string;          // e.g. "MIT", "Apache-2.0", "custom"
  baseModel?: string;       // e.g. "meta-llama/Llama-3-8B"
}

export interface Registry {
  version: string;
  models: ModelMetadata[];
  lastUpdated: string;
}

export interface UploadOptions {
  filePath: string;
  id: string;
  name: string;
  description: string;
  tags: string[];
  format: string;
  pricePerReadUSD: number;
  license: string;
  baseModel?: string;
}

export interface DownloadOptions {
  modelId: string;
  outputPath: string;
}
