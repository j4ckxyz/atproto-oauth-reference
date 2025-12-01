# AT Protocol OAuth Reference Implementation

This repository serves as a comprehensive reference for implementing OAuth authentication with the AT Protocol (Bluesky/ATProto). It is designed to be clear, concise, and "LLM-friendly" (easy for AI assistants to parse and understand context).

## Purpose

To demonstrate a secure, production-ready (conceptually) OAuth flow using `@atproto/oauth-client-node`, including:
-   **Handle Resolution**: Converting `user.bsky.social` to a DID.
-   **Session Management**: Persisting sessions securely using a database.
-   **Scopes**: Requesting appropriate permissions (Standard vs. Transition).
-   **Token Management**: Handling access and refresh tokens automatically.

## Quick Start

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run the Server**:
    ```bash
    npm run dev
    ```
3.  **Open**: Visit `http://localhost:3000`

## Public vs. Confidential Client

By default, this app runs as a **Public Client** (no secret key). This works for standard web apps but requires more frequent user re-authentication.

To enable **Confidential Client** mode (long-lived sessions, better security):

1.  **Generate Keys**:
    ```bash
    npx tsx scripts/generate-keys.ts
    ```
    This creates `jwks.json` (private) and `public-jwks.json`.

2.  **Restart Server**:
    The app detects `jwks.json` and automatically switches to Confidential mode.

## Documentation

-   **[Architecture Overview](./docs/ARCHITECTURE.md)**: How the components (Client, DB, Storage, Express) fit together.
-   **[Understanding Scopes](./docs/SCOPES.md)**: Which permissions to ask for and why.
-   **[Handles vs. DIDs](./docs/HANDLES_AND_DIDS.md)**: How user identity works in ATProto.
-   **[Setup & Configuration](./docs/SETUP.md)**: Configuring the client metadata for localhost vs. production.

## Key Files

-   `src/index.ts`: The web server and route handlers.
-   `src/client.ts`: Configuration of the OAuth client.
-   `src/storage.ts`: Interface between the OAuth client and the database.
-   `src/db.ts`: SQLite database connection.

## "Do's and Don'ts"

-   **DO** use DIDs (`did:plc:...`) as the primary user key in your database, not handles. Handles are mutable.
-   **DO** persist the `state` and `session` data securely.
-   **DON'T** request `atproto` (full access) scope unless you absolutely need it. Prefer granular scopes if available (though currently `atproto` or `transition:generic` are common).
-   **DON'T** hardcode the PDS URL. Always resolve it from the user's DID/Handle.

## UX Recommendation: Handle Autocomplete

To improve the user experience during sign-in, consider enhancing the handle input field with [actor-typeahead](https://tangled.org/jakelazaroff.com/actor-typeahead). This web component provides autocomplete suggestions for ATProto handles.

**Example Usage:**

```html
<!-- 1. Include the script (e.g., in your public assets) -->
<script type="module" src="/path/to/actor-typeahead.js"></script>

<!-- 2. Wrap your input -->
<label>Handle:
  <actor-typeahead>
    <input name="handle" type="text" placeholder="alice.bsky.social" required />
  </actor-typeahead>
</label>
```
