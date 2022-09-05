import { cacheValue } from '../zoic.ts'

export class Node {
  next: Node | null;
  prev: Node | null;
  value: cacheValue;
  key: string;
  count: number;
  byteSize: number;
  timeStamp: InstanceType<typeof Date>

  constructor (value: cacheValue, key: string, byteSize: number, timeStamp: InstanceType<typeof Date>){
    this.next = null;
    this.prev = null;
    this.value = value;
    this.key = key;
    this.count = 1;
    this.byteSize = byteSize;
    this.timeStamp = timeStamp;
  }
}

export class DoublyLinkedList {
  head: Node | null;
  tail: Node | null;
  constructor () {
    this.head = null;
    this.tail = null;
  }

  addHead (value: cacheValue, key: string, byteSize: number, timeStamp: InstanceType<typeof Date>) {
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

  deleteTail () {
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