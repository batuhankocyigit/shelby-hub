/**
 * Run with: npx ts-node scripts/generate-account.ts
 *
 * Generates a new Aptos Ed25519 account and prints the address and private key.
 * Add these values to your .env file.
 */
import { Account } from "@aptos-labs/ts-sdk";

const account = Account.generate();

console.log("\n🔑  New Aptos Account\n");
console.log("Address:     ", account.accountAddress.toString());
console.log("Private Key: ", account.privateKey.toString());
console.log(
  "\nAdd PRIVATE_KEY to your .env file and fund the account using the Shelby faucet.\n"
);
