import type {
  NodeSavedSession,
  NodeSavedSessionStore,
  NodeSavedState,
  NodeSavedStateStore,
} from '@atproto/oauth-client-node'
import { db } from './db'

/**
 * StateStore:
 * Stores temporary "state" parameters used during the initial OAuth handshake (authorize -> callback).
 * This prevents CSRF attacks by ensuring the callback comes from the same flow we started.
 * These are short-lived and can be deleted after the callback is processed.
 */
export class StateStore implements NodeSavedStateStore {
  async get(key: string): Promise<NodeSavedState | undefined> {
    const result = db.prepare('SELECT state FROM auth_state WHERE key = ?').get(key) as { state: string } | undefined
    if (!result) return
    return JSON.parse(result.state) as NodeSavedState
  }
  async set(key: string, val: NodeSavedState) {
    const state = JSON.stringify(val)
    db.prepare(`
      INSERT INTO auth_state (key, state) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET state = excluded.state
    `).run(key, state)
  }
  async del(key: string) {
    db.prepare('DELETE FROM auth_state WHERE key = ?').run(key)
  }
}

/**
 * SessionStore:
 * Persists the long-term OAuth session data (Access Token, Refresh Token, DID).
 * This allows the user to stay logged in even if the server restarts.
 * Keys are usually mapped to the user's DID.
 */
export class SessionStore implements NodeSavedSessionStore {
  async get(key: string): Promise<NodeSavedSession | undefined> {
    const result = db.prepare('SELECT session FROM auth_session WHERE key = ?').get(key) as { session: string } | undefined
    if (!result) return
    return JSON.parse(result.session) as NodeSavedSession
  }
  async set(key: string, val: NodeSavedSession) {
    const session = JSON.stringify(val)
    db.prepare(`
      INSERT INTO auth_session (key, session) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET session = excluded.session
    `).run(key, session)
  }
  async del(key: string) {
    db.prepare('DELETE FROM auth_session WHERE key = ?').run(key)
  }
}
