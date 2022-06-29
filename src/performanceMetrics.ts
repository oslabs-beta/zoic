import { writeJson } from 'https://deno.land/x/jsonfile/mod.ts';

class PerfMetrics {
  numberOfEntries: number;
  readsProcessed: number;
  writesProcessed: number;
  currentHitLatency: number;
  currentMissLatency: number;
  currentEndPoint: string;
  latencyHistory: Array<number>;
  missLatencyTotal: number;
  hitLatencyTotal: number
  cacheSize: number;

  constructor() {
    this.numberOfEntries = 0;
    this.readsProcessed = 0;
    this.writesProcessed = 0;
    this.currentHitLatency = 0;
    this.currentMissLatency = 0;
    this.currentEndPoint = '';
    this.latencyHistory = [];
    this.missLatencyTotal = 0;
    this.hitLatencyTotal = 0;
    this.cacheSize = 0;
  }

  // writeMetricsJson = () => {
  //   writeJson(`/${Deno.cwd()}/static/localDB.json`,
  //   {
  //     reads_processed: this.readsProcessed,
  //     writes_processed: this.writesProcessed,
  //     average_hit_latency: this.hitLatencyTotal / this.readsProcessed,
  //     average_miss_latency: this.missLatencyTotal / this.writesProcessed,
  //     latency_history: this.latencyHistory,
  //     number_of_entries: this.numberOfEntries
  //   },
  //    {
  //     replacer: ['reads_processed', 'writes_processed', 'average_hit_latency', 'average_miss_latency', 'latency_history', 'number_of_entries']
  //   });
  // }

  addEntry = () => {
    return new Promise(resolve => {
      this.numberOfEntries++;
      resolve(this.numberOfEntries);
    });
  };

  deleteEntry = () => {
    return new Promise(resolve => {
      this.numberOfEntries--;
      this.writeProcessed();
      resolve(this.numberOfEntries);
    });
  };

  readProcessed = () => {
    return new Promise(resolve => {
      this.readsProcessed++;
      //this.writeMetricsJson();
      //console.log('Reads processed: ', this.readsProcessed);
      resolve(this.readsProcessed);
    });
  };

  writeProcessed = () => {
    return new Promise(resolve => {
      this.writesProcessed++;
      //this.writeMetricsJson();
      //console.log('Writes processed: ', this.writesProcessed);
      resolve(this.writesProcessed);
    });
  }


  updateLatency = (latency: number, endpoint: string, hitOrMiss: 'hit' | 'miss') => {
    return new Promise((resolve, reject) => {

      if (this.currentEndPoint === endpoint){
        this.latencyHistory.push(latency);
      } else {
        this.latencyHistory = [latency];
        this.currentEndPoint = endpoint;
      }

      if (hitOrMiss === 'hit'){
        this.hitLatencyTotal += latency;
        this.currentHitLatency = latency;
        resolve(undefined);
      }
      
      if (hitOrMiss === 'miss'){
        this.missLatencyTotal += latency;
        this.currentMissLatency = latency;
        resolve(undefined);
      }

      throw reject(new TypeError('Hit or miss not specified'));
    });
  };

}

export default PerfMetrics;

