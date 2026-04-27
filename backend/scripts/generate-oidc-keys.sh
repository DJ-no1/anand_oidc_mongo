#!/usr/bin/env bash
# Generate RSA keypair for OIDC signing (RS256). Use with OIDC_RSA_PRIVATE_KEY_PATH.
set -euo pipefail

BACKEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CERT_DIR="${BACKEND_ROOT}/cert"

mkdir -p "$CERT_DIR"

openssl genpkey -algorithm RSA -out "$CERT_DIR/private-key.pem" -pkeyopt rsa_keygen_bits:2048
openssl rsa -in "$CERT_DIR/private-key.pem" -pubout -out "$CERT_DIR/public-key.pub"

chmod 600 "$CERT_DIR/private-key.pem" 2>/dev/null || true

echo "Keys written to:"
echo "  Private (PKCS#8 PEM, keep secret): $CERT_DIR/private-key.pem"
echo "  Public (PEM):                     $CERT_DIR/public-key.pub"
echo ""
echo "Point the backend at the private key, for example in backend/.env:"
echo "  OIDC_RSA_PRIVATE_KEY_PATH=./cert/private-key.pem"
echo "  (path is relative to the process cwd when you run pnpm dev — usually the backend/ folder)"
