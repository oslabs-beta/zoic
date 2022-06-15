function Node (value, next, key) {
  this.next = next;
  this.prev = null;
  this.value = value;
  this.key = key; // added this to delete the value from the cache
}

class DoublyLinkedList {
  constructor () {
    this.head = null;
    this.tail = null;
  }

  addHead (value, key) {
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
  constructor () {
    this.list = new DoublyLinkedList();
    this.map = {};
    this.length = 0;
    this.capacity = 10;
  }

  put (key, value) {
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
    return this.map[key];
  }


  get (key) {
    if (this.map[key]) {
      const node = this.map[key];

      if (this.list.head === node) return node.value;
      else if (this.list.tail === node) this.list.deleteTail();
      else {
        node.prev.next = node.next;
        node.next.prev = node.prev;

        node.next = null;
        node.prev = null;
      }
      return this.list.addHead(node.value, node.key).value;
    } 
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