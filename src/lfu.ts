import { DoublyLinkedList } from './doublyLinkedList.ts'

class LFU {
  cache: any;
  map: Record<string, DoublyLinkedList>;
  count: number;
  minUsage: number;
  capacity: number;
  constructor () {
    this.cache = {};
    this.map = {};
    this.count = 0;
    this.minUsage = 0;
    this.capacity = 5;
  }

  put(key: string, value: any) {
    if(this.cache[key]) {
      const node = this.getNode(key);
      node.value = value;
      return 0;
    }

    
    if(this.count === this.capacity) this.map[this.minUsage].deleteTail();
    else ++this.count;

    if(!this.map[1]) this.map[1] = new DoublyLinkedList();
    const newNode = this.map[1].addHead(value, key);
    this.map[1].length++;
    this.cache[key] = newNode;
    this.minUsage = 1;

    return 0;
  }

  get(key: string) {
    return this.getNode(key).value;
  }

  getNode(key: string) {
    // First check if it's in the cache
    if(!this.cache[key]) return;

    // Remove this node from DLL
    const node = this.cache[key];
    const list = this.map[node.count];

    if(list.head === node) list.deleteHead();
    else if (list.tail === node) list.deleteTail();
    else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    node.next = null;
    node.prev = null;
    --list.length;

    // Check if the list this node was removed from is empty. If so, delete it from the map.
    if(list.length === 0) {
      // Also, check it had the lowest count. If so, increment the minUsage.
      if(this.minUsage === node.count) this.minUsage++;
      delete this.map[node.count];
    }

    // If the next list doesn't exist, create it and make the current node the tail.
    if(!this.map[++node.count]) {
      this.map[node.count] = new DoublyLinkedList();
      this.map[node.count].tail = node;
    }

    // Make the node the head of the new list and return its value
    const newList = this.map[node.count];
    node.next = newList.head;
    if(newList.head) newList.head.prev = node;
    newList.head = node;
    return node.value;
  }

  //TODO: also delete from cache
  printLFU() {
    for(let i = 1; i < 5; i++) {
      if(this.map[i]) {
        const e = this.map[i];
        console.log(e.head.count)
        e.printList();
      }
    }
  }


}

export default LFU;