import { assert, assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import Zoic from '../../zoic.ts';


describe("Each cache instantiation has a metrics property with properties beginning with 0, '', or []", () => {

  const testCacheInstance = new Zoic(
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
  });
});

describe("Each cache instantiation has a metrics property with properties beginning with 0, '', or []", () => {

  const testCacheInstance = new Zoic(
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
  });
});

describe("Each cache's metrics property should have six methods that work correctly", () => {

  const testCacheInstance = new Zoic(
    {
      capacity: 10,
      expire: '2h, 3s, 5m',
      cache: 'LRU',
    }
  );


  it("should have a deleteEntry method that decreases the numberOfEntries correctly", () => {
    testCacheInstance.metrics.deleteEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, -1);

    testCacheInstance.metrics.deleteEntry();
    testCacheInstance.metrics.deleteEntry();
    assertEquals(testCacheInstance.metrics.numberOfEntries, -3);
  });

  it("should have a readProcessed method that updates the readsProcessed correctly", () => {
    testCacheInstance.metrics.readProcessed();
    assertEquals(testCacheInstance.metrics.readsProcessed, 1);

    testCacheInstance.metrics.readProcessed();
    testCacheInstance.metrics.readProcessed();
    assertEquals(testCacheInstance.metrics.readsProcessed, 3);
  });

  it("should have a writeProcessed method that updates the writesProcessed correctly", () => {
    testCacheInstance.metrics.writeProcessed();
    assertEquals(testCacheInstance.metrics.writesProcessed, 1);

    testCacheInstance.metrics.writeProcessed();
    testCacheInstance.metrics.writeProcessed();
    assertEquals(testCacheInstance.metrics.writesProcessed, 3);
  });

});


