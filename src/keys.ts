import fs from 'node:fs'
import path from 'node:path'
import { JWK } from 'jose'

// We look for a jwks.json file in the root directory
const KEY_PATH = path.join(process.cwd(), 'jwks.json')

export const getJwks = () => {
  if (!fs.existsSync(KEY_PATH)) {
    return null
  }
  try {
    const content = fs.readFileSync(KEY_PATH, 'utf-8')
    return JSON.parse(content) as { keys: JWK[] }
  } catch (e) {
    console.error('Failed to parse jwks.json', e)
    return null
  }
}

export const getPublicJwks = () => {
    const jwks = getJwks()
    if (!jwks) return null

    // Filter out private parameters to create the public set
    const publicKeys = jwks.keys.map(key => {
        const { d, p, q, dp, dq, qi, ...publicKey } = key // Remove private key components
        return publicKey
    })

    return { keys: publicKeys }
}