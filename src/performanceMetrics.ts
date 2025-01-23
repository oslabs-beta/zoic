/**
 * Keep tracks of in-memory cache performance
 */
class PerfMetrics {
  cacheType: 'LRU' | 'LFU' | 'Redis';
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

  public addEntry = (): number => this.numberOfEntries++;
  public deleteEntry = (): number => this.numberOfEntries--;
  public readProcessed = (): number => this.readsProcessed++;
  public writeProcessed = (): number => this.writesProcessed++;
  public clearEntires = (): number => this.numberOfEntries = 0;
  public increaseBytes = (bytes: number): number => this.memoryUsed += bytes;
  public decreaseBytes = (bytes: number): number => this.memoryUsed -= bytes;
  public updateLatency = (latency: number, hitOrMiss: 'hit' | 'miss'): void => {
    if (hitOrMiss === 'hit'){
      this.hitLatencyTotal += latency;
      this.currentHitLatency = latency;
      return;
    }
    if (hitOrMiss === 'miss'){
      this.missLatencyTotal += latency;
      this.currentMissLatency = latency;
      return;
    }

    throw new TypeError('Hit or miss not specified');
  };
}

export default PerfMetrics;
