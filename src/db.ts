import Database from 'better-sqlite3'

// A simple SQLite database for persisting sessions and auth state.
// In a production environment, you might use PostgreSQL, Redis, or another durable store.
export const db = new Database('db.sqlite')

db.exec(`
  CREATE TABLE IF NOT EXISTS auth_state (
    key TEXT PRIMARY KEY,
    state TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS auth_session (
    key TEXT PRIMARY KEY,
    session TEXT NOT NULL
  );
`)
