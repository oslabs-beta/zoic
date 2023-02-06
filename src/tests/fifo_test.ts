import {
  assertEquals,
  assert,
} from 'https://deno.land/std@0.145.0/testing/asserts.ts';
import { describe, it } from 'https://deno.land/std@0.145.0/testing/bdd.ts';
import PerfMetrics from '../performanceMetrics.ts';
import FIFO from '../fifo.ts';

describe('FIFO tests', () => {
  it('adds a new item to the cache', () => {
    FIFO.put(
      'item1',
      { headers: {}, body: new Uint8Array([1]), status: 200 },
      10,
    );
    assertEquals(FIFO.cache.item1.value.body, new Uint8Array([1]));
  });
});
