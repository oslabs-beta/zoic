import { assert, assertThrows, assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { afterEach, beforeEach, beforeAll, describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import { ZoicCache } from '../zoicCache.ts';
import LRU from '../lru.ts';
import PerfMetrics from '../performanceMetrics.ts'

//LOOK INTO DENO TESTING DOCUMENTATION FOR ASYNC STUFF

describe("Each cache instantiation has a metrics property with properties beginning with 0, '', or []", () => {

  const testCacheInstance = new ZoicCache(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );

  it("should have a metrics property with an object as its value", () => {
    assert(typeof testCacheInstance.metrics === 'object');
  });

  it("should initialize each metric at 0, '', or []", () => {
    assertEquals(testCacheInstance.metrics.numberOfEntries, 0);
    assertEquals(testCacheInstance.metrics.readsProcessed, 0);
    assertEquals(testCacheInstance.metrics.readsProcessed, 0);
    assertEquals(testCacheInstance.metrics.currentHitLatency, 0);
    assertEquals(testCacheInstance.metrics.currentMissLatency, 0);
    assertEquals(testCacheInstance.metrics.currentEndPoint, '');
    assertEquals(testCacheInstance.metrics.latencyHistory, []);
    assertEquals(testCacheInstance.metrics.missLatencyTotal, 0);
    assertEquals(testCacheInstance.metrics.hitLatencyTotal, 0);
    assertEquals(testCacheInstance.metrics.cacheSize, 0);
  });
});

describe("Each cache instantiation has a metrics property with properties beginning with 0, '', or []", () => {

  const testCacheInstance = new ZoicCache(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );

  it("should have a metrics property with an object as its value", () => {
    assert(typeof testCacheInstance.metrics === 'object');
  });

  it("should initialize each metric at 0, '', or []", () => {
    assertEquals(testCacheInstance.metrics.numberOfEntries, 0);
    assertEquals(testCacheInstance.metrics.readsProcessed, 0);
    assertEquals(testCacheInstance.metrics.readsProcessed, 0);
    assertEquals(testCacheInstance.metrics.currentHitLatency, 0);
    assertEquals(testCacheInstance.metrics.currentMissLatency, 0);
    assertEquals(testCacheInstance.metrics.currentEndPoint, '');
    assertEquals(testCacheInstance.metrics.latencyHistory, []);
    assertEquals(testCacheInstance.metrics.missLatencyTotal, 0);
    assertEquals(testCacheInstance.metrics.hitLatencyTotal, 0);
    assertEquals(testCacheInstance.metrics.cacheSize, 0);
  });
});

describe("Each cache's metrics property has six of its own methods that are functions", () => {

  const testCacheInstance = new ZoicCache(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );

  it("should have its six required methods, each being a function type", () => {
    assert(typeof testCacheInstance.writeMetricsJson === 'function');
    assert(typeof testCacheInstance.addEntry === 'function');
    assert(typeof testCacheInstance.deleteEntry === 'function');
    assert(typeof testCacheInstance.readProcessed === 'function');
    assert(typeof testCacheInstance.writeProcessed === 'function');
    assert(typeof testCacheInstance.updateLatency === 'function');
  });
});

describe("Each cache's metrics property should have six methods that work correctly", async () => {

  const testCacheInstance = await new ZoicCache(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );

  it("should have a writeMetricsJson method that writes to a dummy json file correctly", async () => {
    await testCacheInstance.metrics.writeMetricsJson();

    await fetch(`${Deno.cwd()}/../../static/localDB.json`, {
      headers: {
        'Cache-Control': "no-cache"
      },
      'pragma': 'no-cache'
    })
      .then(response => response.json())
      .then(metricsData => {

        const {
          number_of_entries,
          reads_processed,
          writes_processed,
          average_hit_latency,
          average_miss_latency
        } = metricsData;

        assertEquals(testCacheInstance.metrics.number_of_entries, 0);
        assertEquals(testCacheInstance.metrics.reads_processed, 0);
        assertEquals(testCacheInstance.metrics.writes_processed, 0);
        assertEquals(testCacheInstance.metrics.average_hit_latency, 0);
        assertEquals(testCacheInstance.metrics.average_miss_latency, 0);

      });
  });

  it("should have an addEntry method that increases the numberOfEntries correctly", async () => {
    await testCacheInstance.metrics.addEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, 1);

    await testCacheInstance.metrics.addEntry();
    await testCacheInstance.metrics.addEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, 3);

  });

  it("should have a deleteEntry method that decreases the numberOfEntries correctly", async () => {
    await testCacheInstance.metrics.deleteEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, -1);

    await testCacheInstance.metrics.deleteEntry();
    await testCacheInstance.metrics.deleteEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, -3);
  });

  it("should have a readProcessed method that updates the readsProcessed correctly", async () => {
    await testCacheInstance.metrics.readProcessed();
    assertEquals(testCacheInstance.metrics.readsProcessed, 1);

    await testCacheInstance.metrics.readProcessed();
    await testCacheInstance.metrics.readProcessed();
    assertEquals(testCacheInstance.metrics.readsProcessed, 3);
  });

  it("should have a writeProcessed method that updates the writesProcessed correctly", async () => {
    await testCacheInstance.metrics.writeProcessed();
    assertEquals(testCacheInstance.metrics.writesProcessed, 1);

    await testCacheInstance.metrics.writeProcessed();
    await testCacheInstance.metrics.writeProcessed();
    assertEquals(testCacheInstance.metrics.writesProcessed, 3);
  });

  it("should have a updateLatency method that works as intended", async () => {
    //Need logic here
  });
});


