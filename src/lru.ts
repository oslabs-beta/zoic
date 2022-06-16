class Node {
  next: Node | null;
  prev: Node | null;
  value: any;
  key: any;
  constructor (value: any, next: Node | null, key: any){
    this.next = next;
    this.prev = null;
    this.value = value;
    this.key = key; // added this to delete the value from the cache
  }
}

class DoublyLinkedList {
  head: Node | null;
  tail: Node | null;
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
  
  // moveNode (node) {
  //   const OGprevNode = node.prev;

  //   //Bypass the current node in the original linkedlist
  //   node.prev.next = node.next;
  //   node.next.prev = OGprevNode;
  //   node.next = null;
  //   node.prev = null;

  //   return this.addHead(node.value, node.key);
  // }

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
  constructor (map: object = {}, length: number = 0, capacity: number = 10) {
    this.list = new DoublyLinkedList();
    this.map = {};
    this.length = 0;
    this.capacity = 10;

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
  }

  put (ctx, next) {

    const value = ctx.state.zoic;


    const key = ctx.request.url.pathname + ctx.request.url.search;
    console.log('key in put function', key)

    console.log('key: ', key)
    // should we be moving replaced key/value pair to the head of the list?
    if (this.map[key]) {
      const node = this.map[key];

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
      const deletedNode = this.list.deleteTail();
      delete this.map[deletedNode.key];
    }

    console.log(this.list)

    return next();
  }


  get (ctx, next) {
    console.log('this.list.head: ', this.list.head)
    console.log('this.list.tail: ', this.list.tail)
    // console.log('ctx', ctx);

    //Endpoint
    // console.log('ctx.request.url.href ',ctx.request.url.href)
    // console.log('ctx.request.url.searchParams', ctx.request.url.searchParams)
    console.log(ctx.request.url.pathname)
    console.log(ctx.request.url.search)

    const key = ctx.request.url.pathname + ctx.request.url.search;
    console.log('key in get function', key)

    // console.log('lru.length: ', lru.length)
    //If there is a matching cacheß
    if (this.map[key]) {
      const node = this.map[key];

      ctx.reponse.zoic = node.value;
      
      if (this.list.head === node) return next();
      else if (this.list.tail === node) this.list.deleteTail();
      else {
        node.prev.next = node.next;
        node.next.prev = node.prev;

        node.next = null;
        node.prev = null;
      }
      this.list.addHead(node.value, node.key).value;

      return next();
    } 

    //If no matching cache value (cache miss), return next();
    ctx.response.zoic = undefined;
    return next();
  }


  // get (key) {
  //   //See if key exists in our current map
  //   if(this.map[key]){
  //     //Also need to move this node to the front/head of the linked list.
  //     this.list.moveNode(this.map[key]);
  //     //Return the value
  //     return this.map[key].value;
  //   } //If not, return undefined, continue on with the user's middleware chain, and save the result via the put function AFTER
  //   //the user finishes their middleware stuff
  //   else {
  //    return undefined;
  //   }
  // }

  printLru() {
    console.log('LIST')
    this.list.printList();
    console.log('\n')
    //console.log('CACHE')
    //for(const i in this.map) console.log(i + ': ' + this.map[i].value);
  }

}



export default LRU;