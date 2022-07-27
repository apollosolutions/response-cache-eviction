import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import Keyv from 'keyv'
import config from '../config'

const keyV = () => {
  return new Keyv(config.redisUrl, {
    namespace: config.cacheNamespace,
    adapter: 'redis',
  })
}

export default new KeyvAdapter(keyV(), {
  disableBatchReads: true,
})
