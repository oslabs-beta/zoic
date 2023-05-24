/**
 * Keep tracks of in-memory cache performance
 */
class PerfMetrics {
  cacheType: 'LRU' | 'LFU' | 'FIFO' | 'Redis';
  memoryUsed: number;
  numberOfEntries: number;
  readsProcessed: number;
  writesProcessed: number;
  currentHitLatency: number;
  currentMissLatency: number;
  missLatencyTotal: number;
  hitLatencyTotal: number;

  constructor() {
    this.cacheType = 'LRU';
    this.memoryUsed = 0;
    this.numberOfEntries = 0;
    this.readsProcessed = 0;
    this.writesProcessed = 0;
    this.currentHitLatency = 0;
    this.currentMissLatency = 0;
    this.missLatencyTotal = 0;
    this.hitLatencyTotal = 0;
  }

  addEntry = () => this.numberOfEntries++;
  deleteEntry = () => this.numberOfEntries--;
  readProcessed = () => this.readsProcessed++;
  writeProcessed = () => this.writesProcessed++;
  clearEntires = () => this.numberOfEntries = 0;
  increaseBytes = (bytes: number) => this.memoryUsed += bytes;
  decreaseBytes = (bytes: number) => this.memoryUsed -= bytes;
  updateLatency = (latency: number, hitOrMiss: 'hit' | 'miss') => {
    if (hitOrMiss === 'hit') {
      this.hitLatencyTotal += latency;
      this.currentHitLatency = latency;
      return;
    }
    if (hitOrMiss === 'miss') {
      this.missLatencyTotal += latency;
      this.currentMissLatency = latency;
      return;
    }
    throw new TypeError('Hit or miss not specified');
  };
}

export default PerfMetrics;
