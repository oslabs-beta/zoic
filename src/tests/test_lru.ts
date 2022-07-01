import { assertEquals, assert } from "https://deno.land/std@0.145.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.145.0/testing/bdd.ts";
import PerfMetrics from '../performanceMetrics.ts';
import LRU from '../lru.ts'

describe("LRU tests", () => {
  const lru = new LRU(50, new PerfMetrics, 8);

  it("Adds new items to the cache", () => {
    lru.put('item1', {headers:{}, body: 'testing1', status:200}, 10);
    lru.put('item2', {headers:{}, body: 'testing2', status:200}, 10);
    lru.put('item3', {headers:{}, body: 'testing3', status:200}, 10);
    lru.put('item4', {headers:{}, body: 'testing4', status:200}, 10);
    lru.put('item5', {headers:{}, body: 'testing5', status:200}, 10);
    assertEquals(lru.list.head?.key, 'item5');
    assertEquals(lru.list.tail?.key, 'item1');
    assertEquals(lru.length, 5);
  });

  it("Gets items from the cache, and moves them to the head", () => {
    const item = lru.get('item3');
    assertEquals(lru.list.head?.value, item);
    assertEquals(lru.list.head?.next?.key, 'item5');
    assertEquals(lru.list.head?.next?.next?.key, 'item4');
    assertEquals(lru.list.head?.next?.next?.next?.key, 'item2');
    assertEquals(lru.list.head?.next?.next?.next?.next?.key, 'item1');
    assertEquals(lru.list.head?.next?.next?.next?.next, lru.list.tail);
    assertEquals(lru.list.head?.next?.next?.next?.next?.next, null);
  });

  it("Deletes items from the front of the cache", () => {

  });

  it("Deletes items from the end of the cache", () => {

  });

  it("Deletes items from the middle of the cache", () => {

  });

  it("Deletes the last item when over capacity", () => {

  });

  it("Expires entry after set time", async () => {
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const shortLru = new LRU(1, new PerfMetrics, 8);
    shortLru.put('item1', {headers:{}, body: 'testing1', status:200}, 10);
    await timeout(1001);
    assert(!shortLru.get('item1'));
    assert(!shortLru.list.head);
    shortLru.put('item2', {headers:{}, body: 'testing2', status:200}, 10);
    await timeout(99)
    assert(shortLru.get('item2'));
    assert(shortLru.list.head);
  })
})