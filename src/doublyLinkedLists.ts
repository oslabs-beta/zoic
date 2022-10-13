import { cacheValue } from '../zoic.ts'

/**
 * Class definition for linked list containing cached values for both LRU and LFU.
 */

export class Node {
  next: Node | null;
  prev: Node | null;
  value: cacheValue;
  key: string;
  count: number;
  byteSize: number;
  timeStamp: Date;
  parent?: FreqNode;

  constructor (value: cacheValue, key: string, byteSize: number, timeStamp: Date, parent?: FreqNode){
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

  addHead(key: string, value: cacheValue, byteSize: number, timeStamp: Date){
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

  delete(node: Node | null){
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
 * Class definition for linked list containing lists a given freqency value for LFU.
 */

export class FreqNode {
  freqValue: number;
  valList: ValueDoublyLinkedList;
  next: FreqNode | null;
  prev: FreqNode | null;

  constructor(freqValue: number){
    this.freqValue = freqValue;
    this.valList = new ValueDoublyLinkedList();
    this.next = null;
    this.prev = null;
  }
}


export class FreqDoublyLinkedList {
  head: FreqNode | null;
  tail: FreqNode | null;

  constructor () {
    //head being lowest freq item, tail being highest.
    this.head = null;
    this.tail = null;
  }

  addNewFreq(key: string, value: cacheValue, byteSize: number, timeStamp: Date){
    const freqNode = new FreqNode(1);
    const valNode = freqNode.valList.addHead(key, value, byteSize, timeStamp);

    if (!this.head) {
      this.head = freqNode;
      this.tail = this.head;
    } else {
      freqNode.next = this.head;
      this.head.prev = freqNode;
      this.head = freqNode;
    }

    return valNode;
  }

  delete(freqNode: FreqNode | null){
    if (!freqNode) return;
    if (freqNode.prev) freqNode.prev.next = freqNode.next;
    if (freqNode.next) freqNode.next.prev = freqNode.prev;
    if (freqNode === this.head) this.head = freqNode.next;
    if (freqNode === this.tail) this.tail = freqNode.prev;
    return freqNode;
  }

  deleteLeastFreq(){
    //deletes tail of least frequently accessed list
    if (!this.head) return null;
    const leastFreqList = this.head.valList;
    return leastFreqList.deleteTail();
  }
}