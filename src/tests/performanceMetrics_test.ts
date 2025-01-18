import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { Application, Router, Context } from 'https://deno.land/x/oak@v17.1.4/mod.ts';
import Zoic from '../../zoic.ts';
import PerfMetrics from '../performanceMetrics.ts';

Deno.test("Cache should contain correct metrics", async (t) => {
  const cache = new Zoic({capacity:5});

  await t.step("should have a metrics property with an object as its value", () => {
    assertInstanceOf(cache.metrics, PerfMetrics);
  });

  await t.step("should initialize each metric to correct type", () => {
    assertEquals(cache.metrics.numberOfEntries, 0);
    assertEquals(cache.metrics.readsProcessed, 0);
    assertEquals(cache.metrics.writesProcessed, 0);
    assertEquals(cache.metrics.currentHitLatency, 0);
    assertEquals(cache.metrics.currentMissLatency, 0);
    assertEquals(cache.metrics.missLatencyTotal, 0);
    assertEquals(cache.metrics.hitLatencyTotal, 0);
  });
});

Deno.test("Each metric property updated accurately", async (t) => {
  const cache = new Zoic({capacity:3});
  const app = new Application();
  const router = new Router();
  app.use(router.routes());
  app.use(router.allowedMethods());

  // Helper function to start and stop the server for tests
  const withServer = async (fn: (port: number) => Promise<void>) => {
    const controller = new AbortController();
    const { signal } = controller;
    const port = 8000 + Math.floor(Math.random() * 1000); // Random port to avoid conflicts

    app.addEventListener('listen', async ({ port }) => {
      try {
        await fn(port);
      } finally {
        controller.abort();
      }
    });

    await app.listen({ port, signal });
  };

  // Setup routes
  router
    .get('/test1', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
    .get('/test2', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
    .get('/test3', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
    .get('/test4', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'});

  // Run all requests before testing metrics
  await withServer(async (port) => {
    await fetch(`http://localhost:${port}/test1`);
    await fetch(`http://localhost:${port}/test1`);
    await fetch(`http://localhost:${port}/test2`);
    await fetch(`http://localhost:${port}/test2`);
    await fetch(`http://localhost:${port}/test2`);
    await fetch(`http://localhost:${port}/test2`);
    await fetch(`http://localhost:${port}/test3`);
    await fetch(`http://localhost:${port}/test4`);

    // run the actual metric tests
    await t.step("should handle numberOfEntries correctly", () => {
      assertEquals(cache.metrics.numberOfEntries, 3);
    });

    await t.step("should have a readProcessed method that updates readsProcessed correctly", () => {
      assertEquals(cache.metrics.readsProcessed, 4);
    });

    await t.step("should have a writeProcessed method that updates writesProcessed correctly", () => {
      assertEquals(cache.metrics.writesProcessed, 4);
    });

    await t.step("should have an increaseBytes method that updates memoryUsed correctly", () => {
      assertEquals(cache.metrics.memoryUsed, 390);
    });
  });
});
