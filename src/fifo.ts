import LRU from './lru.ts';

class FIFO extends LRU {
  get(key: string) {
    if (!this.cache[key]) return undefined;
  }
}

export default FIFO;
