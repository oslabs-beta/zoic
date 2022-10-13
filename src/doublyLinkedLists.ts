import { cacheValue } from '../zoic.ts'

/**
 * Class for linked list containing cached values for both LRU and LFU.
 */

export class Node {
  next: Node | null;
  prev: Node | null;
  value: cacheValue;
  key: string;
  count: number;
  byteSize: number;
  timeStamp: InstanceType<typeof Date>
  parent?: InstanceType<typeof FreqNode>

  constructor (value: cacheValue, key: string, byteSize: number, timeStamp: InstanceType<typeof Date>, parent?: InstanceType<typeof FreqNode>){
    this.next = null;
    this.prev = null;
    this.value = value;
    this.key = key;
    this.count = 1;
    this.byteSize = byteSize;
    this.timeStamp = timeStamp;
    this.parent = parent;
  }
}

export class ValueDoublyLinkedList {
  head: Node | null;
  tail: Node | null;
  constructor () {
    this.head = null;
    this.tail = null;
  }

  addHead(value: cacheValue, key: string, byteSize: number, timeStamp: InstanceType<typeof Date>){
    const node = new Node(value, key, byteSize, timeStamp);   
    if (!this.head) {
      this.head = node;
      this.tail = this.head;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    return this.head;
  }

  delete(node: InstanceType<typeof Node> | null){
    if (!node) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.head) this.head = node.next;
    if (node === this.tail) this.tail = node.prev;
    return node;
  }

  deleteTail(){
    const deleted = this.tail;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else if (this.tail) {
      this.tail = this.tail.prev
      if (this.tail) this.tail.next = null;
    }
    return deleted;
  }
}


/**
 * Class for linked list containing lists a given freqency value for LFU.
 */


export class FreqNode{
  freqValue: number;
  list: InstanceType<typeof ValueDoublyLinkedList>;
  map = new Set();
  next: FreqNode | null;
  prev: FreqNode | null;
  
  constructor(freqValue: number){
    this.freqValue = freqValue;
    this.list = new ValueDoublyLinkedList();
    this.map = new Set();
    this.next = null;
    this.prev = null;
  }
}


export class FreqDoublyLinkedList {

}