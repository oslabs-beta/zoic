import { FreqDoublyLinkedList, Node } from './doublyLinkedLists.ts'
import { cacheValue } from '../zoic.ts'
import PerfMetrics from './performanceMetrics.ts'


/**
 * Speck as per http://dhruvbird.com/lfu.pdf
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

  put(key: string, value: cacheValue, byteSize: number){

    if (this.cache[key]){
      this.cache[key].value = value;
      return this.get(key);
    }

    this.cache[key] = this.freqList.addNewFreq(key, value, byteSize, new Date());
    this.metrics.increaseBytes(byteSize);

    if (this.length < this.capacity) {
      this.length++;
    } else {
      const deletedNode: Node | null = this.freqList.deleteLeastFreq();
      if (deletedNode === null) throw new Error('Node is null. Ensure cache capcity is greater than 0.');
      delete this.cache[deletedNode.key];
      this.metrics.decreaseBytes(deletedNode.byteSize);
    }

    return;
  }

  get(key: string){

  }

  delete(key: string){

  }

  clear(){

  }
}

export default LFU;