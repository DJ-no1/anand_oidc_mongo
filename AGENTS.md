## Learned User Preferences

- Use pnpm for installs and scripts in this workspace, not npm or yarn; see `.cursor/rules/package-manager-pnpm.mdc`.

## Learned Workspace Facts

- OIDC signing uses the `node-jose` package, not the panva `jose` library.
- OIDC RSA private key is loaded from `OIDC_RSA_PRIVATE_KEY` or `OIDC_RSA_PRIVATE_KEY_PATH`; in non-production, missing config falls back to an ephemeral RSA key with a console warning.
- Express serves OIDC under `/oauth/*` (with discovery and JWKS as implemented in the backend).
- Consent flow uses a Next.js redirect plus `GET /api/oauth/consent/context` and `POST /api/oauth/consent` with `transaction_id`.
- Admin APIs expect users with `role: "admin"` on the User model; routes are under `/api/admin/*`; developer OAuth client management is under `/api/clients`.
- Postman-oriented testing notes live in `backend/POSTMAN_TESTING.md`.
