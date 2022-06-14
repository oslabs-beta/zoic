function Node (value, next) {
  this.next = next;
  this.prev = null;
  this.value = value;
}

class DoublyLinkedList {
  constructor () {
    this.head = null;
    this.tail = null;
  }

  addHead (value) {
    // const node = new Node(value);
    this.head = new Node(value, this.head);
    
    if (!this.tail) {
      this.tail = this.head;
      // return node;
    }
    else {
      this.head.next.prev = this.head;
    }
    return this.head;
    
    // node.next = this.head;
    // this.head.prev = node;
    // this.head = node;
    // return node;
  }

  deleteTail () {
    this.tail = this.tail.prev;
    this.tail.next = null;
  }
  
  move () {

  }

  printList() {
    let current = this.head;
    while(current) {
      console.log(current.value)
      current = current.next;
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
    this.map[key] = this.list.addHead(value);
    this.length++;
    if (this.capacity >= this.length){
      this.list.deleteTail();
    }
  }

  get (key) {

  }
}

const dbl = new DoublyLinkedList();
dbl.addHead(3);
dbl.addHead(5);
dbl.addHead(7);
// console.log(dbl)
dbl.printList();