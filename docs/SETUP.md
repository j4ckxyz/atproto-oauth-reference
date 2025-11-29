# Setup and Configuration

## Prerequisites
-   Node.js v18+
-   NPM

## Local Development

1.  **Clone & Install**:
    ```bash
    git clone <repo>
    cd atproto-oauth-demo
    npm install
    ```

2.  **Public URL**:
    OAuth requires a publicly reachable or explicitly defined callback URL. For `localhost`, strict matching is enforced.
    
    In `src/client.ts`, the `client_id` is constructed specifically for localhost development to avoid needing a public domain:
    ```typescript
    client_id: 'http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Foauth%2Fcallback&scope=atproto'
    ```
    *Note: This is a "Loopback Client" technique. In production, your Client ID will be your website's URL (e.g., `https://myapp.com/client-metadata.json`).*

3.  **Run**:
    ```bash
    npm run dev
    ```

## Production Deployment

1.  **Domain**: You need a public domain (e.g., `https://myapp.com`).
2.  **Metadata Endpoint**: You must serve the client metadata at a known URL (usually `https://myapp.com/.well-known/oauth-client-metadata` or similar, or just referenced by the ID).
3.  **Update `src/client.ts`**:
    ```typescript
    clientMetadata: {
        client_name: 'My App',
        client_id: 'https://myapp.com/client-metadata.json', // The URL where this JSON is served
        client_uri: 'https://myapp.com',
        redirect_uris: ['https://myapp.com/oauth/callback'],
        // ...
    }
    ```
4.  **Serve Metadata**: Ensure your app actually serves this JSON at the `client_id` URL (if using URL-based IDs). The demo app serves it at `/oauth-client-metadata.json`.

5.  **Environment Variables**:
    Move secrets (like cookie passwords) to `.env` files.
