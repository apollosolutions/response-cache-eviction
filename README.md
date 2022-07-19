# A Limited Response Cache Eviction Solution
A limited cache eviction solution for the `apollo-server-plugin-response-cache` package. The code demonstrates customizing the cache key used for the response cache with a prefix that can then be used to manually evict certain types of responses.

**The code in this repository is experimental and has been provided for reference purposes only. Community feedback is welcome but this project may not be supported in the same way that repositories in the official [Apollo GraphQL GitHub organization](https://github.com/apollographql) are. If you need help you can file an issue on this repository, [contact Apollo](https://www.apollographql.com/contact-sales) to talk to an expert, or create a ticket directly in Apollo Studio.**

There is no supported API for cache eviction in the `apollo-server-plugin-response-cache` package, but as of version `3.7.0` we can now customize the cache key used to store responses with whatever value we want. This can enable us to use any pattern to selectively evict cache entries in another process. Depending on your use-case and what your underlying cache backend supports, this solution may or may not work for you.

## Project setup

```yarn install``` or ```npm install```

The code uses docker-compose to spin up a Redis and Postgres container to be used by the api.

```docker-compose up -d```

## Run the app

Spin up the demo Apollo Server

```yarn start```

## Running through the code

### Run a query

Open the Apollo Sandbox at http://localhost:5252. 

execute the following query in the Explorer:

```graphql
query AllDrugs {
  top200Drugs {
    brandName
    genericName
  }
}
```

The result of the query will be available in our local Redis cache. 

### Inspecting the cache

In a new terminal, shell into the running redis container

```shell
docker exec -it custom-response-cache-prefix_redis_1 sh
```

_Note^ your redis container name could be different, run `docker ps` to see your redis name or id_

once there, list out all the keys in the cache:

```shell
redis-cli --raw keys "*"
```

You should see something like:

```text
drug-graph:fqc:Top200Drug:01281a9b24:11d02cbdc9f3ffe7cae6c2c05a518e8cb2264199ba3dc88b6012536d306777bb
```

### Custom cache key
The cache key is made up of three main parts. the `drug-graph` section is a configurable namespace from the `Keyv` package. the `fqc` prefix comes from the response cache plugin and is not configurable. Everything after that comes from what is returned from the `generateCacheKey` config method on the response cache plugin constructor. 

Here is the type definition for the `generateCacheKey` function:
```typescript
  generateCacheKey?(
    requestContext: GraphQLRequestContext<Record<string, any>>,
    keyData: unknown,
  ): string;
```

The following snippet is the implementation of this function used in this repo:

```typescript
import responseCachePlugin from 'apollo-server-plugin-response-cache'
import { createHash } from 'crypto';

function sha(s: string) {
  return createHash('sha256').update(s).digest('hex');
}

export default reponseCachePlugin({
  generateCacheKey(requestContext, keyData) {
    const operationName = requestContext.request.operationName ?? 'unnamed'
    const queryHash = requestContext.queryHash
    const prefix = `${operationName}:${queryHash?.slice(0, 10)}`
    return prefix + ':' + sha(JSON.stringify(keyData))
  }
})
```
_Note^ the above code isn't particularly useful, just serves to demonstrate the types of things that are possible_

This implementation further divides the key by 3 sections, separated by the `:` character: 
	1) the operation name (or 'unnamed') 
	2) the first 10 characters of the query hash 
	3) the default key if this function weren't defined (duplicated from source plugin code)

The cache key that is generated when you don't provide the `generateCacheKey` function is the result of just returning `sha(JSON.stringify(keyData))`. You definitley do not need to use the `keyData` parameter when generating your cache key, this is just provided to demonstrate the default behavior.

Here's an example of what the cache key would be without us providing the `generateCacheKey` function:

```text
keyv:fqc:9f098cf154b6372bbad5dc1de6bd45a4ec8732922c4dd9201c0c323fd0291664
```

The `requestContext` parameter holds all the data about the running request, like the request/response objects as well as the context object that is passed to your resolver functions. Any of these data can be used as part of your cache key. 

### A few more queries

Lets run another query:

```graphql
{
  top200Drugs {
    brandName
    genericName
  }
}
```

Run this again, just adding the `id` field:

```graphql
{
  top200Drugs {
    brandName
    genericName
    id
  }
}
```

### Using Redis to selectively remove cache entries

outputting the redis keys again (`redis-cli --raw keys "drug-graph:fqc:*"`), you should see something like:
```
drug-graph:fqc:Top200Drug:a527e00470:6036dec33862ae979c33ff9a108811d209a1cfc12969504ff978f25af03168bd
drug-graph:fqc:unnamed:ce95b3626b:dbb180881931493af0c9bd86210284126c09ce00dec40d246f1c473e57ceab56
drug-graph:fqc:unnamed:6d73f9de1e:9eda6f6a7eb80571bb6e943fa832e0955834d5dde350fc3d16604c126d7c0154
```

We can now use some redis commands to selectively remove cache entries based on whatever prefix fits our usecase. Lets say we want to remove all unnamed entries in our cache, for whatever reason:

```shell
redis-cli --raw keys "drug-graph:fqc:unnamed*" | xargs redis-cli del
```

This will list out all the keys matching this pattern and then remove those keys one by one.



