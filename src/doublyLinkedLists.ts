import type { CacheValue } from './types.ts'

/**
 * Class definition for linked list containing cached values for both LRU and LFU.
 */
export class Node {
  next: Node | null;
  prev: Node | null;
  value: CacheValue;
  key: string;
  count: number;
  byteSize: number;
  timeStamp: Date;
  parent?: FreqNode;

  constructor(
      key: string,
      value: CacheValue,
      byteSize: number,
      timeStamp: Date,
      parent?: FreqNode
  ) {
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

  constructor(){
    this.head = null;
    this.tail = null;
  }

  public addHead(
      key: string,
      value: CacheValue,
      byteSize: number,
      timeStamp: Date,
      parent?: FreqNode
  ): Node {
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

  public delete(node: Node | null): Node | undefined {
    if (!node) {
      return;
    }

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    return node;
  }

  public deleteTail(): Node | null {
    if (!this.tail) {
        return null;
    }

    const deleted = this.tail;
    if (this.head === this.tail) {
        // handle single-node case
        this.head = this.tail = null;
    } else {
        // handle multiple-node case
        this.tail = this.tail.prev;
        if (this.tail) {
            this.tail.next = null;
        }
    }

    // cleanup for deleted node's references
    deleted.prev = null;
    deleted.next = null;

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

  constructor(freqValue: number) {
    this.freqValue = freqValue;
    this.valList = new ValueDoublyLinkedList();
    this.next = null;
    this.prev = null;
  }
}


export class FreqDoublyLinkedList {
  head: FreqNode | null;
  tail: FreqNode | null;

  constructor() {
    //head being lowest freq item, tail being highest.
    this.head = null;
    this.tail = null;
  }

  public addNewFreq(key: string, value: CacheValue, byteSize: number, timeStamp: Date): Node {
    if (!this.head) {
      this.head = new FreqNode(1);
      this.tail = this.head;
    } else if (this.head.freqValue !== 1) {
      const freqNode = new FreqNode(1);
      this.head.prev = freqNode;
      freqNode.next = this.head;
      this.head = freqNode;
    }

    return this.head.valList.addHead(key, value, byteSize, timeStamp, this.head);
  }

  public increaseFreq(node: Node): Node | undefined {
    if (!node.parent) {
        return;
    }

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

  public deleteLeastFreq = (): Node | undefined => this.head ?
    this.deleteValNode(this.head.valList.tail)
    : undefined;

  public deleteValNode(node: Node | null): Node | undefined {
    if (!node || !node.parent) {
        return;
    }

    const { valList } = node.parent;
    valList.delete(node);
    if (!valList.head) {
        this.delete(node.parent);
    }

    return node;
  }

  public delete(freqNode: FreqNode | null): FreqNode | undefined {
    if (!freqNode) {
      return;
    }

    if (freqNode.prev) {
      freqNode.prev.next = freqNode.next;
    } else {
        this.head = freqNode.next;
    }

    if (freqNode.next) {
      freqNode.next.prev = freqNode.prev;
    } else {
        this.tail = freqNode.prev;
    }

    return freqNode;
  }
}
