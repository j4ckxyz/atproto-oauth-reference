# Handles vs. DIDs

In the AT Protocol, users have two identifiers: a **Handle** and a **DID** (Decentralized Identifier).

## Handle (`alice.bsky.social`)
-   **Human-readable**: Looks like a domain name.
-   **Mutable**: Users can change their handle at any time (e.g., `alice.bsky.social` -> `alice.com`).
-   **Usage**: Used for login input, display names, and mentions.
-   **NOT for Storage**: Never use the handle as the primary key in your database user table.

## DID (`did:plc:z72...`)
-   **Machine-readable**: A unique string starting with `did:`.
-   **Immutable**: This creates a permanent identity for the user, regardless of handle changes.
-   **Usage**: Database primary keys, internal logic, and resolving data from the PDS (Personal Data Server).

## The Resolution Flow

1.  **User Input**: User types `alice.bsky.social`.
2.  **Resolution**: The OAuth client (or a resolver) queries the network to find the DID associated with that handle.
3.  **Authentication**: The OAuth flow proceeds using the DID.
4.  **Storage**: Your app stores the DID.
5.  **Display**: When showing the user, you resolve the DID back to their *current* handle (or cache it and update periodically).

## Code Example

When a user logs in:

```typescript
// src/index.ts logic
const handle = req.body.handle; // "alice.bsky.social"

// The client.authorize() method handles the resolution internally!
const url = await client.authorize(handle, { ... });

// On callback, we get the session which contains the DID
const { session } = await client.callback(params);
const userDid = session.did; // "did:plc:123..."
```
