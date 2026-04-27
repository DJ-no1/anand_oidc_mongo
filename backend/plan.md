


Your existing folder structure is excellent. It perfectly follows the Domain-Driven Design (DDD) / Modular approach, which is exactly what you need for a production-grade OIDC server. 

Since you already have the `auth` module handling user identities (login, passwords, sessions/tokens), we will leave that entirely intact. OIDC is simply a layer that sits *on top* of your existing authentication.

Here is the detailed backend plan, mapping out the new modules, utilities, and database schemas we need to add to your structure.

---

### 1. The Target Folder Structure (Backend Additions)
We will introduce two new modules: `oauth-client` (for the Developer Dashboard) and `oauth` (for the core protocol endpoints), plus some critical cryptography utilities.

```text
src/
  common/
    utils/
      ... (existing utils)
      crypto.utils.js        <-- NEW: Secure random strings, PKCE hashing
      keys.utils.js          <-- NEW: RSA Key pair generation and loading for JWKS
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
*   **Production Requirement:** OIDC requires an `id_token` (a JWT containing user data). Unlike your internal access tokens (which might use HS256 / symmetric keys), an `id_token` **must** be signed with an asymmetric RSA key (RS256) so third-party apps can verify it using your public key.
*   **Action:** 
    *   Write a utility that generates a 2048-bit RSA key pair on server startup (or loads it from `.env`/file if it exists).
    *   Format the public key into a JWK (JSON Web Key) format.
    *   Write a utility for PKCE: A function that takes a `code_verifier`, hashes it using SHA-256, base64url-encodes it, and compares it to a `code_challenge`.

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
*   **`GET /.well-known/openid-configuration`:**
    *   Returns a static JSON object detailing your issuer URL, authorization endpoint, token endpoint, supported scopes (`openid`, `profile`, `email`), and supported algorithms (`RS256`).
*   **`GET /jwks.json` (or `/oauth/jwks`):**
    *   Serves the JSON Web Key Set (JWKS). It outputs the public RSA key generated in Step 1 so clients can verify your `id_token` signatures.

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
        *   Generate a standard Access Token (can be a random string or a JWT, valid for ~15 mins).
        *   Generate the **ID Token (JWT)**. Payload must contain `iss` (your server), `sub` (user's ID), `aud` (client_id), `exp`, `iat`. Sign this strictly with the RSA Private Key.
    *   **Cleanup:** Delete the `code` from the DB (codes are strictly single-use).
    *   Return JSON: `{ access_token, id_token, token_type: "Bearer", expires_in: 900 }`.

#### Step 6: The UserInfo Endpoint (`oauth.controller.js`)
*   **`GET /oauth/userinfo`:**
    *   Protected by the Access Token generated in Step 5.
    *   Looks up the User in your existing `auth` module database.
    *   Returns JSON (e.g., `{ sub: "123", email: "user@example.com", name: "John" }`) based on the `scopes` granted.

---
