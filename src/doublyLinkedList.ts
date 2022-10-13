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
  head: InstanceType<typeof Node> | null;
  tail: InstanceType<typeof Node> | null;
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