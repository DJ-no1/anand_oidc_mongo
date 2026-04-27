import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** `backend/cert/` (same layout as `pnpm oidc:generate-keys`) */
export const defaultCertDir = path.resolve(__dirname, "../../../cert");

export const defaultPrivateKeyPath = path.join(defaultCertDir, "private-key.pem");
export const defaultPublicKeyPath = path.join(defaultCertDir, "public-key.pub");

/**
 * @returns {boolean}
 */
export const hasDefaultPrivateKey = () => existsSync(defaultPrivateKeyPath);

/**
 * @returns {string} PEM PKCS#8 private key
 */
export const readDefaultPrivateKeyPem = () => readFileSync(defaultPrivateKeyPath, "utf8");

/**
 * SPKI public key PEM (optional; JWKS is derived from the private key in keys.utils).
 * @returns {string}
 */
export const readDefaultPublicKeyPem = () => readFileSync(defaultPublicKeyPath, "utf8");
