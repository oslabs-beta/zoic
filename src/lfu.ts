import { DoublyLinkedList } from './doublyLinkedList.ts'
import PerfMetrics from './performanceMetrics.ts'

/**
 * Cache implementing a "least recently used" eviction policy. 
 */
class LFU {
  cache: any;
  frequencyMap: Record<string, DoublyLinkedList>;
  length: number;
  minUsage: number;
  capacity: number;
  expire: number;
  metricsDelete: () => void;
  constructor (expire: number, metrics: InstanceType<typeof PerfMetrics>, capacity: number) {
    this.cache = {};
    this.frequencyMap = {};
    this.length = 0;
    this.minUsage = 0;
    this.capacity = capacity;
    this.expire = expire;
    this.metricsDelete = metrics.deleteEntry;
  }

  /**
   * Adds new item to cache.
   * @param key 
   * @param value 
   * @returns 
   */
  put(key: string, value: any, byteSize: number) {
    if(this.cache[key]) {
      const node = this.getNode(key);
      node.value = value;
      return 0;
    }
    
    if (this.length >= this.capacity) {
      const node = this.frequencyMap[this.minUsage].deleteTail();
      if (node) delete this.cache[node.key];
    }
    else ++this.length;

    if(!this.frequencyMap[1]) this.frequencyMap[1] = new DoublyLinkedList();
    const newNode = this.frequencyMap[1].addHead(value, key, byteSize, new Date());
    //this.frequencyMap[1].length++;
    this.cache[key] = newNode;
    this.minUsage = 1;

    return 0;
  }

  get(key: string) {
    return this.getNode(key)?.value;
  }

  getNode(key: string) {
    // First check if it's in the cache
    if(!this.cache[key]) return;

    // Remove this node from DLL
    const node = this.cache[key];
    const list = this.frequencyMap[node.count];

    if(list.head === node) this.delete(key)
    else if (list.tail === node) list.deleteTail();
    else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    node.next = null;
    node.prev = null;
    //--list.length;

    // Check if the list this node was removed from is empty. If so, delete it from the frequencyMap.
    if(!list.head) {
      // Also, check it had the lowest count. If so, increment the minUsage.
      if(this.minUsage === node.count) this.minUsage++;
      delete this.frequencyMap[node.count];
    }

    // If the next list doesn't exist, create it and make the current node the tail.
    if(!this.frequencyMap[++node.count]) {
      this.frequencyMap[node.count] = new DoublyLinkedList();
      this.frequencyMap[node.count].tail = node;
    }

    // Make the node the head of the new list and return its value
    const newList = this.frequencyMap[node.count];
    node.next = newList.head;
    if(newList.head) newList.head.prev = node;
    newList.head = node;
    //this.frequencyMap[node.count].length++;
    return node;
  }

  delete (key: string) {
    const node = this.cache[key];
    if(!node) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    const list = this.frequencyMap[node.count];
    if (node === list.head) list.head = node.next;
    if (node === list.tail) list.tail = node.prev;
    delete this.cache[key];
    this.length--

    if (!list.head) {
      delete this.frequencyMap[node.count];
      this.minUsage = parseInt(Object.keys(this.frequencyMap)[0]) || 0; // n log n
    }

    return;
  }

  clear () {
    this.cache = {};
    this.frequencyMap = {};
    this.length = 0;
    this.minUsage = 0;
  }
}

// const lfu = new LFU(5)
// lfu.put('A', {body: 1});
// lfu.put('B', {body: 2});
// lfu.put('C', {body: 3});
// lfu.put('D', {body: 4});
// lfu.put('E', {body: 5});
// lfu.get('D');
// lfu.get('A');
// lfu.get('C');
// lfu.get('B');
// lfu.get('E');
// lfu.get('E');
// lfu.put('F', {body: 6});
// lfu.put('B', {body: 7});
// lfu.put('Z', {body: 8});

// //console.log(lfu)
// lfu.delete('B')
// lfu.delete('A')
// lfu.delete('Z')
// lfu.delete('B')
// lfu.delete('F')
// lfu.delete('E')
// lfu.delete('C')
// lfu.put('A', {body: 1})
// // lfu.printLFU();
// lfu.printLFU();
// console.log(lfu)

export default LFU;