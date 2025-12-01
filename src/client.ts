import { NodeOAuthClient } from '@atproto/oauth-client-node'
import { SessionStore, StateStore } from './storage'
import { getJwks } from './keys'

export const createClient = async () => {
  const jwks = getJwks()
  const isConfidential = !!jwks

  console.log(`Initializing OAuth Client in ${isConfidential ? 'CONFIDENTIAL' : 'PUBLIC'} mode.`)

  // We cast to 'any' here to satisfy the strict union type checks of NodeOAuthClient
  // which expects precise tuple types for redirect_uris and specific literal unions.
  const clientMetadata = isConfidential
    ? {
        // CONFIDENTIAL CLIENT METADATA
        client_name: 'ATProto OAuth Test (Confidential)',
        client_id: 'http://localhost:3000/oauth-client-metadata.json',
        client_uri: 'http://localhost:3000',
        redirect_uris: ['http://127.0.0.1:3000/oauth/callback'],
        scope: 'atproto transition:generic',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'web',
        token_endpoint_auth_method: 'private_key_jwt',
        token_endpoint_auth_signing_alg: 'ES256',
        jwks_uri: 'http://localhost:3000/.well-known/jwks.json',
        dpop_bound_access_tokens: true,
      }
    : {
        // PUBLIC CLIENT METADATA
        client_name: 'ATProto OAuth Test (Public)',
        client_id: 'http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Foauth%2Fcallback&scope=atproto%20transition%3Ageneric',
        client_uri: 'http://localhost:3000',
        redirect_uris: ['http://127.0.0.1:3000/oauth/callback'],
        scope: 'atproto transition:generic',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        application_type: 'web',
        token_endpoint_auth_method: 'none',
        dpop_bound_access_tokens: true,
      }

  return new NodeOAuthClient({
    clientMetadata: clientMetadata as any,
    // Only pass the keyset if we are confidential. Cast to any to avoid type conflict with jose library.
    keyset: isConfidential ? (jwks as any) : undefined,
    stateStore: new StateStore(),
    sessionStore: new SessionStore(),
  })
}