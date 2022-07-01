import { assert, assertThrows, assertEquals, assertInstanceOf } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { Application, Router, Context } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import Zoic  from '../../zoic.ts';
import LRU from '../lru.ts';

describe("Arguments passed into the performance metrics change ", () => {

  const testCacheInstance = new Zoic({capacity: 10, expire: '2h, 3s, 5m, 80d', cache: 'LrU'});

  it("Should return an object", () => {
    assert(typeof testCacheInstance === 'object');
  });

  it("Should set the right capcaity", () => {
    assertEquals(testCacheInstance.capacity, 10);
  });

  it("Should parse unordered strings for expiration", () => {
    assertEquals(testCacheInstance.expire, 6919503);
  });

  it("Should return a promise", () => {
    assertInstanceOf(testCacheInstance.cache, Promise);
  });

  it("Should resolve promise to correct cache type", async () => {
    const cache = await testCacheInstance.cache;
    assertInstanceOf(cache, LRU);
  });
});

describe("Zoic should handle default args approporately", () => {

  const testCacheInstance = new Zoic();

  it("should handle when nothing input for expiration time", () => {
    assertEquals(testCacheInstance.expire, Infinity);
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
    }), TypeError, 'Cache expiration time must be string formatted as a numerical value followed by \'d\', \'h\', \'m\', or \'s\', or a number representing time in seconds.');
  });
});

describe("Should update in-memory cache appropriately", () => {
  const app = new Application();
  const router = new Router();
  app.use(router.routes());

  it('Caches response body as a Unit8Array', async () => {
    const cache = new Zoic({capacity:5});
    router.get('/test', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });

    const lru = await cache.cache;
    const request = await superoak(app);
    
    await request.get('/test').expect(200).expect('testing123');
    const cacheBody = lru.get('/test').body;
    assertInstanceOf(cacheBody, Uint8Array);
    assertEquals(new TextDecoder('utf-8').decode(lru.get('/test').body), 'testing123');
  })

  it('Cache stores and sends response', async () => {
    const cache = new Zoic({capacity:5});
    const lru = await cache.cache;
    
    router.get('/test1', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
    
    const request1 = await superoak(app);
    const request2 = await superoak(app);
    await request1.get('/test1').expect(200).expect('testing123');
    await request2.get('/test1').expect(200).expect('testing123');  
    
    router.get('/test2', cache.use, async (ctx: Context) => {
      ctx.response.body = 'testing123';
      const resObj = await ctx.response.toDomResponse();
      const resBody = await resObj.arrayBuffer();
      assertEquals(lru.get('/test2').body, new Uint8Array(resBody));
      assertEquals(lru.get('/test2').status, 200);
    });

    request1.get('/test2');
  })
})