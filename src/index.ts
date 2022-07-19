require('dotenv').config()

import { ApolloServer } from 'apollo-server'
import serverConfig from './graphql/server-config'
import config from './config'

new ApolloServer(serverConfig())
  .listen({ port: config.port })
  .then(({ url }) => console.log(`🚀 server ready at ${url}`))
