ierror: Module not found "https://deno.land/x/ozoic@v1.0.6".mport { assert, assertThrows, assertEquals, assertInstanceOf, assertRejects } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { Application, Router, Context } from 'https://deno.land/x/oak@v17.1.4/mod.ts';
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import Zoic  from '../../zoic.ts';
import LRU from '../lru.ts';
import LFU from '../lfu.ts';

describe("Arguments passed into the performance metrics change ", () => {
  const lruTestCacheInstance = new Zoic({capacity: 10, expire: '2h, 3s, 5m, 80d', cache: 'LrU'});
  const lfuTestCacheInstance = new Zoic({capacity: 10, expire: '2h, 3s, 5m, 80d', cache: 'lfu'});

  it("Should return an object", () => {
    assert(typeof lruTestCacheInstance === 'object');
  });

  it("Should set the right capcaity", () => {
    assertEquals(lruTestCacheInstance.capacity, 10);
  });

  it("Should parse unordered strings for expiration", () => {
    assertEquals(lruTestCacheInstance.expire, 6919503);
  });

  it("Should return a promise", () => {
    assertInstanceOf(lruTestCacheInstance.cache, Promise);
  });

  it("Should resolve promise to correct cache type", async () => {
    const lruCache = await lruTestCacheInstance.cache;
    const lfuCache = await lfuTestCacheInstance.cache;
    assertInstanceOf(lruCache, LRU);
    assertInstanceOf(lfuCache, LFU);
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

});

describe("Zoic should handle poorly formatted args appropriately", () => {
  it("should handle poorly formatted inputs to expiration time", () => {
    assertThrows(() => new Zoic({
        capacity: 10,
        expire: 'this should not work',
        cache: 'LRU'
      }),
      TypeError,
      'Cache expiration time must be string formatted as a numerical value followed by \'d\', \'h\', \'m\', or \'s\', or a number representing time in seconds.'
    );
  });

  it("should handle poorly formatted inputs to cache type", async () => {
    const testCache = new Zoic({
      capacity: 10,
      cache: 'LBU'
    })
    await assertRejects(() => testCache.cache, TypeError, 'Invalid cache type.');
  });

  it("Should handle pooly formatted inputs to capacity", () => {
    assertThrows(() => new Zoic({capacity: 0}), Error, "Cache capacity must exceed 0 entires.");
  });

  it("Should handle pooly formatted inputs to expiration time", () => {
    assertThrows(() => new Zoic({expire: 31536001}), TypeError, 'Cache expiration time out of range.');
    assertThrows(() => new Zoic({expire: 0}), TypeError, 'Cache expiration time out of range.');
  });

});

describe("Should update in-memory cache appropriately", () => {
  const app = new Application();
  const router = new Router();
  app.use(router.routes());

  it('Caches response body as a Unit8Array', async () => {
    const cache = new Zoic({capacity:5});
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get('/test', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });

    const request = await superoak(app);

    await request.get('/test').expect(200).expect('testing123');
    const cacheBody = lru.get('/test')?.body;
    assertInstanceOf(cacheBody, Uint8Array);
    assertEquals(new TextDecoder('utf-8').decode(lru.get('/test')?.body), 'testing123');

  })

  it('Cache stores and sends response', async () => {
    const cache = new Zoic({capacity:5});
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

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
      assertEquals(lru.get('/test2')?.body, new Uint8Array(resBody));
      assertEquals(lru.get('/test2')?.status, 200);
    });

    request1.get('/test2');
  })

  it('Stores a new value when the entry is stale', async () => {
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const cache = new Zoic({capacity:5, expire: 1});
    const lru = await cache.cache;

    router.get('/test3', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
    router.post('/test3', cache.use, async (ctx: Context) => {
      const res = ctx.request.body({type: 'json'});
      ctx.response.body = await res.value;
    })

    const getReq = await superoak(app);
    const postReq = await superoak(app);
    await getReq.get('/test3').expect(200).expect('testing123');
    await timeout(1001);
    assert(!lru.get('/test3'));
    await postReq.post('/test3')
      .set("Content-Type", "application/json")
      .send({test: 'testingChange'})
      .expect(200)
      .expect({test: 'testingChange'});
  })

  it('Should get metrics', async () => {
    const cache = new Zoic({capacity:5, expire: 1});
    router.get('/testMetrics', cache.getMetrics);
    const req = await superoak(app);
    await req.get('/testMetrics').expect(200).expect(
      {
        cache_type: 'LRU',
        memory_used: 0,
        number_of_entries: 0,
        reads_processed: 0,
        writes_processed: 0,
        average_hit_latency: null,
        average_miss_latency: null
      }
    );
  })

  it('Should clear cache', async () => {
    const cache = new Zoic({capacity:5});
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get('/test20', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
    router.get('/test21', cache.clear, (ctx: Context) => {
      ctx.response.body = 'testing400';
    });

    const request1 = await superoak(app);
    const request2 = await superoak(app);
    await request1.get('/test20').expect(200).expect('testing123');
    assertEquals(lru.length, 1);
    await request2.get('/test21').expect(200).expect('testing400');
    assertEquals(lru.length, 0);
  });

  it('Should not respond if respondOnHit is false', async () => {
    const cache = new Zoic({capacity:5, respondOnHit: false});
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get('/test100', cache.use, (ctx: Context) => {
      ctx.response.body = String(Number(ctx.state.zoicResponse?.body) + 1 || 1);
    });

    const request1 = await superoak(app);
    const request2 = await superoak(app);
    await request1.get('/test100').expect(200).expect('1');
    await request2.get('/test100').expect(200).expect('2');
  });

  it('Put method modifys existing entry', async () => {
    const cache = new Zoic({capacity:5});
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get('/test69', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
    router.post('/test69', cache.put, (ctx: Context) => {
      ctx.response.body = 'modTest';
    })

    const request1 = await superoak(app);
    const request2 = await superoak(app);
    const request3 = await superoak(app);
    await request1.get('/test69').expect(200).expect('testing123');
    await request2.post('/test69').expect(200).expect('modTest');
    await request3.get('/test69').expect(200).expect('modTest');
  })
})
