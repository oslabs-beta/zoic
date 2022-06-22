import { writeJson, writeJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

class PerfMetrics {
  numEntries: number;
  numHits: number;
  numMisses: number;
  cacheMissTime: number;
  cacheHitTimes: Array<number>
  latency: number;
  cacheSize: number;
  constructor(){
    this.numEntries = 0;
    this.numHits = 0;
    this.numMisses = 0;
    this.cacheMissTime = 0;
    this.cacheHitTimes = [];
    this.latency = 0;
    this.cacheSize = 0;
  }

  addEntry = () => {
    return new Promise(() => {
      this.numEntries++;
      console.log('new this.numEntries after adding: ', this.numEntries);
    });
  };

  deleteEntry = () => {
    return new Promise(() => {
      this.numEntries--;
      console.log('new this.numEntries after deleting: ', this.numEntries);
    });
  };

  addHit = () => {
    return new Promise(() => {
      this.numHits++;
      console.log('Cache hits: ', this.numHits);
    })
  };

  addMiss = () => {

    return new Promise(() => {
      this.numMisses++;
      console.log('Cache misses: ', this.numMisses);
    });
  }

  updateCacheMissTime = (newCacheTime: number) => {
    return new Promise(() => {
      this.cacheMissTime = newCacheTime;
      this.cacheHitTimes = [];
      console.log('Miss latency timer: ', newCacheTime, 'ms');
    });
  };

  addCacheHitTime = (newCacheHitTime: number) => {
    return new Promise(() => {
      this.cacheHitTimes.push(newCacheHitTime);
      this.latency = this.cacheMissTime - this.cacheHitTimes[this.cacheHitTimes.length - 1];
      console.log('Hit latency timer: ', newCacheHitTime, 'ms');
    });
  };

  // updateDB writes to the json file an updated performance metrics object.
  // It gets called at the end of: makeResponseCachable, respondOnHit, and !respondOnHit
  updateDB = (): void => {
    writeJson('../test_server/static/localDB.json',
    { 
     numEntries: this.numEntries,
     numHits: this.numHits,
     numMisses: this.numMisses, 
     cacheMissTime: this.cacheMissTime,
     cacheHitTimes: this.cacheHitTimes,
     latency: this.latency
     }, 
     { 
      replacer:['numEntries', 'numHits', 'numMisses', 'cacheMissTime', 'cacheHitTimes', 'latency']
     })
     .then(() => console.log('JSON DB updated'))
     .catch((err) => console.log(err))
  }

  //Attempt at implementing cache size (in bytes / mb) functionality

  // addingBytesToCache = async function(newCachePiece){

  //     const file = new File(["Hello World😔😔😔😔"], "hello.txt");
  //     console.log('Bytes: ',file.size);
  //     this.cacheSize += whateverOurCountBytesFunctionIs(newCachePiece)
  //     console.log('new this.cacheSize after adding is: ', this.cacheSize)
  // }; 

  // deletingBytesFromCache = (evictedCachePiece) => {
  //     this.cacheSize -= whateverOurCountBytesFunctionIs(evictedCachePiece)
  //     console.log('new this.cacheSize after deleting is: ', this.cacheSize)
  // }
}

export default PerfMetrics;
