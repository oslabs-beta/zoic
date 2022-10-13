import { DoublyLinkedList, Node } from './doublyLinkedList.ts'
import { cacheValue } from '../zoic.ts'
import PerfMetrics from './performanceMetrics.ts'


class LFU {
  freqList: DoublyLinkedList;
  cache: Record<string, InstanceType<typeof Node>>;
  length: number;
  capacity: number;
  expire: number;
  metrics: InstanceType<typeof PerfMetrics>;

  constructor(expire: number, metrics: InstanceType<typeof PerfMetrics>, capacity: number){
    this.freqList = new DoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.capacity = capacity;
    this.expire = expire;
    this.metrics = metrics;
  }

  put(key: string, value: cacheValue, byteSize: number){

  };

  get(key: string){

  };

  delete(key: string){

  };

  clear(){

  };
}

export default LFU;