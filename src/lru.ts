class Node {
  next: Node | null;
  prev: Node | null;
  value: any;
  key: string;
  constructor (value: any, next: Node | null, key: any){
    this.next = next;
    this.prev = null;
    this.value = value;
    this.key = key; // added this to delete the value from the cache
  }
}

class DoublyLinkedList {
  head: any;
  tail: any;
  constructor () {
    this.head = null;
    this.tail = null;
  }

  addHead (value: any, key: any) {
    this.head = new Node(value, this.head, key);
  
    if (!this.tail) this.tail = this.head;
    else this.head.next.prev = this.head;
    
    return this.head;
  }

  deleteTail () {
    const deleted = this.tail; // what if head is null? it returns null?
    if (this.head === this.tail) this.head = this.tail = null;
    else {
      this.tail = this.tail.prev
      this.tail.next = null;
    }
    return deleted;
  }

  deleteHead () {
    const deleted = this.head; // what if head is null? it returns null?
    if (this.head === this.tail) this.head = this.tail = null;
    else {
      this.head = this.head.next
      this.head.prev = null;
    }
    return deleted;
  }

  printList() {
    let current = this.tail;
    while(current) {
      console.log(current.key + ': ' + current.value)
      current = current.prev;
    }
  }
}

class LRU {
  list: DoublyLinkedList;
  map: any;
  length: number;
  capacity: number;
  constructor () {
    this.list = new DoublyLinkedList();
    this.map = {};
    this.length = 0;
    this.capacity = 10;

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
  }

  put (key: string, value: any)  {

    // should we be moving replaced key/value pair to the head of the list?
    if (this.map[key]) {
      const node: any = this.map[key];

      if (this.list.head === node) this.list.deleteHead();
      else if (this.list.tail === node) this.list.deleteTail();
      else {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }
      --this.length;
    }

    this.map[key] = this.list.addHead(value, key);
    if (this.length < this.capacity) this.length++;
    else {
      const deletedNode: any = this.list.deleteTail();
      delete this.map[deletedNode.key];
    }
    return +1;
  }

  get (key: string) {
   
    console.log('key in get function', key)

    //If there is a matching cache
    if (this.map[key]) {
      const node = this.map[key];
      
      if (this.list.head === node) return this.list.head;
      else if (this.list.tail === node) this.list.deleteTail();
      else {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        //Failsafe to make sure the removed node is separated from everything else
        node.next = null;
        node.prev = null;
      }
      //Add new head to the list
      this.list.addHead(node.value, node.key).value;
      //Return the newly cached node, which should now be the head, to the top-level caching layer
      return this.list.head.value;
    } 
    //If no matching cache value (cache miss), return next();
    return undefined;
  }

  printLru() {
    console.log('LIST')
    this.list.printList();
    console.log('\n')
  }

}


export default LRU;