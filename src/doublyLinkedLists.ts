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

  constructor (key: string, value: cacheValue, byteSize: number, timeStamp: Date, parent?: FreqNode){
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

  addHead(key: string, value: cacheValue, byteSize: number, timeStamp: Date, parent?: FreqNode){
    const node = new Node(key, value, byteSize, timeStamp, parent);   
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
    if (!this.head) {
      this.head = new FreqNode(1);
      this.tail = this.head;
    } else if (this.head.freqValue !== 1) {
      const freqNode = new FreqNode(1);
      freqNode.next = this.head;
      this.head.prev = freqNode;
      this.head = freqNode;
    }
    return this.head.valList.addHead(key, value, byteSize, timeStamp, this.head);
  }

  increaseFreq(node: Node){
    if (!node.parent) return;
    const { key, value, byteSize, timeStamp, parent } = node;

    //is highest freq
    if (!parent.next){
      const freqNode = new FreqNode(parent.freqValue + 1);

      parent.next = freqNode;
      freqNode.prev = parent;
      this.tail = freqNode;

    //freq + 1 does not exist
    } else if (parent.next.freqValue !== parent.freqValue + 1){
      const freqNode = new FreqNode(parent.freqValue + 1);

      const temp = parent.next;
      parent.next = freqNode;
      freqNode.prev = parent;
      freqNode.next = temp;
      temp.prev = freqNode;
    }

    this.deleteValNode(node);
    return parent.next.valList.addHead(key, value, byteSize, timeStamp, parent.next);
  }

  //deletes tail of least frequently accessed list
  deleteLeastFreq(){
    if (!this.head) return;
    return this.deleteValNode(this.head.valList.tail)
    // const { valList } = this.head;
    // const deleted = valList.deleteTail();
    // if (!valList.head) this.delete(this.head);
    // return deleted;
  }

  deleteValNode(node: Node | null){
    if (!node || !node.parent) return;
    const { valList } = node.parent;
    valList.delete(node);
    if (!valList.head) this.delete(node.parent);
    return node;
  }

  delete(freqNode: FreqNode | null){
    if (!freqNode) return;
    if (freqNode.prev) freqNode.prev.next = freqNode.next;
    if (freqNode.next) freqNode.next.prev = freqNode.prev;
    if (freqNode === this.head) this.head = freqNode.next;
    if (freqNode === this.tail) this.tail = freqNode.prev;
    return freqNode;
  }
}