import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it,  beforeAll } from "https://deno.land/std@0.145.0/testing/bdd.ts";
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

describe("Each metric property updated accurately", () => {
  const cache = new Zoic({capacity:3});
  const app = new Application();
  const router = new Router();
  app.use(router.routes());
  app.use(router.allowedMethods());

  beforeAll(async () => {
    router
      .get('/test1', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
      .get('/test2', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
      .get('/test3', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
      .get('/test4', cache.use, (ctx: Context) => {ctx.response.body = 'testing123'})
    const request1 = await superoak(app);
    const request2 = await superoak(app);
    const request3 = await superoak(app);
    const request4 = await superoak(app);
    const request5 = await superoak(app);
    const request6 = await superoak(app);
    const request7 = await superoak(app);
    const request8 = await superoak(app);
    await request1.get('/test1');
    await request2.get('/test1');
    await request3.get('/test2');
    await request4.get('/test2');
    await request5.get('/test2');
    await request6.get('/test2');
    await request7.get('/test3');
    await request8.get('/test4');
  });

  it("should handle numberOfEntries correctly", () => {
    assertEquals(cache.metrics.numberOfEntries, 3);
  });

  it("should have a readProcessed method that updates readsProcessed correctly", () => {
    assertEquals(cache.metrics.readsProcessed, 4);
  });

  it("should have a writeProcessed method that updates writesProcessed correctly", () => {
    assertEquals(cache.metrics.writesProcessed, 4);
  });
  
  it("should have an increaseBytes method that updates memoryUsed correctly", () => {
    assertEquals(cache.metrics.memoryUsed, 390);
  });
});
