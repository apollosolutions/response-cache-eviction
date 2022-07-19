import { Config } from 'apollo-server'
import { readFileSync } from 'fs'
import resolvers from './resolvers'
import plugins from './plugins'
import { Context } from '../types'
import cache from './cache'
import dataSources from './datasources'
import context from './context'

const typeDefs = readFileSync('./src/graphql/drugs.graphql', 'utf-8')

const serverConfig: () => Config<Context> = () => {
  return {
    typeDefs,
    resolvers,
    plugins,
    cache,
    persistedQueries: { ttl: 900 },
    context,
    dataSources,
  }
}

export default serverConfig
