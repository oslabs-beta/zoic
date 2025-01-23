import {
    assertEquals,
    assert,
    describe,
    it
} from "../../deps.ts";
import PerfMetrics from '../performanceMetrics.ts';
import LFU from '../lfu.ts'

describe("LFU tests", () => {
  const lfu = new LFU(100, new PerfMetrics, 7);

  it("Adds new items to the cache", () => {
    lfu.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    lfu.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    lfu.put('item3', {headers:{}, body: new Uint8Array([3]), status:200}, 10);
    lfu.put('item4', {headers:{}, body: new Uint8Array([4]), status:200}, 10);
    lfu.put('item5', {headers:{}, body: new Uint8Array([5]), status:200}, 10);
    assertEquals(lfu.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(lfu.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(lfu.cache.item3.value.body, new Uint8Array([3]));
    assertEquals(lfu.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(lfu.cache.item5.value.body, new Uint8Array([5]));
    assertEquals(lfu.freqList.head?.freqValue, 1);
    assertEquals(lfu.freqList.tail?.freqValue, 1);
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.valList.tail?.key, 'item1');
    assertEquals(lfu.length, 5);
  });

  it("Returns undefined when get is called on a non-existing key", () => {
    assertEquals(lfu.get('asdf'), undefined);
  });

  it("Gets items and increases the frequency accessed", () => {

    const item1 = lfu.get('item4');
    assertEquals(item1?.body, new Uint8Array([4]))
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item4');

    const item2 = lfu.get('item5');
    assertEquals(item2?.body, new Uint8Array([5]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item5');

    const item3 = lfu.get('item4');
    assertEquals(item3?.body, new Uint8Array([4]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item4');

    const item4 = lfu.get('item3');
    assertEquals(item4?.body, new Uint8Array([3]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item2');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item4');

    const item5 = lfu.get('item4');
    assertEquals(item5?.body, new Uint8Array([4]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item2');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item4');

    const item6 = lfu.get('item4');
    assertEquals(item6?.body, new Uint8Array([4]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item2');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item4');

    const item7 = lfu.get('item5');
    assertEquals(item7?.body, new Uint8Array([5]));
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item2');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item3');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.next?.next?.next?.valList.head?.key, 'item4');
    assertEquals(lfu.freqList.head?.freqValue, 1);
    assertEquals(lfu.freqList.head?.next?.freqValue, 2);
    assertEquals(lfu.freqList.head?.next?.next?.freqValue, 3);
    assertEquals(lfu.freqList.head?.next?.next?.next?.freqValue, 5);

    lfu.get('item2');
    lfu.get('item1');
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item1');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item4');
    assertEquals(lfu.freqList.head?.freqValue, 2);
    assertEquals(lfu.freqList.head?.next?.freqValue, 3);
    assertEquals(lfu.freqList.head?.next?.next?.freqValue, 5);
  });

  it("Should properly put an item as a new freqency at value 1 when the current head is greater than 1", () => {
    lfu.put('item6', {headers:{}, body: new Uint8Array([6]), status:200}, 10);
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item6');
    assertEquals(lfu.freqList.head?.next?.valList.head?.key, 'item1');
    assertEquals(lfu.freqList.head?.next?.next?.valList.head?.key, 'item5');
    assertEquals(lfu.freqList.head?.next?.next?.next?.valList.head?.key, 'item4');
    assertEquals(lfu.freqList.head?.freqValue, 1);
    assertEquals(lfu.freqList.head?.next?.freqValue, 2);
    assertEquals(lfu.freqList.head?.next?.next?.freqValue, 3);
    assertEquals(lfu.freqList.head?.next?.next?.next?.freqValue, 5);
  });

  it("Deletes the from the least freqently accessed bucket, the least recently used item when over capacity", () => {
    lfu.put('item7', {headers:{}, body: new Uint8Array([7]), status:200}, 10);
    lfu.put('item8',  {headers:{}, body: new Uint8Array([8]), status:200}, 10);
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item8');
    assertEquals(lfu.freqList.head?.valList.head?.next?.key, 'item7');
    assertEquals(lfu.freqList.head?.valList.head?.prev, null);

    lfu.get('item7');
    lfu.put('item9',  {headers:{}, body: new Uint8Array([9]), status:200}, 10);
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item9');
    assertEquals(lfu.freqList.head?.valList.head?.next, null);
    assertEquals(lfu.freqList.head?.valList.head?.prev, null);

    lfu.get('item9');
    lfu.put('item10',  {headers:{}, body: new Uint8Array([10]), status:200}, 10);
    assertEquals(lfu.freqList.head?.valList.head?.key, 'item9');
    assertEquals(lfu.freqList.head?.valList.head?.next?.key, 'item7');
    assertEquals(lfu.freqList.head?.valList.head?.next?.next?.key, 'item1');
    assertEquals(lfu.freqList.head?.valList.head?.prev, null);
  });

  it("Updates an entry when put is called with an existing key", () => {
    lfu.put('item4', {headers:{}, body: new Uint8Array([100]), status:200}, 10);
    assertEquals(lfu.get('item4')?.body, new Uint8Array([100]));
  });

  it("Expires entry after set time", async () => {
    const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const shortLru = new LFU(1, new PerfMetrics, 8);
    shortLru.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    await timeout(3000);
    assert(!shortLru.get('item1'));
    assert(!shortLru.freqList.head);
    shortLru.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    await timeout(99);
    assert(shortLru.get('item2'));
    assert(shortLru.freqList.head);
  });


  it("Should properly clear cache when clear method is called", () => {
    lfu.put('item1', {headers:{}, body: new Uint8Array([1]), status:200}, 10);
    lfu.put('item2', {headers:{}, body: new Uint8Array([2]), status:200}, 10);
    lfu.put('item3', {headers:{}, body: new Uint8Array([3]), status:200}, 10);
    lfu.put('item4', {headers:{}, body: new Uint8Array([4]), status:200}, 10);
    lfu.put('item5', {headers:{}, body: new Uint8Array([5]), status:200}, 10);
    lfu.clear();
    assertEquals(lfu.freqList.head, null);
    assertEquals(lfu.freqList.tail, null);
    assertEquals(lfu.cache, {});
    assertEquals(lfu.length, 0);
  });
})
