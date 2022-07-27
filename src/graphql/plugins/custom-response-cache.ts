import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { createHash } from 'crypto'

function sha(s: string) {
  return createHash('sha256').update(s).digest('hex')
}

export default responseCachePlugin({
  generateCacheKey(rc, keyData) {
    const operationName = rc.request.operationName ?? 'unnamed'
    const key = operationName + ':' + sha(JSON.stringify(keyData))
    return key
  },
})
