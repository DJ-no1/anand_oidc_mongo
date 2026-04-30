---

# 🚀 Anand ID: Master Architecture & Context Document

## 1. Project Mission
To build a highly secure, scalable, production-grade Identity Provider (IdP) from scratch. It handles Single Sign-On (SSO), robust third-party app authorizations strictly following OAuth 2.0 / OIDC Core 1.0 protocols, and secure user management.

## 2. The Tech Stack
*   **Backend:** Node.js with Express.js (Domain-Driven Design / Modular folder structure) and `oidc-provider` for strict OAuth 2.0/OIDC compliance.
*   **Primary Database (Permanent Truth):** MongoDB using Mongoose ODM.
*   **In-Memory Database (Fast Scratchpad):** Redis (for high-speed cache, OIDC ephemeral state like auth codes, sessions, and access tokens).
*   **Email Service:** Resend (for async login alerts and email verification).
*   **Frontend:** Next.js (App Router) with Tailwind CSS, Shadcn/ui, and Framer Motion for a premium UI.
*   **Deployment:** Docker containers (managed via Docker Compose).

## 3. Core Architectural Strategy: "Hybrid Session Architecture"
We designed a high-performance **Hybrid Session Architecture** to balance speed, specification compliance, and functionality:
*   **The Issue:** Querying a permanent database for every single API request is slow and standard OIDC requires vast amounts of short-lived ephemeral data (Auth Codes, nonces, interactions).
*   **Our Solution:** 
    * **MongoDB** is used strictly for persistent, "long-lived" identity state: User profiles, their Developer Projects, their OAuth Clients, and historical Consent records.
    * **Redis** is used as the backing store for the `oidc-provider` engine. All active authentication Sessions, short-lived PKCE Auth Codes, Refresh Tokens, and Access Tokens live exclusively in memory (Redis), allowing rapid verification on every request.

---

## 4. OIDC Protocol & Discovery Endpoints (Express Backend)
The backend strictly follows RFC 6749 (OAuth 2.0) and OIDC Core 1.0 using the `oidc-provider` library.

### A. Cryptography
Utilizes `node-jose` to generate and maintain a 2048-bit RSA Key Pair (RS256) to cryptographically sign JWT `id_tokens` and `access_tokens`. Keys are rotated or loaded dynamically.

### B. The Discovery Endpoints
These endpoints allow third-party apps to auto-configure and verify tokens securely without constantly pinging Anand ID's database.
*   `GET /.well-known/openid-configuration`: Exposes server capabilities, supported scopes, and endpoint URLs.
*   `GET /jwks` (JSON Web Key Set): Exposes the public RSA key so third-party apps can independently verify cryptographic signatures.

### C. The Core Flow Endpoints
*   `GET /oauth/auth`: Validates clients, requires mandatory **PKCE** (`code_challenge`), and tracks state via Redis. If the user isn't logged in or needs to consent, it redirects via the Interaction API.
*   `POST /oauth/token`: A secure backend-to-backend API that trades the authorization `code` + `code_verifier` (PKCE) for an `access_token`, `refresh_token`, and signed `id_token`.
*   `GET /oauth/me` (Userinfo): Returns the user's JSON profile data based strictly on the scopes the user granted.

---

## 5. The Database Design
We eliminated "junk" tables by heavily utilizing Redis for data that expires.

### A. MongoDB (Mongoose) - Permanent Truth
```dbml
Users {
  _id ObjectId [pk]
  name string
  email string [unique]
  password string [hashed]
  role enum(user, admin, superadmin) [default: user]
  isVerified boolean
  country string
  profilePictureUrl string
  bio string
  jobTitle string
  company string
  createdAt timestamp
}

Projects {
  _id ObjectId [pk]
  ownerId ObjectId > Users._id
  name string
  description string
  companyName string
  supportEmail string
  isDefault boolean
  createdAt timestamp
}

OAuthClients {
  _id ObjectId [pk]
  clientId string [unique]
  clientSecretHash string
  clientName string
  redirectUris string[]
  projectId ObjectId > Projects._id
  ownerId ObjectId > Users._id
  description string
  logoUrl string
  suspended boolean
  suspendedReason string
  createdAt timestamp
}

OAuthConsents {
  _id ObjectId [pk]
  userId ObjectId > Users._id
  clientId string > OAuthClients.clientId
  scope string [default: "openid"]
  createdAt timestamp
}
```

### B. Redis - In-Memory / Ephemeral Data (`oidc-provider` Storage)
1.  **`Session`**: Fast Whitelist. Tracks user login state for SSO.
2.  **`Interaction`**: Temporary state bridging the gap between `/oauth/auth` and the Next.js login/consent UI.
3.  **`AuthorizationCode`**: The short-lived (5-min) PKCE exchange codes.
4.  **`AccessToken` & `RefreshToken`**: OIDC standard tokens.
5.  **`Rate Limits / Email Tokens`**: Non-OIDC cache for brute-force prevention and fast verification links.

---

## 6. The 16-Step Authentication Flow (OIDC Interaction)
The exact sequence of how a user logs into a third-party app via Anand ID.

**Phase 1: The Handshake**
1. End User clicks "Login with Anand ID" on a **Third Party App**.
2. Third Party App redirects the user's browser to the **Express Backend** (`/oauth/auth` with PKCE).
3. Express Backend (via `oidc-provider`) creates an `Interaction` in **Redis**.
4. Express Backend redirects the browser to the **Next.js Frontend** (e.g., `/oauth/login?uid=XYZ`).

**Phase 2: User Action (Next.js)**
5. Next.js fetches the interaction context (`GET /api/oauth/consent/context`) to verify what is being requested.
6. If no session exists, **Next.js** shows the Login Screen.
7. User submits Email/Password. Next.js sends credentials to the **Express Backend**.
8. Express validates the password hash in **MongoDB**.
9. If consent is required, Next.js renders the Consent Screen. User approves the requested scopes.
10. Next.js submits the interaction result (`POST /api/oauth/consent` with `transaction_id`).

**Phase 3: Write-Through Cache & Handoff**
11. Express updates the Interaction in **Redis** with the user's ID and granted scopes.
12. Express redirects the user's browser back to the original `/oauth/auth` endpoint.
13. `oidc-provider` validates the interaction, generates an Auth Code in **Redis**, and redirects back to the **Third Party App** with `?code=XYZ`.

**Phase 4: Server-to-Server Secure Token Exchange**
14. The Third Party App's server makes a hidden `POST /oauth/token` request to **Express** (code + PKCE verifier).
15. Express validates the code in **Redis** and immediately deletes it.
16. Express generates and returns the Access Token, signed `id_token` (JWT), and Refresh Token. The user is now logged in!

---

## 7. The Three Frontend Portals (Next.js)
1.  **Marketing & Auth Portal** (`/` and `/oauth` routes): Public landing pages, SSO login screens, registration, and user consent interfaces.
2.  **Developer Console** (`/console`): Self-service dashboard for `user` roles where devs create Projects, register OAuth Apps, generate secrets (shown only once), and manage credentials.
3.  **Super Admin Panel** (`/admin`): God Mode for `admin` and `superadmin` roles. Global analytics, user management, project auditing, and the ability to suspend malicious third-party apps instantly.

## 8. Production Hardening Features
*   **Mandatory PKCE:** Prevents authorization code interception attacks.
*   **RBAC (Role-Based Access Control):** Strict Mongo validation ensures only `admin`/`superadmin` can hit admin routes, and UI dynamically renders.
*   **No Cleartext Secrets:** Client secrets are hashed (bcrypt) in Mongo before saving.
*   **High-Speed Validation:** Access tokens are verified entirely via JWT signature and Redis without touching MongoDB, allowing immense throughput.
*   **Connection Pooling:** Utilizes standard Mongoose connection pooling logic.
