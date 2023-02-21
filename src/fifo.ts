import { Node } from './doublyLinkedLists.ts';
import LRU from './lru.ts';
import PerfMetrics from './performanceMetrics.ts';
import { cacheValue } from './types.ts';

class FIFO extends LRU {
  constructor(expire: number, metrics: PerfMetrics, capacity: number) {
    super(expire, metrics, capacity);
  }
  put(key: string, value: cacheValue, byteSize: number) {
    //if key alreadys exits in cache, replace key value with new value
    if (this.cache[key]) {
      this.metrics.decreaseBytes(this.cache[key].byteSize);
      this.metrics.increaseBytes(byteSize);

      this.cache[key].value = value;
      return this.get(key);
    }

    //add new item to list tail
    this.cache[key] = this.list.addTail(key, value, byteSize, new Date());
    this.metrics.increaseBytes(byteSize);

    //evalutes if first item in FIFO should be evicted
    if (this.length < this.capacity) {
      this.length++;
    } else {
      const deletedNode: Node | null = this.list.deleteHead();
      if (deletedNode === null)
        throw new Error(
          'Node is null. Ensure cache capcity is greater than 0.',
        );
      delete this.cache[deletedNode.key];
      this.metrics.decreaseBytes(deletedNode.byteSize);
    }

    return;
  }

  get(key: string) {
    if (!this.cache[key]) return undefined;

    //if entry is stale, deletes and exits
    const currentTime = new Date();
    const timeElapsed =
      Math.abs(currentTime.getTime() - this.cache[key].timeStamp.getTime()) /
      1000;
    if (timeElapsed > this.expire) {
      this.metrics.decreaseBytes(this.cache[key].byteSize);
      this.delete(key);
      return;
    }

    return this.cache[key].value;
  }
}

export default FIFO;
