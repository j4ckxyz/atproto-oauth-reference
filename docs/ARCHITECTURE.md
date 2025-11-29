# Architecture

This reference app follows a standard server-side OAuth flow suited for a backend (Node.js/Express) application.

## Components

1.  **Express Server (`src/index.ts`)**
    -   Host web endpoints (`/`, `/login`, `/oauth/callback`).
    -   Manages the browser session (cookie-based) using `iron-session`.
    -   NOTE: The browser session is *separate* from the OAuth session. The browser session just remembers "Who is logged in here?" (by storing the DID).

2.  **OAuth Client (`src/client.ts`)**
    -   Instance of `NodeOAuthClient`.
    -   Manages the complexity of the handshake, token exchanges, and key management (DPoP).
    -   Uses `client-metadata` to define itself to the world (redirect URIs, etc.).

3.  **Storage Adapters (`src/storage.ts`)**
    -   **State Store**: Temporarily stores the random `state` parameter generated during the login request to prevent CSRF.
    -   **Session Store**: Persists the actual Access and Refresh tokens (the "OAuth Session") mapped to the user's DID.

4.  **Database (`src/db.ts`)**
    -   A simple SQLite database to back the Storage Adapters.
    -   In a real app, this would be Postgres, Redis, etc.

## The Flow

1.  **Initiation**:
    -   User enters Handle.
    -   App calls `client.authorize(handle)`.
    -   App redirects User to the PDS (e.g., bsky.social login page).
2.  **Authentication**:
    -   User logs in at the PDS.
    -   User approves the app.
3.  **Callback**:
    -   PDS redirects User back to `/oauth/callback?code=...`.
    -   App calls `client.callback(params)`.
    -   `client` exchanges `code` for `tokens`.
    -   `client` saves tokens to `SessionStore`.
    -   App saves `session.did` to the browser cookie.
4.  **Usage**:
    -   On subsequent requests, App reads DID from browser cookie.
    -   App loads OAuth tokens from `SessionStore` using the DID.
    -   App creates an `Agent` to make API calls.
