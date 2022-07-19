import {
  ApolloServerPlugin,
  GraphQLRequestContextWillSendResponse,
} from 'apollo-server-plugin-base'
import clc from 'cli-color'
import { CacheHint } from 'apollo-server-types'
import { printWithReducedWhitespace } from '@apollo/utils.printwithreducedwhitespace'
import { CacheControlScope } from '../../types/generated/graphql'
import { log } from 'node:console'
import { Context } from '../../types'

export const cacheLogger = (): ApolloServerPlugin<Context> => {
  return {
    async requestDidStart(rc) {
      if ('IntrospectionQuery' !== rc.request.operationName) {
        return {
          async willSendResponse(requestContext) {
            const cacheDetails = gatherCachingDetails(requestContext)
            log(clc.bold.yellowBright(cacheDetails), '\n')
          },
        }
      }
    },
  }
}

const gatherCachingDetails = (
  rc: GraphQLRequestContextWillSendResponse<Context>,
): string => {
  const output = {
    operationName: rc.request.operationName,
    query: printWithReducedWhitespace(rc.document),
    queryHash: rc.queryHash,
    responseCacheHit: rc.metrics.responseCacheHit,
    responseHeaders: {
      'Cache-Control': formatCachePolicy(rc.overallCachePolicy),
      Age: rc.response.http.headers.get('Age') || undefined,
    },
  }
  return JSON.stringify(output, null, 2)
}

const formatCachePolicy = (cp: CacheHint): string => {
  const maxAge = cp.maxAge ?? null
  const scope = cp.scope ?? CacheControlScope.Public

  return `max-age=${maxAge}, ${scope.toLowerCase()}`
}

export default cacheLogger
