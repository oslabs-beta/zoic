<p align="center"><img style="display: block;
  margin-left: auto;
  margin-right: auto;" src="./zoic_dev_tool/zoic_new.png" width = "300px" alt="Zoic logo">
</p>

[![example workflow](https://github.com/oslabs-beta/zoic/actions/workflows/deno.yml/badge.svg)](https://github.com/oslabs-beta/zoic/tree/dev/src/tests)

<hr>
  <br>
    <h3 align="center">Caching middleware library for Oak</h3>
  <br>
<hr>

## Table of Contents

1. [Description](#description)
2. [Getting Started](#get-started)
3. [Middleware and caching](#middleware)
4. [Authors](#authors)
5. [License](#license)

## <a name="description"></a>Description

Zoic is an easy-to-use middleware library for caching responses from RESTful API endpoints in Oak, built for the Deno JavaScript runtime. Zoic provides an LRU in-memory cache, as well as support for Redis caches. Developers can use Zoic to easily cache HTTP responses with one simple middleware function that automatically handles both caching response data in the event of a cache miss, and sending responses on cache hits.

### Zoic Developer Tool

The Zoic Developer Tool allows developers to monitor cache metrics in real time. Checkout the [Zoic Developer Tool README](./zoic_dev_tool/README.md/) for installation and configuration details.

## <a name="get-started"></a>Getting Started

As Zoic is a middleware library for Oak in the Deno runtime environment, it is paramount that [Deno](https://deno.land) is first installed and configured.

### Quick Start

In your application, import the Zoic module from the deno.land [module](https://deno.land/x/zoic/).

```typescript
import { Zoic } from "https://deno.land/x/zoic/zoic.ts";
```

### Create a cache

Initalize a new `Zoic` object, passing in your user defined `options` object. If no `options` object is passed, `Zoic` will set all properties to their default values.

- `cache`: Sets cache eviction policy. *Default value:* `'LRU'`
- `expire`: Sets cache invalidation/expiration time for each entry. This can be set in human readable time, as a comma seperated string, denoting hours with value followed by `'h'`, minutes followed by `'m'`, and seconds followed by `'s'`. Alternatively, you may pass in the time as a `number` representing seconds. *Default value:* `'Infinity'`
- `capacity`: Sets the maximum number of entries. *Default value:* `Infinity`
- `respondOnHit`: Determines if cache hits should be sent as an HTTP response immediately upon retrival. If this is set to `false`, the cached response data will be attached to Oak `Context.state` property, `context.state.zoicResponse`. It is recommended to leave this set to `true`, unless additonal processing on the response data is desired in the event of a cache hit. *Default value:* `true`


Example:

```typescript
const cache = new Zoic({
  cache: 'LRU',
  expire: '5m, 3s',
  capacity: 50,
});
```

### Redis cache

To use an instance of Redis as your cache, initalize a new `Zoic` object, passing in `'redis'` as the `cache` property on your options object. You also must specify the port your instance of Redis is running on, via the `port` property. Optionally, you may pass the hostname as well. This value defaults to `'127.0.0.1'`.
<br>
<br>
NOTE: Options `expire` and `capacity` do not have an effect on `Zoic` if using Redis, as these would be defined in your Redis configuration.
<br>
<br>
Example:
```typescript
const cache = new Zoic({
  cache: 'redis',
  port: 6379
})
```


## <a name="middleware"></a>Middleware and caching

### - Zoic.use()
`Zoic.use()` is responsible for both sending cached responses, and storing responses in the cache. When `.use()` is called in a middleware chain, it will check if data exists in the cache at a key representing that route's endpoint. If the query is successful, it will send an HTTP response with the cached body, headers, and status. If the query is unsucessful, `.use()` will automatically listen for when the subsequent middleware in that route has been executed, and will cache the contents of the HTTP response before being sent to the client. This way, the developer only needs to place `.use()` in their middleware chain at the point where they would like the response to be sent in the event of a cache hit, making it extremely easy to use.
<br>
<br>
NOTE: if the user has selected `false` for `respondOnHit` when intializing `Zoic`, the reponse data will be stored on `ctx.state.zoicResponse` instead of being sent as an HTTP response.
<br>
<br>
Example:

```typescript
const cache = new Zoic();

router.get('/userInfo/:name', cache.use, controller.dbRead, ctx => {
    ctx.response.headers.set('Content-Type', 'application/json');
    ctx.response.body = ctx.state.somethingFromYourDB;
});
```
### - Zoic.put()
`Zoic.put()` will add responses to the cache without first querying to see if an entry already exists. The primary use being to replace data at an already existing keys, or manually add responses without anything being returned. Like with `.use()`, `.put()` will automatically store the response body, headers, and status at the end of a middleware chain before the response is sent.
<br>
<br>
Example:

```typescript
const cache = new Zoic();

router.put('/userInfo/:name', cache.put, controller.dbWrite, ctx => {
    ctx.response.body = ctx.state.someDataYouChanged;
});
```
### - Zoic.clear()
`Zoic.clear()` clears the contents of the cache.
<br>
<br>
Example:

```typescript
const cache = new Zoic();

// On it's own..
router.post('/userInfo/:name', cache.clear);

// In conjunction with another function...
router.post('/otherUserInfo/', cache.clear, controller.dbWrite, ctx => {
    ctx.response.body = ctx.state.someFreshData;
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
