import { PKCS_8_PREFIX_LENGTH } from "./constants";
import bs58 from "bs58";
// Fixes "Value of "this" must be of type SubtleCrypto" errors
const exportKey = crypto.subtle.exportKey.bind(crypto.subtle);

// Annoyingly we can't directly output the "raw" format value of a private key
// (we have to use another format)
// See https://wicg.github.io/webcrypto-secure-curves/#ed25519-operations
// So let's strip out the PKCS8 prefix and return the raw bytes that follow
export const exportRawPrivateKeyBytes = async (privateKey: CryptoKey): Promise<Uint8Array> => {
  if (!privateKey.extractable) {
    throw new Error("Private key is not extractable");
  }
  const pkcs8Bytes = await exportKey("pkcs8", privateKey);
  const rawPrivateKeyBytes = pkcs8Bytes.slice(PKCS_8_PREFIX_LENGTH);
  return new Uint8Array(rawPrivateKeyBytes);
};

export const exportRawPublicKeyBytes = async (publicKey: CryptoKey): Promise<Uint8Array> => {
  // Note we don't need to check if the public key is extractable because it is always true
  // See https://wicg.github.io/webcrypto-secure-curves/#ed25519-operations
  const rawPublicKeyBytes = await exportKey("raw", publicKey);
  return new Uint8Array(rawPublicKeyBytes);
};

export const getBase58AddressFromPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  const publicKeyBytes = await exportRawPublicKeyBytes(publicKey);
  const publicKeyString = bs58.encode(publicKeyBytes);
  return publicKeyString;
};