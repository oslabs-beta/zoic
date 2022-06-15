import LRU from './lru.js'


const lru = new LRU();
lru.put('a', 1)
lru.put('b', 2)
lru.put('c', 3)
lru.put('d', 4)
lru.put('b', 5)
lru.put('e', 7)
lru.put('c', 10)
lru.put('d', 11)
lru.put('d', 12)
lru.put('f', 15)
lru.put('d', 11)

lru.printLru();
lru.get('e')
lru.printLru();
console.log('length', lru.length)