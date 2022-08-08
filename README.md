# A Cache Eviction Solution for the Full Response Cache Plugin
A cache eviction solution for the [`apollo-server-plugin-response-cache`](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-plugin-response-cache) package. The code demonstrates customizing the cache key used for the response cache with a prefix that can then be used to evict certain cached responses when a mutation is executed.

**The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official [Apollo GraphQL GitHub organization](https://github.com/apollographql) are. If you need help you can file an issue on this repository, [contact Apollo](https://www.apollographql.com/contact-sales) to talk to an expert, or create a ticket directly in Apollo Studio.**

Apollo Server’s Full Response Cache plugin [`apollo-server-plugin-response-cache`](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-plugin-response-cache) caches the results of operations for a period of time (time-to-live or TTL). After that time expires, the results are evicted from the cache and the server will execute the operation again.

In practice, this usually means setting a short TTL so that results don’t become stale. 

As of version 3.7.0, the Full Response Cache plugin allows customizing cache keys to support new cache eviction patterns. This means it’s easier to use long cache TTLs and increase the hit rate on your cache because you can evict the cached responses when relevant events occur.

## Project setup

```yarn install``` or ```npm install```

The code uses docker-compose to spin up a Redis and Postgres container to be used by the api.

```docker-compose up -d```

## Run the app

Spin up the demo Apollo Server

```yarn start``` or ```npm run start```
## Run a query

Open the Apollo Sandbox at http://localhost:5252. 

execute the following query in the Explorer tab:

```graphql
query Schedule2DrugsStock($filter: AllDrugsFilter) {
  allDrugs(filter: $filter) {
    brandName
    genericName
    schedule
    stock {
      pillsInStock
    }
  }
}
```

with the following variables defined in the variables tab:
```json
{
  "filter": {
    "schedules": ["C_II"]
  }
}
```

The result of the query will be available in our local Redis cache. 

## Inspecting the cache

In a new terminal, shell into the running redis container

```shell
docker exec -it custom-response-cache-keys_redis_1 sh
```

_Note^ your redis container name could be different, run `docker ps` to see your redis container name or id_

once there, list out all the keys in the cache:

```shell
redis-cli --raw KEYS "*"
```

You should see something like:

```text
drug-graph:fqc:Schedule2DrugsStock:e7eed80930547ed4ab4ece81a18955967831ff4c40757eda9bf1f0de84e042f8
```

## Custom cache key
The cache key is made up of three main parts that are separated by the first two ':' characters. the `drug-graph` section is a configurable namespace from the `Keyv` package. the [`fqc` prefix comes from the response cache plugin](https://github.com/apollographql/apollo-server/blob/76caff6ce797e00907d6ed8e2dab870e255340fe/packages/apollo-server-plugin-response-cache/src/ApolloServerPluginResponseCache.ts#L163-L166) and is not configurable. Everything after that comes from what is returned from the `generateCacheKey` config method on the response cache plugin constructor. 

Here is the type definition for the `generateCacheKey` function:
```typescript
  generateCacheKey?(
    requestContext: GraphQLRequestContext<Record<string, any>>,
    keyData: unknown,
  ): string;
```

The [requestContext](https://github.com/apollographql/apollo-server/blob/main/packages/apollo-server-types/src/index.ts#L135-L175) parameter holds data about the running GraphQL request, like the request / response objects as well as the [context object](https://www.apollographql.com/docs/apollo-server/data/resolvers/#the-context-argument) that is passed to your resolver functions. Any portion of these data objects can be used as part of your cache key. 

The `keyData` parameter can be used to ensure the uniqueness of your key, simply hashing this variable should be enough to generate a unique key per operation. In fact, the [default implementation](https://github.com/apollographql/apollo-server/blob/76caff6ce797e00907d6ed8e2dab870e255340fe/packages/apollo-server-plugin-response-cache/src/ApolloServerPluginResponseCache.ts#L168-L169) just hashes a `JSON.strigify` version of this parameter as the cache key.

The following snippet is the [implementation of this function](src/graphql/plugins/custom-response-cache.ts) used in this repo:

```typescript
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { createHash } from 'crypto';

function sha(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export default reponseCachePlugin({
  generateCacheKey(requestContext, keyData) {
    const operationName = requestContext.request.operationName ?? 'unnamed'
    const key = operationName + ':' + sha(JSON.stringify(keyData))
    return key
  }
})
```

This implementation simply adds the operation name as a prefix to the default key that is used in the response cache plugin. This ensures that the cache keys will still be unique, but now allows for selective eviction.

## Evicting Cached Responses
To demo this, lets run a few more queries to populate our cache:

```graphql
query Schedule4DrugsStock($filter: AllDrugsFilter) {
  allDrugs(filter: $filter) {
    brandName
    genericName
    schedule
    stock {
      pillsInStock
    }
  }
}
```

with the following variables defined in the variables tab:
```json
{
  "filter": {
    "schedules": ["C_IV"]
  }
}
```

Run again but change the operation name to `Schedule3DrugsStock`

an `AllDrugs` operation
```graphql
query AllDrugs {
  allDrugs {
    brandName
    genericName
    schedule
  }
}
```

and lastly, two unnamed operations:
```graphql
{
  allDrugs {
    brandName
    genericName
    schedule
  }
}
```
Just add the `id` field from the previous and run again
```graphql
{
  allDrugs {
    id
    brandName
    genericName
    schedule
  }
}
```

### Manual Cache Eviction
Jumping back to the redis container, list out all the cache keys again:
```
redis-cli --raw KEYS "*"
```
Should yield something like:
```text
drug-graph:fqc:unnamed:15c146346c5810bebc03832d163b1cba6e13ad06469cbfca1231dfc5c5b95c1c
drug-graph:fqc:unnamed:d5e54c3271bc56d350e16714067b14ccd99e5bb8b4b9c376f3e2216b462a9e71
drug-graph:fqc:Schedule2DrugsStock:e7eed80930547ed4ab4ece81a18955967831ff4c40757eda9bf1f0de84e042f8
drug-graph:fqc:AllDrugs:4d015d0b28294b985d5531f1909dc1aac529915c871845b25dcaf1a22e0b8f77
drug-graph:fqc:Schedule4DrugsStock:af8e6a9db9c6cae3ccc94cc531eb05e714551c34f058a80c9fc657a4ffeb1647
```

Let's say we wanted to manually evict all unnamed operations:

```shell
redis-cli --raw keys "drug-graph:fqc:unnamed*" | xargs redis-cli del
```

Listing out the keys again, you should see the `unnamed` entries removed.

### A word of caution
Using the `KEYS` Redis function is explictily cautioned against in the [Redis docs](https://redis.io/commands/keys/), so consider the performance impact of this technique before running against a production environment.

### Evicting entries when a mutation is called
The `setDrugStock` mutation demonstrates evicting certain cache entries when it is called.

[here is the resolver function](src/graphql/resolvers/index.ts#L23) for the `setDrugStock` mutation:
```typescript
setDrugStock: async (root, { input: { drugId, pillCount } }, cxt, info) => {
  const res = await cxt.dataSources.drugApi.setPillCountForDrug(
    drugId,
    pillCount,
  )

  const keys = await cxt.cacheEvictor.deleteByPrefix('Schedule[23]')
  console.log('Keys evicted:', keys)

  return {
    success: true,
    drugId: res[0].drug_id,
    pillCount: res[0].pills_in_stock,
  }
}
```

As soon as we modify the data, we evict all operations that start with `Schedule2` or `Schedule3`.

Run the following mutation:

```graphql
mutation SetDrugStock($input: DrugStockInput!) {
  setDrugStock(input: $input) {
    success
    pillCount
    drugId
  }
}
```

With the following variables defined in the variables tab:
```json
{
  "input": {
    "drugId": 1,
    "pillCount": 700
  }
}
```

You should see a couple of entries removed from the cache.

Here's the [implementation of the `deleteByPrefix`](src/graphql/RedisEvictor.ts#L29) method:

```typescript
async deleteByPrefix(prefix: string) {
  const scanIterator = this.client.scanIterator({
    MATCH: `${this.namespace}:fqc:${prefix}*`,
  })

  let keys = []

  for await (const key of scanIterator) {
    keys.push(key)
  }

  if (keys.length > 0) {
    await this.client.del(keys) // This is blocking, consider handling async in production if the number of keys is large
  }

  return keys
}
```

This implementation uses the `SCAN` Redis function under the hood, which is safer to use in production than the `KEYS` function. In either case, ensure that you aren't staining your caching server too much before fully releasing this into production.
