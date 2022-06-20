class Node {
    constructor (value, next, key) {
      this.next = next;
      this.prev = null;
      this.value = value;
      this.key = key;
      this.count = 1;
    }
  }
      
  class DoublyLinkedList {
    constructor () {
      this.length = 0;
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
    
    printList() {
      let current = this.tail;
      while(current) {
        console.log(current.key + ': ' + current.value)
        current = current.prev;
      }
    }
  }
  
  class LFU {
    constructor () {
      this.cache = {};
      this.frequencyList = new DoublyLinkedList();
    //   this.frequencyMap = {};
      this.count = 0;
      this.minUsage = 0;
      this.capacity = 5;
    }
  
    put(key, value) {
      if(this.cache[key]) {
        const node = this.getNode(key);
        node.value = value;
        return;
      }
      
      if(this.count === this.capacity) {
        const node = this.frequencyList[this.minUsage].deleteTail();
        delete this.cache[node.key];
      }
      else ++this.count;
  
      if(!this.frequencyList[1]) this.frequencyList[1] = new DoublyLinkedList();
      const newNode = this.frequencyList[1].addHead(value, key);
      this.frequencyList[1].length++;
      this.cache[key] = newNode;
      this.minUsage = 1;
    }
  
    get(key) {
      return this.getNode(key)?.value;
    }
  
    getNode(key) {
      // First check if it's in the cache
      if(!this.cache[key]) return;
  
      // Remove this node from DLL
      const node = this.cache[key];
      const list = this.frequencyList[node.count];
  
      if (list.head === node) list.deleteHead();
      else if (list.tail === node) list.deleteTail();
      else {
        node.prev.next = node.next;
        node.next.prev = node.prev;
      }
      node.next = null;
      node.prev = null;
      --list.length;
  
      // Check if the list this node was removed from is empty. If so, delete it from the frequencyList.
      if(list.length === 0) {
        // Also, check it had the lowest count. If so, increment the minUsage.
        if(this.minUsage === node.count) this.minUsage++;
        delete this.frequencyList[node.count];
      }
  
      // If the next list doesn't exist, create it and make the current node the tail.
      if(!this.frequencyList[++node.count]) {
        this.frequencyList[node.count] = new DoublyLinkedList();
        this.frequencyList[node.count].tail = node;
      }
  
      // Make the node the head of the new list and return its value
      const newList = this.frequencyList[node.count];
      node.next = newList.head;
      if(newList.head) newList.head.prev = node;
      newList.head = node;
      return node;
    }
  
    printLFU() {
      for(let i = 1; i < 5; i++) {
        if(this.frequencyList[i]) {
          const e = this.frequencyList[i];
          console.log(e.head.count)
          e.printList();
        }
      }
    }

  
  }
    
  const lfu = new LFU();
  // lfu.printLFU();
  lfu.put('A', 1);
  lfu.put('B', 2);
  lfu.put('C', 3);
  lfu.put('D', 4);
  lfu.put('E', 5);
  lfu.get('D');
  lfu.get('A');
  lfu.get('C');
  lfu.get('B');
  lfu.get('E');
  lfu.get('E');
  lfu.put('F', 6);
  lfu.put('B', 7);
  lfu.put('Z', 7);
  lfu.printLFU();
  console.log(Object.keys(lfu.cache));