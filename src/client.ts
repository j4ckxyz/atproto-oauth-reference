import { NodeOAuthClient } from '@atproto/oauth-client-node'
import { SessionStore, StateStore } from './storage'

export const createClient = async () => {
  return new NodeOAuthClient({
    // This metadata describes your OAuth client to the PDS.
    clientMetadata: {
        client_name: 'ATProto OAuth Test',
        // For localhost development, we use a "Loopback Client ID".
        // This allows us to test without a public domain or https.
        // In production, this should be the URL where your metadata is served (e.g., https://myapp.com/client-metadata.json).
        client_id: 'http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Foauth%2Fcallback&scope=atproto%20transition%3Ageneric',
        client_uri: 'http://localhost:3000',
        redirect_uris: ['http://127.0.0.1:3000/oauth/callback'],
        scope: 'atproto transition:generic',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'web',
        token_endpoint_auth_method: 'none',
        // DPoP (Demonstrating Proof-of-Possession) binds tokens to a private key, preventing replay attacks if the token is stolen.
        // This is highly recommended for security.
        dpop_bound_access_tokens: true,
    },
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  })
}