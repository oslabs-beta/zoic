import {
  assert,
  assertThrows,
  assertEquals,
  assertInstanceOf,
  assertRejects,
  Context
} from "../../deps.ts";
import Zoic from "../../zoic.ts";
import LRU from "../lru.ts";
import LFU from "../lfu.ts";
import { TestServer } from "./test_server.ts";

Deno.test("Arguments passed into the performance metrics change", async (t) => {
  const lruTestCacheInstance = new Zoic({
    capacity: 10,
    expire: "2h, 3s, 5m, 80d",
    cache: "LrU",
  });
  const lfuTestCacheInstance = new Zoic({
    capacity: 10,
    expire: "2h, 3s, 5m, 80d",
    cache: "lfu",
  });

  await t.step("Should return an object", () => {
    assert(typeof lruTestCacheInstance === "object");
  });

  await t.step("Should set the right capacity", () => {
    assertEquals(lruTestCacheInstance.capacity, 10);
  });

  await t.step("Should parse unordered strings for expiration", () => {
    assertEquals(lruTestCacheInstance.expire, 6919503);
  });

  await t.step("Should return a promise", () => {
    assertInstanceOf(lruTestCacheInstance.cache, Promise);
  });

  await t.step("Should resolve promise to correct cache type", async () => {
    const lruCache = await lruTestCacheInstance.cache;
    const lfuCache = await lfuTestCacheInstance.cache;
    assertInstanceOf(lruCache, LRU);
    assertInstanceOf(lfuCache, LFU);
  });
});

Deno.test("Zoic should handle default args appropriately", async (t) => {
  const testCacheInstance = new Zoic();

  await t.step("should handle when nothing input for expiration time", () => {
    assertEquals(testCacheInstance.expire, Infinity);
  });

  await t.step("should handle when nothing input for capacity", () => {
    assertEquals(testCacheInstance.capacity, Infinity);
  });

  await t.step("should handle when nothing input for cache type", async () => {
    const cache = await testCacheInstance.cache;
    assert(cache instanceof LRU);
  });
});

Deno.test(
  "Zoic should handle poorly formatted args appropriately",
  async (t) => {
    await t.step(
      "should handle poorly formatted inputs to expiration time",
      () => {
        assertThrows(
          () =>
            new Zoic({
              capacity: 10,
              expire: "this should not work",
              cache: "LRU",
            }),
          TypeError,
          "Cache expiration time must be string formatted as a numerical value followed by 'd', 'h', 'm', or 's', or a number representing time in seconds.",
        );
      },
    );

    await t.step(
      "should handle poorly formatted inputs to cache type",
      async () => {
        const testCache = new Zoic({
          capacity: 10,
          cache: "LBU",
        });
        await assertRejects(
          () => testCache.cache,
          TypeError,
          "Invalid cache type.",
        );
      },
    );

    await t.step("Should handle poorly formatted inputs to capacity", () => {
      assertThrows(
        () => new Zoic({ capacity: 0 }),
        Error,
        "Cache capacity must exceed 0 entires.",
      );
    });

    await t.step(
      "Should handle poorly formatted inputs to expiration time",
      () => {
        assertThrows(
          () => new Zoic({ expire: 31536001 }),
          TypeError,
          "Cache expiration time out of range.",
        );
        assertThrows(
          () => new Zoic({ expire: 0 }),
          TypeError,
          "Cache expiration time out of range.",
        );
      },
    );
  },
);

Deno.test("Should update in-memory cache appropriately", async (t) => {
  const server = new TestServer();
  const router = server.getRouter();

  await t.step("Caches response body as a Uint8Array", async () => {
    const cache = new Zoic({ capacity: 5 });
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get("/test", cache.use, (ctx: Context) => {
      ctx.response.body = "testing123";
    });

    const port = await server.start();
    const response = await fetch(`http://localhost:${port}/test`);
    assertEquals(response.status, 200);
    assertEquals(await response.text(), "testing123");

    const cacheBody = lru.get("/test")?.body;
    assertInstanceOf(cacheBody, Uint8Array);
    assertEquals(
      new TextDecoder("utf-8").decode(lru.get("/test")?.body),
      "testing123",
    );

    server.stop();
  });

  await t.step("Cache stores and sends response", async () => {
    const cache = new Zoic({ capacity: 5 });
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get("/test1", cache.use, (ctx: Context) => {
      ctx.response.body = "testing123";
    });

    const port = await server.start();
    const response1 = await fetch(`http://localhost:${port}/test1`);
    const response2 = await fetch(`http://localhost:${port}/test1`);

    assertEquals(await response1.text(), "testing123");
    assertEquals(await response2.text(), "testing123");

    server.stop();
  });

  await t.step("Stores a new value when the entry is stale", async () => {
    const timeout = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    const cache = new Zoic({ capacity: 5, expire: 1 });
    const lru = await cache.cache;

    router.get("/test3", cache.use, (ctx: Context) => {
      ctx.response.body = "testing123";
    });

    router.post("/test3", cache.use, async (ctx: Context) => {
      const body = await ctx.request.body.json();
      ctx.response.body = body;
    });

    const port = await server.start();
    const getResponse = await fetch(`http://localhost:${port}/test3`);
    assertEquals(await getResponse.text(), "testing123");

    await timeout(1001);
    assert(!lru.get("/test3"));

    const postResponse = await fetch(`http://localhost:${port}/test3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "testingChange" }),
    });

    assertEquals(await postResponse.json(), { test: "testingChange" });

    server.stop();
  });

  await t.step("Should get metrics", async () => {
    const cache = new Zoic({ capacity: 5, expire: 1 });
    router.get("/testMetrics", cache.getMetrics);

    const port = await server.start();
    const response = await fetch(`http://localhost:${port}/testMetrics`);
    assertEquals(await response.json(), {
      cache_type: "LRU",
      memory_used: 0,
      number_of_entries: 0,
      reads_processed: 0,
      writes_processed: 0,
      average_hit_latency: null,
      average_miss_latency: null,
    });

    server.stop();
  });

  await t.step("Should clear cache", async () => {
    const cache = new Zoic({ capacity: 5 });
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get("/test20", cache.use, (ctx: Context) => {
      ctx.response.body = "testing123";
    });

    router.get("/test21", cache.clear, (ctx: Context) => {
      ctx.response.body = "testing400";
    });

    const port = await server.start();
    const response1 = await fetch(`http://localhost:${port}/test20`);
    assertEquals(lru.length, 1);
    assertEquals(await response1.text(), "testing123");

    const response2 = await fetch(`http://localhost:${port}/test21`);
    assertEquals(await response2.text(), "testing400");
    assertEquals(lru.length, 0);

    server.stop();
  });

  await t.step("Should not respond if respondOnHit is false", async () => {
    const cache = new Zoic({ capacity: 5, respondOnHit: false });
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get("/test100", cache.use, (ctx: Context) => {
      ctx.response.body = String(Number(ctx.state.zoicResponse?.body) + 1 || 1);
    });

    const port = await server.start();
    const response1 = await fetch(`http://localhost:${port}/test100`);
    const response2 = await fetch(`http://localhost:${port}/test100`);

    assertEquals(await response1.text(), "1");
    assertEquals(await response2.text(), "2");

    server.stop();
  });

  await t.step("Put method modifies existing entry", async () => {
    const cache = new Zoic({ capacity: 5 });
    const lru = await cache.cache;

    if (cache.redisTypeCheck(lru)) return assert(false);

    router.get("/test69", cache.use, (ctx: Context) => {
      ctx.response.body = "testing123";
    });

    router.post("/test69", cache.put, (ctx: Context) => {
      ctx.response.body = "modTest";
    });

    const port = await server.start();
    const response1 = await fetch(`http://localhost:${port}/test69`);
    assertEquals(await response1.text(), "testing123");

    const response2 = await fetch(`http://localhost:${port}/test69`, {
      method: "POST",
    });
    assertEquals(await response2.text(), "modTest");

    const response3 = await fetch(`http://localhost:${port}/test69`);
    assertEquals(await response3.text(), "modTest");

    server.stop();
  });
});
