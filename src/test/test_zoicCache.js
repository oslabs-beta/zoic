import { assert, assertThrows, assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { afterEach, beforeEach, beforeAll, describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { ZoicCache } from '../zoicCache.ts';
import LRU from '../lru.ts';
import PerfMetrics from '../performanceMetrics.ts'
// import { Context, Response } from 'https://deno.land/x/oak@v10.6.0/mod.ts';

describe("Arguments passed to Deno are correctly reflected in instantiated class", () => {

  const testCacheInstance = new ZoicCache(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );

  it("should return an object", () => {
    assert(typeof testCacheInstance === 'object');
  });

  it("should set the right capcaity", () => {
    assertEquals(testCacheInstance.capacity, 10);
  });

  it("should parse unordered strings for expiration", () => {
    assertEquals(testCacheInstance.expire, 7503);
  });

  it("should instantiate the correct cache object", () => {
    const newLRU = new LRU(7503, testCacheInstance.metrics, 10);
    assert(testCacheInstance.cache instanceof (LRU));
  });

});

describe("ZoicCache should handle default args approporately", () => {

  const testCacheInstance = new ZoicCache();

  it("should handle when nothing input for expiration time", () => {
    assertEquals(testCacheInstance.expire, 86400);
  })

  it("should handle when nothing input for capacity", () => {
    assertEquals(testCacheInstance.capacity, 50);
  })

  it("should handle when nothing input for cache type", () => {
    assert(testCacheInstance.cache instanceof (LRU));
  })

})

describe("ZoicCache should handle poorly formatted args appropriately", () => {
  it("should handle poorly formatted inputs to expiration time", () => {
    assertThrows(() => new ZoicCache({
      capacity: 10,
      expire: 'this should not work',
      cache: 'LRU'
    }), TypeError, 'Cache expiration time must be string formatted as a numerical value followed by \'h\', \'m\', or \'s\', or a number representing time in seconds.');
  });
});

// describe("ZoicCache should update cache appropriately", () => {
//   const testCacheInstance = new ZoicCache({
//     capacity: 5,
//     expire: '10s',
//     cache: 'LRU',
//   })

//   const testCxt = new Context();

//   let i = 0;
//   beforeEach(() => {
//     i++;
//   })

//   testCxt.request.url.pathname = '/testEndpoint/';
//   testCxt.request.url.search = 'test' + String(i);





// })