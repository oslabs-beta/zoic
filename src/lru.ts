import { Node, ValueDoublyLinkedList } from "./doublyLinkedLists.ts";
import { cacheValue } from "./types.ts";
import PerfMetrics from "./performanceMetrics.ts";

/**
 * Cache implementing a least recently used eviction policy.
 * O(1) insert, lookup, and deletion time.
 */
class LRU {
  list: ValueDoublyLinkedList;
  cache: Record<string, Node>;
  length: number;
  capacity: number;
  expire: number;
  metrics: PerfMetrics;

  constructor(expire: number, metrics: PerfMetrics, capacity: number) {
    this.list = new ValueDoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.capacity = capacity;
    this.expire = expire;
    this.metrics = metrics;

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
  }

  /**
   * Adds new item to cache.
   * @param key
   * @param value
   * @returns
   */
  put(key: string, value: cacheValue, byteSize: number) {
    //if key alreadys exits in cache, replace key value with new value, and move to list head.
    if (this.cache[key]) {
      this.metrics.decreaseBytes(this.cache[key].byteSize);
      this.metrics.increaseBytes(byteSize);

      this.cache[key].value = value;
      return this.get(key);
    }

    //add new item to list head.
    this.cache[key] = this.list.addHead(key, value, byteSize, new Date());
    this.metrics.increaseBytes(byteSize);

    //evalutes if least recently used item should be evicted.
    if (this.length < this.capacity) {
      this.length++;
    } else {
      const deletedNode: Node | null = this.list.deleteTail();
      if (deletedNode === null) {
        throw new Error(
          "Node is null. Ensure cache capcity is greater than 0.",
        );
      }
      delete this.cache[deletedNode.key];
      this.metrics.decreaseBytes(deletedNode.byteSize);
    }

    return;
  }

  /**
   * Gets item from cache and moves to head -- most recently used.
   * @param key
   * @returns
   */
  get(key: string) {
    //If no matching cache value (cache miss), return next();
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

    // if current key is already node at head of list, return immediately.
    if (this.cache[key] === this.list.head) return this.list.head.value;

    //create new node, then delete node at current key, to replace at list head.
    const node = this.cache[key];
    this.delete(key);
    this.cache[key] = this.list.addHead(
      node.key,
      node.value,
      node.byteSize,
      node.timeStamp,
    );
    this.length++;

    //Return the newly cached node, which should now be the head, to the top-level caching layer.
    return node.value;
  }

  /**
   * Removes item from any location in the cache.
   * @param key
   * @returns
   */
  delete(key: string) {
    const node = this.cache[key];
    if (!node) return;

    this.list.delete(node);
    delete this.cache[key];
    this.length--;

    return node;
  }

  /**
   * Clears entire cache contents.
   */
  clear() {
    this.list = new ValueDoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.metrics.clearEntires();
  }
}

export default LRU;
