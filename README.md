<h1 align="center">Zoic</h1>

<br>
<div align="center">Caching middleware library for Oak in Deno</div>
<br>


## Table of Contents

1. [Description](#description)
2. [Getting Started](#get-started)
3. [Middleware and caching](#middleware)
4. [Authors](#authors)
5. [License](#license)

## <a name="description"></a>Description

Zoic is an easy-to-use middleware library for caching responses from RESTful API endpoints in Oak, built for the Deno JavaScript runtime. Zoic provides an LRU in-memory cache, as well as support for Redis caches. Developers can use Zoic to easily cache HTTP responses with one simple middleware function that automatically handles both caching response data in the event of a cache miss, and sending responses on cache hits.

### Zoic Developer Tool

The Zoic Developer Tool allows developers to monitor cache metrics in real time, and is available as a Chrome Developer Tools extension [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

## <a name="get-started"></a>Getting Started

As Zoic is a middleware library for Oak in the Deno runtime envionement, it is paramount that [Deno](https://deno.land) is first installed and configured.

### Quick Start

In your application, import the Zoic module from the deno.land [module](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

```typescript
import { ZoicCache } from "our deno land link";
```

### Create a cache

Initalize a new ZoicCache object, passing in your user defined options object. If no options object is passed, Zoic will set all proprties to their default values.

- cache: Sets cache eviction policy (Defaults to LRU).
- expire: Sets cache invalidation/expiration time for each entry (Defaults to 24 hours).
- capacity: Sets the maximum number of entries (Defaults to no maximum).
- respondOnHit: Determines if cache hits should be sent as an HTTP response immediately upon retrival. If this is set to false, the cached response data will be attached to Oak Context.state property, context.state.zoicResponse. It is recommended to leave this set to true, unless additonal processing on the response data is desired in the event of a cache hit (Defaults to true).


Example:

```typescript
const cache = new ZoicCache({
  cache: 'LRU',
  expire: '5m, 3s',
  capacity: 50,
});
```

### Redis cache

To use an instance of Redis as your cache, initalize a new Zoic object, passing in "Redis" as the cache property on your options object. You also must specify the port your instance of Redis is running on. Optionally, you may pass the hostname as well. This value defaults to 127.0.0.1.
<br>
<br>
NOTE: Options "expire" and "capacity" do not have an effect on Zoic if using Redis, as these would be defined in your Redis configuration.
<br>
<br>
Example:
```typescript
const cache = new ZoicCache({
  cache: 'redis',
  port: 6379
})
```


## <a name="middleware"></a>Middleware and caching

### How to use Zoic for get requests

Place the use method in your caching object after the router and before the first function.

```typescript
router.get('/dbRead/:name', cache.use, controller.dbRead, ctx => {
    ctx.response.headers.set('Content-Type', 'application/json');
    ctx.response.body = ctx.state.somethingFromYourDB;
});
```

## <a name="authors"></a>Authors

- [Joe Borrow](https://github.com/jmborrow)
- [Celena Chan](https://github.com/celenachan)
- [Aaron Dreyfuss](https://github.com/AaronDreyfuss)
- [Hank Jackson](https://github.com/hankthetank27)
- [Jasper Narvil](https://github.com/jnarvil3)

## <a name="license"></a>License

This product is licensed under the MIT License - see the LICENSE file for details.

This is an open source product.

This product is accelerated by <a href="https://opensourcelabs.io/">OS Labs.</a>