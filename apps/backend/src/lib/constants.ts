/*
 * This file is copied directly from Helius's Kite framework
 * https://github.com/helius-labs/kite/blob/main/src/lib/constants.ts
 */ 

import { lamports, address as toAddress } from "@solana/kit";

// Some program names
export const TOKEN_PROGRAM = toAddress("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const TOKEN_EXTENSIONS_PROGRAM = toAddress("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
export const ASSOCIATED_TOKEN_PROGRAM = toAddress("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// Default values for making and loading wallets
export const SOL = 1_000_000_000n;
export const SECONDS = 1_000;
export const DEFAULT_AIRDROP_AMOUNT = lamports(1n * SOL);
export const DEFAULT_MINIMUM_BALANCE = lamports(500_000_000n);
export const DEFAULT_ENV_KEYPAIR_VARIABLE_NAME = "PRIVATE_KEY";

export const DEFAULT_TRANSACTION_RETRIES = 4;
export const DEFAULT_TRANSACTION_TIMEOUT = 15 * SECONDS;
// Anza keys concatenate the 32 bytes raw private key and the 32 bytes raw public key.
// This format was commonly used in NaCl / libsodium when they were popular.
export const KEYPAIR_LENGTH = 64;
export const KEYPAIR_PUBLIC_KEY_OFFSET = 32;

// Default value from Solana CLI
export const DEFAULT_FILEPATH = "~/.config/solana/id.json";

export const BASE58_CHARACTER_SET = /^[1-9A-HJ-NP-Za-km-z]+$/;

// 0x302e020100300506032b657004220420
// See https://stackoverflow.com/questions/79134901/how-can-i-make-a-webcrypto-cryptokeypair-from-a-uint8array
// TODO: add a better reference to a spec or ASN 1 decoding tool
const PKCS_8_PREFIX = new Uint8Array([48, 46, 2, 1, 0, 48, 5, 6, 3, 43, 101, 112, 4, 34, 4, 32]);
export const PKCS_8_PREFIX_LENGTH = PKCS_8_PREFIX.length;

export const GRIND_COMPLEXITY_THRESHOLD = 5;