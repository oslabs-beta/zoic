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
  }


  //adds new item to cache.
  put (key: string, value: any)  {

    //if key alreadys exits in cache, replace key value with new value, and move to list head.
    if (this.cache[key]){
      this.cache[key].value = value;
      return this.get(key);
    } 

    //add new item to list head.
    this.cache[key] = this.list.addHead(value, key);

    //evalutes if least recently used item should be evicted.
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


  //gets item from cache and moves to head -- most recently used.
  get (key: string) {

    //If there is a matching cache
    if (this.cache[key]) {

      //create new node, then delete node at current key, to replace at list head.
      const node = this.cache[key];
      this.delete(key)
      this.cache[key] = this.list.addHead(node.value, node.key);
      this.length++;

      //Return the newly cached node, which should now be the head, to the top-level caching layer.
      return this.list.head.value;
    } 
    //If no matching cache value (cache miss), return next();
    return undefined;
  }


  //removes item from any location in the cache.
  delete (key: string) {

    //locates node to be removed in constant time.
    const node = this.cache[key];

    //logic for removing node and connecting prev and next items, including in cases of head or tail.
    if (!node) return;
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this.list.head) this.list.head = node.next;
    if (node === this.list.tail) this.list.tail = node.prev;

    //removes item from cache map.
    delete this.cache[key];
    this.length--;

    return;
  }

  //clears entire cache contents.
  clear () {
    this.list = new DoublyLinkedList();
    this.cache = {};
    this.length = 0;
  }


  //prints list and cache for testing purposes.
  printLru() {
    console.log('cache\n', this.cache)
    console.log('this.list: ', this.list)
    console.log('LIST')
    this.list.printList();
    console.log('\n')
  }

}

// const lru = new LRU(5)
// lru.put('A', {body: 1});
// lru.put('B', {body: 2});
// lru.put('C', {body: 3});
// lru.get('A');
// lru.get('C');
// lru.get('B');
// lru.put('D', {body: 4});
// lru.put('D', {body: 1000})
// lru.put('E', {body: 5});
// lru.delete('A')
// lru.delete('B')
// lru.delete('C')
// lru.delete('D')
// lru.delete('B')
// lru.delete('E')
// // lru.put('e', {body: 7})
// // lru.put('hello', {body: 9})
// lru.printLru();

export default LRU;