import { writeJsonSync, readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

class PerfMetrics {
  numEntries: number;
  readsProcessed: number;
  writesProcessed: number;
  missLatencyTotal: number;
  hitLatencyTotal: number
  latency: number;
  cacheSize: number;
  constructor(){
    this.numEntries = 0;
    this.readsProcessed = 0;
    this.writesProcessed = 0;
    this.missLatencyTotal = 0;
    this.hitLatencyTotal = 0;
    this.latency = 0;
    this.cacheSize = 0;

    //initalized output.txt to empty file.
    Deno.writeTextFile(`${Deno.cwd()}/test_file_dump/output.txt`, '');
  }

  writeJsonLog = (contentType: string) => {
    const currentJSON: any = readJsonSync(`${Deno.cwd()}/test_file_dump/test_output.json`);
    if (contentType === 'readProcessed') currentJSON.reads_processed = this.readsProcessed;
    if (contentType === 'writeProcessed') currentJSON.writes_processed = this.writesProcessed;
    if (contentType === 'hitLatency') currentJSON.average_hit_latency = this.hitLatencyTotal / this.readsProcessed;
    if (contentType === 'missLatency') currentJSON.average_miss_latency = this.missLatencyTotal / this.writesProcessed;
    writeJsonSync(`${Deno.cwd()}/test_file_dump/test_output.json`, currentJSON);
  }

  outPutType = (outPutTypeArg: number, dataToLog: any, dataToLogDescription: string) => {
    if (outPutTypeArg === 0 ) return;
    if (outPutTypeArg === 1 ) console.log(dataToLogDescription + ', \n' + dataToLog);
    if (outPutTypeArg === 2 ) Deno.writeTextFile(`${Deno.cwd()}/test_file_dump/output.txt`, dataToLogDescription + ': ' + dataToLog + '\n', {append:true});
  }

  addEntry = () => {
    return new Promise(() => {
      this.numEntries++;
      //console.log('new this.numEntries after adding: ', this.numEntries);
    });
  };

  deleteEntry = () => {
    return new Promise(() => {
      this.numEntries--;
      //console.log('new this.numEntries after deleting: ', this.numEntries);
    });
  };

  readProcessed = () => {
    return new Promise(() => {
      this.readsProcessed++;
      this.writeJsonLog('readProcessed')
      this.outPutType(2, this.readsProcessed, 'Reads processed: ')
      console.log('Reads processed: ', this.readsProcessed);
    });
  };

  writeProcessed = () => {
    return new Promise(() => {
      this.writesProcessed++;
      this.writeJsonLog('writeProcessed')
      console.log('Writes processed: ', this.writesProcessed);
    });
  };

  updateMissLatency = (newCacheMissTime: number) => {
    return new Promise(() => {
      console.log('Miss latency timer: ', newCacheMissTime, 'ms');
      this.missLatencyTotal += newCacheMissTime
      this.writeJsonLog('missLatency');
      this.outPutType(2, newCacheMissTime, 'Miss latency timer: ')
    });
  };

  updateHitLatency = (newCacheHitTime: number) => {
    return new Promise(() => {
      console.log('Hit latency timer: ', newCacheHitTime, 'ms');
      this.hitLatencyTotal += newCacheHitTime;
      this.writeJsonLog('hitLatency');
      this.outPutType(2, newCacheHitTime, 'Hit latency timer: ')
    });
  };

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

