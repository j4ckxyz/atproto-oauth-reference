import express from 'express'
import { createClient } from './client'
import { getIronSession, IronSessionData } from 'iron-session'
import { Agent } from '@atproto/api'

// Types for the session data stored in the browser cookie
declare module 'iron-session' {
  interface IronSessionData {
    did?: string; // We only store the DID in the cookie. The actual tokens are in the server-side DB.
  }
}

const app = express()
const port = 3000

// Session configuration (cookie settings)
const sessionConfig = {
  cookieName: 'atproto-oauth-session',
  password: 'complex_password_at_least_32_characters_long', // REPLACE THIS in production!
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production', // true in production (HTTPS only)
  },
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const run = async () => {
  // Initialize the OAuth client
  const client = await createClient()

  // ---------------------------------------------------------
  // 1. Home Page / Dashboard
  // ---------------------------------------------------------
  app.get('/', async (req, res) => {
    const session = await getIronSession<IronSessionData>(req, res, sessionConfig)
    if (session.did) {
      try {
        // restore() checks the server-side store for valid tokens for this DID.
        // It handles token refreshing automatically if needed.
        const oauthSession = await client.restore(session.did)
        
        // If no session found (e.g., revoked or expired beyond refresh), clear cookie.
        if (!oauthSession) {
             throw new Error('Could not restore OAuth session')
        }
        
        // Create an Agent (atproto API client) using the restored credentials
        const agent = new Agent(oauthSession)
        
        // --- Fetch Profile Data ---
        // We use the agent to fetch the user's profile record.
        // This requires the 'atproto' scope or specific read permissions.
        let profile: any = {}
        let avatarUrl = ''
        
        try {
          const { data } = await agent.com.atproto.repo.getRecord({
            repo: session.did,
            collection: 'app.bsky.actor.profile',
            rkey: 'self',
          })
          profile = data.value
          
          // --- Construct Avatar URL ---
          // Blobs are not served directly in the record. We need to build a URL to the sync.getBlob endpoint.
          if (profile.avatar) {
             // The agent knows the PDS URL (service endpoint)
             const serviceUrl = new URL((agent as any).service?.toString() ?? 'https://bsky.social/')
             
             // The avatar ref is usually a CID object or string
             const cid = profile.avatar.ref?.toString() ?? ''
             
             if (cid) {
                avatarUrl = new URL(`xrpc/com.atproto.sync.getBlob`, serviceUrl).toString()
                avatarUrl += `?did=${encodeURIComponent(session.did!)}&cid=${encodeURIComponent(cid)}`
             }
          }
        } catch (e) {
          console.warn('Could not fetch profile record or construct avatar:', e)
        }
        
        // Render Dashboard
        res.send(renderDashboard(session.did, profile, avatarUrl))

      } catch (err) {
        console.error('Error processing session:', err)
        // If restoration fails, we should probably log them out
        session.destroy()
        res.send(renderError(err))
      }
    } else {
      // Not logged in
      res.send(renderLogin())
    }
  })

  // ---------------------------------------------------------
  // 2. Client Metadata Endpoint
  // ---------------------------------------------------------
  // In a real app, this JSON might be needed by the PDS to verify the client.
  app.get('/oauth-client-metadata.json', (req, res) => {
    res.json(client.clientMetadata)
  })

  // ---------------------------------------------------------
  // 3. Login Action
  // ---------------------------------------------------------
  app.post('/login', async (req, res) => {
    const handle = req.body.handle
    if (typeof handle !== 'string' || !handle) {
        return res.status(400).send('Handle is required')
    }

    try {
      // authorize() performs handle resolution (handle -> DID) 
      // and prepares the PDS authorization URL.
      const url = await client.authorize(handle, {
        scope: 'atproto transition:generic', // Requesting generic full access for this demo
      })
      res.redirect(url.toString())
    } catch (err) {
      console.error(err)
      res.status(500).send('Error initiating login: ' + err)
    }
  })

  // ---------------------------------------------------------
  // 4. OAuth Callback
  // ---------------------------------------------------------
  app.get('/oauth/callback', async (req, res) => {
    const params = new URLSearchParams(req.url.split('?')[1])
    try {
      // Verify the state, exchange code for tokens, and store them.
      const { session } = await client.callback(params)
      
      // Save the DID to the browser cookie so we remember the user.
      const reqSession = await getIronSession<IronSessionData>(req, res, sessionConfig)
      reqSession.did = session.did
      await reqSession.save()
      
      res.redirect('/')
    } catch (err) {
      console.error(err)
      res.status(500).send('Callback failed: ' + err)
    }
  })

  // ---------------------------------------------------------
  // 5. Logout Action
  // ---------------------------------------------------------
  app.post('/logout', async (req, res) => {
    const session = await getIronSession(req, res, sessionConfig)
    session.destroy()
    res.redirect('/')
  })

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

// --- Helper: HTML Templates ---

function renderLogin() {
  return `
    <!DOCTYPE html>
    <html>
      <head><title>Login</title><style>body{font-family:sans-serif;padding:2rem;max-width:600px;margin:0 auto;}</style></head>
      <body>
        <h1>ATProto OAuth Reference</h1>
        <p>Enter your handle (e.g., <code>alice.bsky.social</code>) to sign in.</p>
        <form action="/login" method="POST">
          <label>Handle: <input name="handle" type="text" placeholder="alice.bsky.social" required /></label>
          <button type="submit">Login</button>
        </form>
      </body>
    </html>
  `
}

function renderDashboard(did: string, profile: any, avatarUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Dashboard</title>
        <style>
            body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            pre { background: #2d2d2d; color: #f8f8f2; padding: 15px; border-radius: 8px; overflow-x: auto; }
            .avatar { border-radius: 50%; border: 2px solid #ddd; object-fit: cover; }
            .profile-header { display: flex; align-items: center; gap: 20px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>Logged In</h1>
        <div class="profile-header">
          ${avatarUrl 
            ? `<img class="avatar" src="${avatarUrl}" width="100" height="100">` 
            : '<div style="width:100px;height:100px;background:#eee;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#888;">No Img</div>'}
          <div>
            <h2 style="margin:0">${profile.displayName || 'Unknown User'}</h2>
            <p style="margin:5px 0;color:#666;">DID: ${did}</p>
          </div>
        </div>
        
        ${profile.description ? `<p><strong>Bio:</strong><br>${profile.description.replace(/\n/g, '<br>')}</p>` : ''}
        
        <h3>Raw Profile Record</h3>
        <pre>${JSON.stringify(profile, null, 2)}</pre>
        
        <form action="/logout" method="POST"><button>Logout</button></form>
      </body>
    </html>
  `
}

function renderError(err: any) {
  return `
    <h1>Error</h1>
    <p>Something went wrong.</p>
    <pre>${err}</pre>
    <a href="/">Go Back</a>
  `
}

run()