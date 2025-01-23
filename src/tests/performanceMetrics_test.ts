import {
    assertEquals,
    assertInstanceOf,
    Context
} from "../../deps.ts";
import Zoic from '../../zoic.ts';
import PerfMetrics from '../performanceMetrics.ts';
import { TestServer } from './test_server.ts';

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
  const server = new TestServer();
  const router = server.getRouter();

  // Setup routes for tests 1-4
  Array.from({ length: 4 }, (_, i) => i + 1).forEach(i => {
    router.get(`/test${i}`, cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
  });

  const port = await server.start();

  try {
    const baseUrl = `http://localhost:${port}/test`;

    // Sequential requests with immediate body consumption
    for (const response of [
      await fetch(baseUrl + '1'),
      await fetch(baseUrl + '1'),
      await fetch(baseUrl + '2'),
      await fetch(baseUrl + '2'),
      await fetch(baseUrl + '2'),
      await fetch(baseUrl + '2'),
      await fetch(baseUrl + '3'),
      await fetch(baseUrl + '4')
    ]) {
      await response.body?.cancel();
    }

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
  } finally {
    server.stop();
  }
});
