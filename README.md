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
