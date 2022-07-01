import { assert, assertThrows, assertEquals, assertInstanceOf } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { afterEach, beforeEach, beforeAll, describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { Zoic } from '../../zoic.ts';
import LRU from '../lru.ts';
import PerfMetrics from '../performanceMetrics.ts'
// import { Context, Response, Request } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
// import { Application, Router } from "https://deno.land/x/oak@v6.0.1/mod.ts";
// import { superdeno } from "https://deno.land/x/superdeno@2.1.1/mod.ts";
// import { superoak } from "https://deno.land/x/superoak@2.1.0/mod.ts";

describe("Arguments passed into the performance metrics change ", () => {

  const testCacheInstance = new Zoic({capacity: 10, expire: '2h, 3s, 5m', cache: 'LrU'});

  it("Should return an object", () => {
    assert(typeof testCacheInstance === 'object');
  });

  it("Should set the right capcaity", () => {
    assertEquals(testCacheInstance.capacity, 10);
  });

  it("Should parse unordered strings for expiration", () => {
    assertEquals(testCacheInstance.expire, 7503);
  });

  it("Should return a promise", () => {
    assert(testCacheInstance.cache instanceof Promise);
  });

  it("Should resolve promise to correct cache type", async () => {
    const cache = await testCacheInstance.cache;
    assert(cache instanceof LRU)
  });
});

describe("Zoic should handle default args approporately", () => {

  const testCacheInstance = new Zoic();

  it("should handle when nothing input for expiration time", () => {
    assertEquals(testCacheInstance.expire, 86400);
  })

  it("should handle when nothing input for capacity", () => {
    assertEquals(testCacheInstance.capacity, Infinity);
  })

  it("should handle when nothing input for cache type", async () => {
    const cache = await testCacheInstance.cache;
    assert(cache instanceof LRU);
  })

})

describe("Zoic should handle poorly formatted args appropriately", () => {
  it("should handle poorly formatted inputs to expiration time", () => {
    assertThrows(() => new Zoic({
      capacity: 10,
      expire: 'this should not work',
      cache: 'LRU'
    }), TypeError, 'Cache expiration time must be string formatted as a numerical value followed by \'h\', \'m\', or \'s\', or a number representing time in seconds.');
  });
});

// describe("Zoic should update cache appropriately", () => {
  
//   const router = new Router();
//   router.get("/", (ctx) => {
//     ctx.response.bo

//   })
  
//   const testCacheInstance = new Zoic({
//     capacity: 5,
//     expire: '1m',
//     cache: 'LRU',
//   })

//   const testCxt = new Context();

//   let i = 0;
//   beforeEach(() => {
//     i++;
//   })

//   testCxt.request.url.pathname = '/testEndpoint/';

//   it("should update the cache with a new cache hit", () => {
//     testCxt.request.url.search = 'Obi-Wan Kenobi';
//     const key = testCxt.request.url.pathname + testCxt.request.url.search;
//     testCacheInstance.use(testCxt, Next());

//     assertEquals(testCacheInstance.cache.cache.key,)

//   })

// })