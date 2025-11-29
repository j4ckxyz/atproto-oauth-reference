# AT Protocol Scopes

OAuth scopes define the permissions your application requests from the user. In the AT Protocol, scopes are critical for security and user trust.

## Common Scopes

### `atproto`
-   **Description**: Grants full access to the user's account (except for account deletion or migration in some contexts).
-   **Use Case**: Full-featured clients (e.g., a Twitter-like app) that need to read notifications, post content, update profiles, and manage follows.
-   **Risk**: High. If your token is leaked, the attacker has nearly full control.

### `transition:generic`
-   **Description**: A transitional scope often used while the ecosystem moves towards more granular scopes. It provides broad access similar to `atproto` but is intended to be phased out for specific capabilities.

### `transition:chat.bsky`
-   **Description**: specific to Bluesky chat capabilities.

## Granular Scopes (The Future)

The protocol is moving towards fine-grained scopes like:
-   `com.atproto.repo.create`
-   `com.atproto.repo.delete`
-   `app.bsky.feed.post`

*Note: As of late 2024/early 2025, `atproto` is still the most commonly used scope for general apps, but you should always check the latest ATProto specs.*

## Best Practices

1.  **Least Privilege**: Only request what you need. If you only need to verify identity, you might only need a hypothetical "signin" scope (or just check the DID returned without requesting API access, although typically some scope is required to get the token).
2.  **Transparency**: Explain to your users why you need specific permissions.
3.  **Offline Access**: If you need to perform actions when the user is not actively using the app (background jobs), ensure you request `offline_access` (often implicit or managed via refresh tokens in this library).

## In This Demo

We use:
```typescript
scope: 'atproto'
```
This is because we demonstrate fetching the user's profile and potentially other account data. For a simple "Log in with Bluesky" (identity only), you might strictly restrict usage to reading the profile and nothing else, even if the token technically allows more.
