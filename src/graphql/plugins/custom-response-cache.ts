import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { createHash } from 'crypto'

function sha(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export default responseCachePlugin({
  generateCacheKey(rc, keyData) {
    const operationName = rc.request.operationName ?? 'unnamed'
    const queryHash = rc.queryHash
    const prefix = `${operationName}:${queryHash?.slice(0, 10)}`
    return prefix + ':' + sha(JSON.stringify(keyData))
  },
  sessionId(rc) {
    return rc.request.http.headers.get('session_id') || null
  },
})
