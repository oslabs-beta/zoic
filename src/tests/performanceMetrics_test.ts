import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { Application, Router, Context } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { superoak } from "https://deno.land/x/superoak@4.7.0/mod.ts";
import Zoic from '../../zoic.ts';
import PerfMetrics from '../performanceMetrics.ts';


describe("Cache should contain correct metrics", () => {

  const cache = new Zoic({capacity:5});

  it("should have a metrics property with an object as its value", () => {
    assertInstanceOf(cache.metrics, PerfMetrics)
  });

  it("should initialize each metric to correct type", () => {
    assertEquals(cache.metrics.numberOfEntries, 0);
    assertEquals(cache.metrics.readsProcessed, 0);
    assertEquals(cache.metrics.writesProcessed, 0);
    assertEquals(cache.metrics.currentHitLatency, 0);
    assertEquals(cache.metrics.currentMissLatency, 0);
    assertEquals(cache.metrics.missLatencyTotal, 0);
    assertEquals(cache.metrics.hitLatencyTotal, 0);
  });
});

describe("Each cache's metrics property should have six methods that work correctly", () => {


  const app = new Application();
  const router = new Router();
  app.use(router.routes());

  it("should handle numberOfEntries correctly", async () => {
    const cache = new Zoic({capacity:5});

    cache.metrics.addEntry();
    cache.metrics.addEntry();
    assertEquals(cache.metrics.numberOfEntries, 2);

    cache.metrics.deleteEntry();
    cache.metrics.deleteEntry();
    assertEquals(cache.metrics.numberOfEntries, 0);

    router.get('/test1', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });
    router.get('/test2', cache.use, (ctx: Context) => {
      ctx.response.body = 'testing123';
    });

    const request1 = await superoak(app);
    const request2 = await superoak(app);
    const request3 = await superoak(app);
    await request1.get('/test1');
    await request2.get('/test1');
    await request3.get('/test2');

    assertEquals(cache.metrics.numberOfEntries, 2);

  });

  it("should have a readProcessed method that updates the readsProcessed correctly", () => {
    const cache = new Zoic({capacity:5});

    cache.metrics.readProcessed();
    assertEquals(cache.metrics.readsProcessed, 1);

    cache.metrics.readProcessed();
    cache.metrics.readProcessed();
    assertEquals(cache.metrics.readsProcessed, 3);
  });

  it("should have a writeProcessed method that updates the writesProcessed correctly", () => {
    const cache = new Zoic({capacity:5});

    cache.metrics.writeProcessed();
    assertEquals(cache.metrics.writesProcessed, 1);

    cache.metrics.writeProcessed();
    cache.metrics.writeProcessed();
    assertEquals(cache.metrics.writesProcessed, 3);
  });

});


