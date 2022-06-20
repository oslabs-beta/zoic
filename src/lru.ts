import { DoublyLinkedList } from './doublyLinkedList.ts'

class LRU {
  list: DoublyLinkedList;
  cache: any;
  length: number;
  capacity: number;
  expire: number;
  constructor (expire: number) {
    this.list = new DoublyLinkedList();
    this.cache = {};
    this.length = 0;
    this.capacity = 10;
    this.expire = expire;

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.printLru = this.printLru.bind(this);
  }

  put (key: string, value: any)  {

    // should we be moving replaced key/value pair to the head of the list?
    if (this.cache[key]) this.delete(key);

    this.cache[key] = this.list.addHead(value, key);
    if (this.length < this.capacity) this.length++;
    else {
      const deletedNode: any = this.list.deleteTail();
      delete this.cache[deletedNode.key];
    }

    //deletes node after set expiration time.
    setTimeout(() => {
      if (this.cache[key]) {
        this.delete(key);
        console.log(`node at key '${key}' expired.`);
      }    
    }, this.expire * 1000);

    return 0;
  }

  get (key: string) {

    //If there is a matching cache
    if (this.cache[key]) {
      const node = this.cache[key];
      
      if (node === this.list.head) return this.list.head.value;
      if (node.prev) node.prev.next = node.next;
      if (node.next) node.next.prev = node.prev;
      if (node === this.list.tail) this.list.tail = node.prev;

      this.list.addHead(node.value, node.key);
      //Return the newly cached node, which should now be the head, to the top-level caching layer
      return this.list.head.value;
    } 
    //If no matching cache value (cache miss), return next();
    return undefined;
  }

  delete (key: string) {
    const node = this.cache[key];
    if (!node) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.list.head) this.list.head = node.next;
    if (node === this.list.tail) this.list.tail = node.prev;
    delete this.cache[key];
    this.length--;
    return;
  }

  clear () {
    this.list = new DoublyLinkedList();
    this.cache = {};
    this.length = 0;
  }

  printLru() {
    console.log('cache\n', this.cache)
    console.log('this.list: ', this.list)
    console.log('LIST')
    this.list.printList();
    console.log('\n')
  }

}

const lru = new LRU(5)
lru.put('A', {body: 1});
lru.put('B', {body: 2});
lru.put('C', {body: 3});
lru.get('A');
lru.get('C');
lru.get('B');
lru.put('D', {body: 4});
lru.put('E', {body: 5});
lru.delete('B')
lru.delete('A')
lru.delete('D')
lru.delete('E')
lru.delete('C')
lru.printLru();

export default LRU;