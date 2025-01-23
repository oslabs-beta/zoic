import {
    assertEquals,
    assert,
    describe,
    it
} from "../../deps.ts";
import PerfMetrics from '../performanceMetrics.ts';
import LRU from '../lru.ts'

describe("LRU tests", () => {
  const lru = new LRU(50, new PerfMetrics, 6);

  it("Adds new items to the cache", () => {
    lru.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    lru.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    lru.put('item3', {headers:{}, body: new Uint8Array([3]), status:200}, 10);
    lru.put('item4', {headers:{}, body: new Uint8Array([4]), status:200}, 10);
    lru.put('item5', {headers:{}, body: new Uint8Array([5]), status:200}, 10);
    assertEquals(lru.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(lru.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lru.cache.item3.value.body, new Uint8Array([3]));
    assertEquals(lru.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(lru.cache.item5.value.body, new Uint8Array([5]));
    assertEquals(lru.list.head?.key, 'item5');
    assertEquals(lru.list.tail?.key, 'item1');
    assertEquals(lru.length, 5);
  });

  it("Returns undefined when get is called on a non-existing key", () => {
    assertEquals(lru.get('asdf'), undefined);
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
    assertEquals(lru.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(lru.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lru.cache.item3.value.body, new Uint8Array([3]));
    assertEquals(lru.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(lru.cache.item5.value.body, new Uint8Array([5]));
  });

  it("Deletes items from the front of the cache", () => {
    lru.delete('item3');
    assertEquals(lru.cache.item3, undefined);
    assertEquals(lru.list.head?.key, 'item5');
    assertEquals(lru.list.head?.next?.key, 'item4');
    assertEquals(lru.list.head?.next?.next?.key, 'item2');
    assertEquals(lru.list.head?.next?.next?.next?.key, 'item1');
    assertEquals(lru.list.head?.next?.next?.next, lru.list.tail)
    assertEquals(lru.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(lru.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lru.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(lru.cache.item5.value.body, new Uint8Array([5]));
  });

  it("Deletes items from the end of the cache", () => {
    lru.delete('item1');
    assertEquals(lru.cache.item1, undefined);
    assertEquals(lru.list.head?.key, 'item5');
    assertEquals(lru.list.head?.next?.key, 'item4');
    assertEquals(lru.list.head?.next?.next?.key, 'item2');
    assertEquals(lru.list.head?.next?.next, lru.list.tail);
    assertEquals(lru.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lru.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(lru.cache.item5.value.body, new Uint8Array([5]));
  });

  it("Deletes items from the middle of the cache", () => {
    lru.delete('item4');
    assertEquals(lru.cache.item4, undefined);
    assertEquals(lru.list.head?.key, 'item5');
    assertEquals(lru.list.head?.next?.key, 'item2');
    assertEquals(lru.list.head?.next, lru.list.tail);
    assertEquals(lru.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lru.cache.item5.value.body, new Uint8Array([5]));
  });

  it("Adds an item to the head after deleting items", () => {
    lru.put('item666', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    assertEquals(lru.list.head?.key, 'item666');
    assertEquals(lru.list.head?.next?.key, 'item5');
    assertEquals(lru.list.head?.next?.next?.key, 'item2');
    assertEquals(lru.list.head?.next?.next?.next, null);
  })

  it("Deletes the last item when over capacity", () => {
    lru.put('item30', {headers:{}, body: new Uint8Array([3]), status:200}, 10);
    lru.put('item40', {headers:{}, body: new Uint8Array([4]), status:200}, 10);
    lru.put('item50', {headers:{}, body: new Uint8Array([5]), status:200}, 10);
    lru.put('item60', {headers:{}, body: new Uint8Array([6]), status:200}, 10);
    lru.put('item70', {headers:{}, body: new Uint8Array([7]), status:200}, 10);
    lru.put('item80', {headers:{}, body: new Uint8Array([8]), status:200}, 10);
    lru.put('item90', {headers:{}, body: new Uint8Array([9]), status:200}, 10);
    lru.put('item99', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    assertEquals(lru.cache.item30, undefined);
    assertEquals(lru.cache.item50.value.body, new Uint8Array([5]));
    assertEquals(lru.cache.item60.value.body, new Uint8Array([6]));
    assertEquals(lru.cache.item80.value.body, new Uint8Array([8]));
    assertEquals(lru.list.head?.key, 'item99');
    assertEquals(lru.list.head?.next?.key, 'item90');
    assertEquals(lru.list.head?.next?.next?.key, 'item80');
    assertEquals(lru.list.head?.next?.next?.next?.key, 'item70');
    assertEquals(lru.list.head?.next?.next?.next?.next?.key, 'item60');
    assertEquals(lru.list.head?.next?.next?.next?.next?.next?.key, 'item50');
    assertEquals(lru.list.head?.next?.next?.next?.next?.next?.next, null);
    assertEquals(lru.list.tail?.prev?.prev?.prev?.prev?.prev?.key, 'item99');
    assertEquals(lru.list.tail?.prev?.prev?.prev?.prev?.key, 'item90');
    assertEquals(lru.list.tail?.prev?.prev?.prev?.key, 'item80');
    assertEquals(lru.list.tail?.prev?.prev?.key, 'item70');
    assertEquals(lru.list.tail?.prev?.key, 'item60');
    assertEquals(lru.list.tail?.key, 'item50');
    assertEquals(lru.cache.item80.value.body, new Uint8Array([8]));
    assertEquals(lru.cache.item90.value.body, new Uint8Array([9]));
    assertEquals(lru.cache.item99.value.body, new Uint8Array([1]));
    assertEquals(lru.cache.item40, undefined);
  });

  it("Updates an entry when put is called with an existing key", () => {
    lru.put('item70', {headers:{}, body: new Uint8Array([100]), status:200}, 10);
    assertEquals(lru.get('item70')?.body, new Uint8Array([100]));
  })

  it("Expires entry after set time", async () => {
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const shortLru = new LRU(1, new PerfMetrics, 8);
    shortLru.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    await timeout(1001);
    assert(!shortLru.get('item1'));
    assert(!shortLru.list.head);
    shortLru.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    await timeout(99);
    assert(shortLru.get('item2'));
    assert(shortLru.list.head);
  })

  it("Should properly clear cache when clear method is called", () => {
    lru.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    lru.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    lru.put('item3', {headers:{}, body: new Uint8Array([3]), status:200}, 10);
    lru.put('item4', {headers:{}, body: new Uint8Array([4]), status:200}, 10);
    lru.put('item5', {headers:{}, body: new Uint8Array([5]), status:200}, 10);
    lru.clear();
    assertEquals(lru.list.head, null);
    assertEquals(lru.list.tail, null);
    assertEquals(lru.cache, {});
    assertEquals(lru.length, 0);
  });
})
