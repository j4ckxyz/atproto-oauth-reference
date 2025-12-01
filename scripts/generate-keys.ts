import { generateKeyPair, exportJWK } from 'jose'
import fs from 'node:fs'
import path from 'node:path'

async function generate() {
  console.log('Generating ES256 keypair...')
  const { privateKey, publicKey } = await generateKeyPair('ES256')

  const privateJwk = await exportJWK(privateKey)
  const publicJwk = await exportJWK(publicKey)

  // Add Key ID (kid) - required for matching keys in a set
  const kid = 'key-1'
  privateJwk.kid = kid
  privateJwk.use = 'sig'
  privateJwk.alg = 'ES256'

  publicJwk.kid = kid
  publicJwk.use = 'sig'
  publicJwk.alg = 'ES256'

  const jwks = {
    keys: [privateJwk] // The private set contains all info
  }

  const publicJwks = {
    keys: [publicJwk] // The public set only contains safe info
  }

  const filePath = path.join(process.cwd(), 'jwks.json')
  const publicFilePath = path.join(process.cwd(), 'public-jwks.json')

  console.log(`Writing private keys to ${filePath}...`)
  fs.writeFileSync(filePath, JSON.stringify(jwks, null, 2))

  console.log(`Writing public keys to ${publicFilePath}...`)
  fs.writeFileSync(publicFilePath, JSON.stringify(publicJwks, null, 2))

  console.log('Done! You now have a confidential client keypair.')
}

generate().catch(console.error)
