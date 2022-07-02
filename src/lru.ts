import { DoublyLinkedList, Node } from './doublyLinkedList.ts'
import { cacheValue } from '../zoic.ts'
import PerfMetrics from './performanceMetrics.ts'

/**
 * Cache implementing a "least recently used" eviction policy.
 * O(n) insert, lookup, and deletion time.
 */
class LRU {
  list: DoublyLinkedList;
  cache: any //Record<string, InstanceType<typeof Node>>;
  length: number;
  capacity: number;
  expire: number;
  metrics: InstanceType<typeof PerfMetrics>;

  constructor (expire: number, metrics: InstanceType<typeof PerfMetrics>, capacity: number) {
    this.list = new DoublyLinkedList();
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
  put (key: string, value: cacheValue, byteSize: number)  {

    //if key alreadys exits in cache, replace key value with new value, and move to list head.
    if (this.cache[key]){
      this.cache[key].value = value;
      return this.get(key);
    } 

    //add new item to list head.
    this.cache[key] = this.list.addHead(value, key, byteSize, new Date());
    this.metrics.increaseBytes(byteSize);

    //evalutes if least recently used item should be evicted.
    if (this.length < this.capacity) {
      this.length++;
    } else {
      const deletedNode: InstanceType<typeof Node> | null = this.list.deleteTail();
      if (deletedNode === null) throw new Error('Node is null. Ensure cache capcity is greater than 0.');
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
  get (key: string) {

    //If there is a matching cache
    if (this.cache[key]) {

      //if entry is stale, deletes and exits
      const currentTime = new Date();
      const timeElapsed = Math.abs(currentTime.getTime() - this.cache[key].timeStamp.getTime()) / 1000;
      if (timeElapsed > this.expire) {
        this.metrics.decreaseBytes(this.cache[key].byteSize);
        this.delete(key);
        return;
      }

      // if current key is already node at head of list, return immediately.
      if (this.cache[key] === this.list.head) return this.list?.head?.value;

      //create new node, then delete node at current key, to replace at list head.
      const node = this.cache[key];
      this.delete(key);
      this.cache[key] = this.list.addHead(node.value, node.key, node.byteSize, node.timeStamp);
      this.length++;

      //Return the newly cached node, which should now be the head, to the top-level caching layer.
      return node.value;
    } 
    //If no matching cache value (cache miss), return next();
    return undefined;
  }


  /**
   * Removes item from any location in the cache.
   * @param key 
   * @returns 
   */
  delete (key: string) {

    //locates node to be removed.
    const node = this.cache[key];

    //logic for removing node and connecting prev and next items, including in cases of head or tail.
    if (!node) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.list.head) this.list.head = node.next;
    if (node === this.list.tail) this.list.tail = node.prev;

    //removes item from cache map.
    delete this.cache[key];
    this.length--;

    return node;
  }

  
  /**
   * Clears entire cache contents.
   */
  clear () {
    this.list = new DoublyLinkedList();
    this.cache = {};
    this.length = 0;
  }
}

export default LRU;