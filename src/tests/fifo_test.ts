import { assertEquals } from 'https://deno.land/std@0.145.0/testing/asserts.ts';
import { describe, it } from 'https://deno.land/std@0.145.0/testing/bdd.ts';
import PerfMetrics from '../performanceMetrics.ts';
import FIFO from '../fifo.ts';

describe('FIFO tests', () => {
  const fifo = new FIFO(50, new PerfMetrics(), 6);

  it('Adds new items to the cache', () => {
    fifo.put(
      'item1',
      { headers: {}, body: new Uint8Array([1]), status: 200 },
      10,
    );
    fifo.put(
      'item2',
      { headers: {}, body: new Uint8Array([2]), status: 200 },
      10,
    );
    fifo.put(
      'item3',
      { headers: {}, body: new Uint8Array([3]), status: 200 },
      10,
    );
    fifo.put(
      'item4',
      { headers: {}, body: new Uint8Array([4]), status: 200 },
      10,
    );
    fifo.put(
      'item5',
      { headers: {}, body: new Uint8Array([5]), status: 200 },
      10,
    );
    assertEquals(fifo.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(fifo.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(fifo.cache.item3.value.body, new Uint8Array([3]));
    assertEquals(fifo.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(fifo.cache.item5.value.body, new Uint8Array([5]));
    assertEquals(fifo.list.head?.key, 'item1');
    assertEquals(fifo.list.tail?.key, 'item5');
    assertEquals(fifo.length, 5);
  });

  it('Returns undefined when get is called on a non-existing key', () => {
    assertEquals(fifo.get('asdf'), undefined);
  });

  it('Gets item from cache', () => {
    const item = fifo.get('item3');
    assertEquals(fifo.cache.item3.value, item);
    assertEquals(fifo.cache.item1.value.body, new Uint8Array([1]));
    assertEquals(fifo.cache.item2.value.body, new Uint8Array([2]));
    assertEquals(fifo.cache.item3.value.body, new Uint8Array([3]));
    assertEquals(fifo.cache.item4.value.body, new Uint8Array([4]));
    assertEquals(fifo.cache.item5.value.body, new Uint8Array([5]));
  });
});
