import { KeyvAdapter } from '@apollo/utils.keyvadapter'
import Keyv from 'keyv'
import config from '../config'

export default new KeyvAdapter(
  new Keyv(config.redisUrl, {
    namespace: 'drug-graph',
    adapter: 'redis',
  }),
  {
    disableBatchReads: true,
  },
)
