
### 1. The Target Folder Structure (Backend Additions)
We will introduce two new modules: `oauth-client` (for the Developer Dashboard) and `oauth` (for the core protocol endpoints), plus some critical cryptography utilities.

**Library choice:** Use **[`node-jose`](https://github.com/cisco/node-jose)** for asymmetric JWK/JWKS handling and JWS (JWT) signing/verification. Install with **pnpm** from the backend directory: `pnpm add node-jose`; for editor/TS assistance you can add `pnpm add -D @types/node-jose`. (This repo uses **pnpm** — see `.cursor/rules/package-manager-pnpm.mdc`.)

```text
src/
  common/
    utils/
      ... (existing utils)
      crypto.utils.js        <-- NEW: Secure random strings, PKCE hashing
      keys.utils.js          <-- NEW: Load persisted RSA keys; node-jose JWK + kid; JWS sign/verify helpers
  modules/
    ... (existing auth module)
    
    oauth-client/            <-- NEW: Developer Dashboard API
      oauth-client.model.js  <-- Schema for registered apps (client_id, secret)
      oauth-client.controller.js
      oauth-client.service.js
      oauth-client.routes.js
      dto/
        create-client.dto.js
        
    oauth/                   <-- NEW: Core OIDC Protocol Logic
      auth-code.model.js     <-- Schema for short-lived Authorization Codes
      consent.model.js       <-- Schema to remember User A approved App B
      oauth.controller.js    <-- Handles /authorize, /token, /userinfo
      oauth.service.js       <-- Validates PKCE, generates ID Tokens
      oauth.routes.js        <-- OIDC specific routes
      oidc-discovery.controller.js <-- Handles /.well-known and /jwks
```

---

### 2. Detailed Backend Implementation Plan

#### Step 1: Cryptography & RSA Keys (`keys.utils.js` & `crypto.utils.js`)
*   **Production Requirement:** OIDC requires an `id_token` (a JWT containing user data). Unlike your internal access tokens (which might use HS256 / symmetric keys), an `id_token` **must** be signed with an asymmetric RSA key **RS256** so third-party apps can verify it using your public key (via JWKS).
*   **Key lifecycle (generate once, persist securely):**
    *   **Do not** generate a new RSA key pair on every server startup in production. Generate a 2048-bit (or 4096-bit) RSA key pair **once** during initial setup or a defined rotation run (e.g. CLI script or one-off task).
    *   Persist the **private** key in a secret store (e.g. env-backed secrets, secrets manager, or protected file path readable only by the app). Persist or derive the **public** key the same way, or keep only the private PEM and derive the public JWK at runtime with **node-jose** (`JWK.asKey` from PEM, then export the public side for JWKS).
    *   At app boot, **load** the persisted key material (PEM or JWK) into memory. Assign a stable **`kid`** (key ID) to the active key; use that `kid` in JWT headers and in the JWKS so verifiers can pick the right key. Plan for **rotation** by supporting multiple `kid` values in JWKS (current + retiring keys) when you add a second key.
*   **`keys.utils.js` (node-jose):**
    *   Import the private key with `JWK.asKey` (PEM/JSON) into a `JWK` / keystore.
    *   Build the public **JWK** (with `alg: "RS256"`, `use: "sig"`, `kid`) for the `/.well-known/jwks` (or `jwks_uri`) response — export the public key material in JWK form for the `keys` array.
    *   Expose a small API for the token service: sign compact JWTs (ID tokens) with **`JWS.createSign`** in **compact** form, `alg: RS256`, and include **`kid`** in protected headers. For verification, use **`JWS.createVerify`** (or verify via relying parties using your JWKS).
*   **`crypto.utils.js` (unchanged intent):** PKCE — hash `code_verifier` with SHA-256, base64url-encode, compare to `code_challenge` (method `S256`).

#### Step 2: The `oauth-client` Module (Database & API)
This powers your Developer Dashboard where users get their `client_id` and `client_secret`.
*   **The Model (`oauth-client.model.js`):**
    *   `clientId`: String, unique, indexed (e.g., `client_...` prefix).
    *   `clientSecret`: String. **Must be hashed (bcrypt/argon2)**. Never store raw OAuth secrets.
    *   `clientName`: String (e.g., "My Startup App").
    *   `redirectUris`: Array of Strings (e.g., `['https://app.example.com/callback']`).
    *   `ownerId`: ObjectId ref to your existing `User` model.
*   **The API (`oauth-client.routes.js`):**
    *   `POST /api/clients`: Protected by your existing user auth. Generates a random 32-byte `clientId` and 64-byte `clientSecret`. Hashes the secret, saves to DB. Returns the raw secret to the user **only this one time**.
    *   `GET /api/clients`: Lists apps owned by the logged-in user.

#### Step 3: The Discovery Endpoints (`oauth` module)
Third-party libraries (like NextAuth, Passport.js, or Spring Security) auto-configure themselves by hitting your Discovery endpoints.
*   **`GET /.well-known/openid-configuration` (or issuer-relative path per your mount):**
    *   Returns JSON with: `issuer`, `authorization_endpoint`, `token_endpoint`, `userinfo_endpoint`, **`jwks_uri`**, `scopes_supported` (e.g. `openid`, `profile`, `email`), `response_types_supported` (e.g. `code`), `code_challenge_methods_supported` (e.g. `S256`), and **`id_token_signing_alg_values_supported`: `["RS256"]`**. Align every URL with your real base URL and route prefixes.
*   **`GET` JWKS (URL must match `jwks_uri` from discovery, e.g. `/oauth/jwks` or `/.well-known/jwks.json`):**
    *   Serves a **JWKS** document: `{"keys": [ ... ]}` with the public RSA key(s) as JWKs including **`kid`**, `kty`, `n`, `e`, `use`, `alg` as needed. Rely on the JWKs built in Step 1 (from persisted public material). Relying parties use this to verify `id_token` signatures; **`kid` in the JWT header must match** an entry here (or your verification logic resolves the active key).

#### Step 4: The `/authorize` Flow (`oauth.controller.js`)
This is a frontend-facing route, but the backend must validate it strictly.
*   **`GET /oauth/authorize`:**
    *   Receives `client_id`, `redirect_uri`, `response_type=code`, `scope`, `state`, and `code_challenge`.
    *   **Logic:** Look up the `client_id`. Verify the `redirect_uri` is an *exact* match to the DB. 
    *   Check if the user is authenticated (via your existing session/cookie logic). If not, redirect to your existing login page (appending the OAuth query params so you don't lose context).
    *   Check the `Consent` model. Has this user already granted permission to this app? If not, render the Consent screen.
*   **`POST /oauth/authorize` (Consent submission):**
    *   If the user clicks "Allow", generate a secure random `code` (Authorization Code).
    *   Save it in `auth-code.model.js` with a 5-minute TTL. Store the `client_id`, `user_id`, `redirect_uri`, and the `code_challenge` from the initial request.
    *   Redirect the user to: `redirect_uri?code=XYZ&state=ABC`.

#### Step 5: The `/token` Endpoint (`oauth.controller.js`)
This is a backend-to-backend API call. The client app is exchanging the `code` for tokens.
*   **`POST /oauth/token`:**
    *   **Authentication:** The client must authenticate. Usually via Basic Auth (`Authorization: Basic base64(clientId:clientSecret)`) or body parameters. Compare the secret against the bcrypt hash in `oauth-client.model.js`.
    *   **Validation:** Find the `code` in the DB. Ensure `redirect_uri` matches exactly.
    *   **PKCE Check:** Hash the incoming `code_verifier` parameter. Does it match the `code_challenge` stored with the code? If no, reject (this prevents code interception).
    *   **Token Generation:**
        *   Generate a standard Access Token (opaque random string, or a JWT if you choose — if JWT, sign/verify with **node-jose** `JWS` and the same key strategy; document `iss`/`aud`/`exp`; opaque tokens are verified by server-side lookup only).
        *   Generate the **ID Token** (compact JWT) with **node-jose** `JWS.createSign` / RS256: payload must include `iss` (issuer), `sub` (user id), `aud` (client_id), `exp`, `iat` (and optional `auth_time`, `nonce` if you support them). Header must include **`kid`** matching the JWKS entry.
    *   **Cleanup:** Delete the `code` from the DB (codes are strictly single-use).
    *   Return JSON: `{ access_token, id_token, token_type: "Bearer", expires_in: 900 }`.

#### Step 6: The UserInfo Endpoint (`oauth.controller.js`)
*   **`GET /oauth/userinfo`:**
    *   Protected by the Access Token from Step 5 (validate per your access-token design: lookup for opaque, or **node-jose** `JWS.createVerify` / key resolution if the access token is a JWT).
    *   Looks up the User in your existing `auth` module database.
    *   Returns JSON (e.g., `{ sub: "123", email: "user@example.com", name: "John" }`) based on the `scopes` granted.

---
