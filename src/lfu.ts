import { FreqDoublyLinkedList, Node } from './doublyLinkedLists.ts'
import { cacheValue } from '../zoic.ts'
import PerfMetrics from './performanceMetrics.ts'


/**
 * Spec as per:
 * http://dhruvbird.com/lfu.pdf
 */

class LFU {
  freqList: FreqDoublyLinkedList;
  cache: Record<string, Node>;
  length: number;
  capacity: number;
  expire: number;
  metrics: PerfMetrics;

  constructor(expire: number, metrics: PerfMetrics, capacity: number){
    this.freqList = new FreqDoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.capacity = capacity;
    this.expire = expire;
    this.metrics = metrics;
  }

  /**
   * Adds new item to cache.
   * @param key 
   * @param value 
   * @returns 
   */
  put(key: string, value: cacheValue, byteSize: number){

    if (this.cache[key]){
      this.metrics.decreaseBytes(this.cache[key].byteSize);
      this.metrics.increaseBytes(byteSize);

      this.cache[key].value = value;
      return this.get(key);
    }

    this.cache[key] = this.freqList.addNewFreq(key, value, byteSize, new Date());
    this.metrics.increaseBytes(byteSize);

    if (this.length < this.capacity) {
      this.length++;
    } else {
      const deletedNode: Node | undefined = this.freqList.deleteLeastFreq();
      if (!deletedNode) throw new Error('Node is null. Ensure cache capcity is greater than 0.');
      delete this.cache[deletedNode.key];
      this.metrics.decreaseBytes(deletedNode.byteSize);
    }

    return;
  }

  get(key: string){

    if (!this.cache[key]) return;

    //if entry is stale, deletes and exits
    const currentTime = new Date();
    const timeElapsed = Math.abs(currentTime.getTime() - this.cache[key].timeStamp.getTime()) / 1000;
    if (timeElapsed > this.expire) {
      this.metrics.decreaseBytes(this.cache[key].byteSize);
      this.delete(key);
      return;
    }
    const node = this.freqList.increaseFreq(this.cache[key]);
    return node?.value;
  }

  delete(key: string){
    const node = this.cache[key];
    if (!node) return;

    this.freqList.deleteValNode(node);

    delete this.cache[key];
    this.length--;

    return node;
  }

  clear(){
    this.freqList = new FreqDoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.metrics.clearEntires();
  }
}

export default LFU;