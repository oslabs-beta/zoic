
/**
 * Keep tracks of in-memory cache performance
 */
class PerfMetrics {
  memoryUsed: number;
  numberOfEntries: number;
  readsProcessed: number;
  writesProcessed: number;
  currentHitLatency: number;
  currentMissLatency: number;
  currentEndPoint: string;
  latencyHistory: Array<number>;
  missLatencyTotal: number;
  hitLatencyTotal: number;

  constructor() {
    this.memoryUsed = 0;
    this.numberOfEntries = 0;
    this.readsProcessed = 0;
    this.writesProcessed = 0;
    this.currentHitLatency = 0;
    this.currentMissLatency = 0;
    this.currentEndPoint = '';
    this.latencyHistory = [];
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
  updateLatency = (latency: number, endpoint: string, hitOrMiss: 'hit' | 'miss') => {
   
      if (this.currentEndPoint === endpoint){
        this.latencyHistory.push(latency);
      } else {
        this.latencyHistory = [latency];
        this.currentEndPoint = endpoint;
      }

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

  // addEntry = () => {
  //   return new Promise(resolve => {
  //     this.numberOfEntries++;
  //     resolve(this.numberOfEntries);
  //   });
  // };

  // deleteEntry = () => {
  //   return new Promise(resolve => {
  //     this.numberOfEntries--;
  //     this.writeProcessed();
  //     resolve(this.numberOfEntries);
  //   });
  // };

  // readProcessed = () => {
  //   return new Promise(resolve => {
  //     this.readsProcessed++;
  //     resolve(this.readsProcessed);
  //   });
  // };

  // writeProcessed = () => {
  //   return new Promise(resolve => {
  //     this.writesProcessed++;
  //     resolve(this.writesProcessed);
  //   });
  // }

  // clearEntires = () => {
  //   return new Promise(resolve => {
  //     this.numberOfEntries = 0;
  //     resolve(this.numberOfEntries);
  //   })
  // }


  // updateLatency = (latency: number, endpoint: string, hitOrMiss: 'hit' | 'miss') => {
  //   return new Promise((resolve, reject) => {

  //     if (this.currentEndPoint === endpoint){
  //       this.latencyHistory.push(latency);
  //     } else {
  //       this.latencyHistory = [latency];
  //       this.currentEndPoint = endpoint;
  //     }

  //     if (hitOrMiss === 'hit'){
  //       this.hitLatencyTotal += latency;
  //       this.currentHitLatency = latency;
  //       resolve(undefined);
  //     }
      
  //     if (hitOrMiss === 'miss'){
  //       this.missLatencyTotal += latency;
  //       this.currentMissLatency = latency;
  //       resolve(undefined);
  //     }

  //     throw reject(new TypeError('Hit or miss not specified'));
  //   });
  // };

}

export default PerfMetrics;