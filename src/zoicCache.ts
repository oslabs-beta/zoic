import { decode as base64decode, encode as base64encode } from "https://deno.land/std@0.89.0/encoding/base64.ts";
import { Context } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { connect, Redis } from "https://deno.land/x/redis/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import PerfMetrics from './performanceMetrics.ts'
import LRU from './lru.ts';
import LFU from './lfu.ts';

interface options {
  cache?: string;
  port?: number;
  hostname?: string;
  expire?: string | number;
  respondOnHit?: boolean;
  capacity?: number;
}

/**
  * Class to initalize new instance of cache.
  * Takes options to define if cache eviction policy, expiration time for cache itmes, and if response should be returned on cache hit.
  * 
  * ### Example
  * 
  * ```ts
  * 
  * import { ZoicCache } from '../src/zoicCache.ts';
  * 
  * const cache = new ZoicCache({ cache: 'LFU', expire: '2h, 5m, 3s', respondOnHit: true });
  * 
  * router.get('/dbRead', cache.use, controller.dbRead, ctx => {
  *  ctx.response.body = ctx.state.somethingFromDb;});
  * 
  * 
  * ```
  * 
  * @param option (cache options)
  * @returns LRU | LFU (new cache)
*/
export class ZoicCache {
  capacity: number;

  expire: number;
  metrics: InstanceType <typeof PerfMetrics>;
  respondOnHit: boolean;
  cache: Promise < LRU | LFU | Redis >;

  constructor (options?: options) {
    //initalizes cache options
    this.capacity = options?.capacity || Infinity;
    this.expire = this.#parseExpTime(options?.expire);
    this.metrics = new PerfMetrics();
    this.respondOnHit = this.#setRespondOnHit(options);
    this.cache = this.#initCacheType(this.expire, this.metrics, options?.cache?.toUpperCase(), options?.port, options?.hostname);

    this.use = this.use.bind(this);
    this.cacheResponse = this.cacheResponse.bind(this);
    this.getMetrics = this.getMetrics.bind(this);
    this.put = this.put.bind(this);
  }


  /**
   * Sets cache eviction policty. Defaults to LRU.
   * @param expire 
   * @param cache 
   * @returns LRU | LFU
   */
  async #initCacheType (expire: number, metrics: InstanceType<typeof PerfMetrics>, cache?: string, redisPort?: number, hostname?: string) {
    // The client will enter the specific cache function they want as a string, which is passed as an arg here.
    if (this.capacity < 0) throw new TypeError('Cache capacity must exceed 0 entires.');
    if (cache === 'REDIS') {
      if (!redisPort) {
        throw new Error('Redis requires port number passed in as an options property.');
      } 
      const redis = await connect({
        hostname: hostname || '127.0.0.1',
        port: redisPort
      });
      redis.flushall()
      return redis;
    }
    if (cache === 'LFU') return new LFU(expire, metrics, this.capacity);
    return new LRU(expire, metrics, this.capacity);
  }


  /**
   * Parses expire option into time in seconds.
   * @param numberString 
   * @returns number
   */
  #parseExpTime (numberString?: string | number) {
    if (!numberString) return 86400;
    let seconds;
    if (typeof numberString === 'string'){
      seconds = numberString.trim().split(',').reduce((arr, el) => {
        if (el[el.length - 1] === 'h') return arr += parseInt(el.slice(0, -1)) * 3600;
        if (el[el.length - 1] === 'm') return arr += parseInt(el.slice(0, -1)) * 60;
        if (el[el.length - 1] === 's') return arr += parseInt(el.slice(0, -1));
        throw new TypeError(
          'Cache expiration time must be string formatted as a numerical value followed by \'h\', \'m\', or \'s\', or a number representing time in seconds.'
          )
      }, 0);
    } else seconds = numberString;
    if (seconds > 86400 || seconds < 0) throw new TypeError('Cache expiration time out of range.');
    return seconds;
  }


  #setRespondOnHit (options?: options) {
    if (options?.respondOnHit === undefined) return true;
    return options.respondOnHit;
  }


  /**
   * typecheck for Redis cache
   * @param cache 
   * @returns 
   */
  #redisTypeCheck (cache: LRU | LFU | Redis): cache is Redis {
    return (cache as Redis).isConnected !== undefined;
  }


  /**
   * Primary caching middleware method on user end.
   * Resposible for querying cache and either returning results to client/attaching results to ctx.state.zoic (depending on user options)
   * or, in the case of a miss, signalling to make response cachable.
   * @param ctx 
   * @param next 
   * @returns Promise | void
   */
  async use (ctx: Context, next: () => Promise<unknown>) {      
    try {

      const cache = await this.cache;
  
      //starting mark for cache hit/miss latency performance test.
      performance.mark('startingMark');
  
      //defines key via api endpoint
      const key: string = ctx.request.url.pathname + ctx.request.url.search;

      //query cache
      let cacheResults = await cache.get(key);

      //check if cache miss
      if (!cacheResults) {

        // If declared cache size is less than current cache size, we increment the count of entries. 
        if (this.metrics.numberOfEntries < this.capacity) this.metrics.addEntry();
        
        //makes response cacheable via patch
        this.cacheResponse(ctx);

        return next();
      }

      //checking if cache is Redis cache and parsing string / decoding base64 string
      if (this.#redisTypeCheck(cache)) {
        cacheResults = JSON.parse(cacheResults);
        cacheResults.body = base64decode(cacheResults.body);
      }

      //if user selects respondOnHit option, return cache query results immediately 
      if (this.respondOnHit) {
        ctx.response.body = cacheResults.body;
        ctx.response.status = cacheResults.status;
        
        //populate headers from mock header object
        Object.keys(cacheResults.headers).forEach(key => {
          ctx.response.headers.set(key, cacheResults.headers[key]);
        });

        //adds cache hit to perf log metrics
        this.metrics.readProcessed();

        //dnding mark for cache hit latency performance test.
        performance.mark('endingMark');
        // this.metrics.updateHitLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key);
        this.metrics.updateLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key, 'hit');
        
        return;
      }

      //attach query results to ctx.state.zoic
      ctx.state.zoicResponse = Object.assign({}, cacheResults);
      ctx.state.zoicResponse.body = JSON.parse(new TextDecoder().decode(ctx.state.zoicResponse.body));
      console.log(ctx.state.zoicResponse);

      return next();

    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = `error in ZoicCache.use: ${err}`;
      console.log(`error in ZoicCache.use: ${err}`);
    }
  }


  /**
   * Makes response store to cache at the end of middleware chain in the case of a cache miss.
   * This is done by patching 'toDomResponse' to send results to cache before returning to client.
   * @param ctx 
   * @returns void
   */
  async cacheResponse (ctx: Context) {

    const cache = await this.cache;
    const metrics = this.metrics;
    const redisTypeCheck = this.#redisTypeCheck;
    const toDomResponsePrePatch = ctx.response.toDomResponse.bind(this);

    //patch toDomResponse to cache response body before returning results to client
    ctx.response.toDomResponse = async function() {

      //defines key via api endpoint and adds response body to cache
      const key: string = ctx.request.url.pathname + ctx.request.url.search;
      
      //extract native http response from toDomResponse to get correct headers and readable body
      const nativeResponse = await toDomResponsePrePatch()//.apply(this);
      
      const responseToCache: any = {
        headers: Object.fromEntries(nativeResponse.headers.entries()),
        status: nativeResponse.status
      };
      
      //redis cache stores body as a base64 string encoded from a buffer
      if (redisTypeCheck(cache)) {

        //make response body string, and then stringify response object for storage in redis
        const arrBuffer = await nativeResponse.clone().arrayBuffer();
        responseToCache.body = base64encode(new Uint8Array(arrBuffer));
        cache.set(key, JSON.stringify(responseToCache));

      } else {

        //make response body unit8array and read size for metrics
        const arrBuffer = await nativeResponse.clone().arrayBuffer();
        responseToCache.body = new Uint8Array(arrBuffer);

        const headerBytes = Object.entries(responseToCache.headers)
          .reduce<number>((acc: number, headerArr: any) => {
            return acc += (headerArr[0].length * 2) + (headerArr[1].length * 2);
          }, 0);

        const resByteLength = responseToCache.body.byteLength + headerBytes + 34;
        metrics.increaseBytes(resByteLength);
  
        cache.put(key, responseToCache, resByteLength);
      }
      
      // count of cache miss
      metrics.writeProcessed();

      //ending mark for a cache miss latency performance test.
      performance.mark('endingMark');
      // metrics.updateMissLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key);
      metrics.updateLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key, 'miss');

      return new Promise (resolve => {                
        resolve(nativeResponse);
      });
    }

    return;
  }
  

  /**
   * Manually clears all current cache entries.
   */
  async clear (ctx: Context, next: () => Promise<unknown>) {
    const cache = await this.cache;
    this.#redisTypeCheck(cache) ? cache.flushdb() : cache.clear();
    this.metrics.clearEntires();
    return next()
  }


  /**
   * Retrives cache metrics. Designed for use with Chrome extension.
   * @param ctx 
   */
  getMetrics (ctx: Context) {
    try {
      const enableRouteCors = oakCors();
      return enableRouteCors(ctx, async () => {

        const cache = await this.cache;
  
        const {
          memoryUsed,
          numberOfEntries,
          readsProcessed,
          writesProcessed,
          missLatencyTotal,
          hitLatencyTotal
        } = this.metrics;
      
        ctx.response.headers.set('Access-Control-Allow-Origin', '*');

        if (this.#redisTypeCheck(cache)) {
          const redisInfo = await cache.info();
          const redisSize = await cache.dbsize();
          const infoArr: string[] = redisInfo.split('\r\n');

          ctx.response.body = {
            number_of_entries: redisSize,
            memory_used: infoArr?.find((line: string) => line.match(/used_memory/))?.split(':')[1],
            reads_processed: infoArr?.find((line: string) => line.match(/keyspace_hits/))?.split(':')[1],
            writes_processed: infoArr?.find((line: string) => line.match(/keyspace_misses/))?.split(':')[1],
            average_hit_latency: hitLatencyTotal / readsProcessed,
            average_miss_latency: missLatencyTotal / writesProcessed
          }
          return;
        } 
    
        ctx.response.body = {
          memory_used: memoryUsed,
          number_of_entries: numberOfEntries,
          reads_processed: readsProcessed,
          writes_processed: writesProcessed,
          average_hit_latency: hitLatencyTotal / readsProcessed,
          average_miss_latency: missLatencyTotal / writesProcessed
        }
        return;      
      })      
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = `error in ZoicCache.getMetrics: ${err}`;
      console.log(`error in ZoicCache.getMetrics: ${err}`);
    }
  }


  /**
   *  manually adds ctx.state.zoic to cache, in the form of a middleware function.
   *  ~~*potentailly no longer needed, via makeReponseCacheable*~~
   * //TODO: touch up and add connection to perf metrics ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
   * @param ctx 
   * @param next 
   * @returns 
   */
  async put (ctx: Context, next: () => Promise<unknown>) {

    const cache = await this.cache;

    try {
      // deconstruct context obj for args to cache put
      const value: unknown = ctx.state.zoic; 
      
      const key: string = ctx.request.url.pathname + ctx.request.url.search;
  
      //put now requires bytesize

      //this.#redisTypeCheck(cache) ? cache.set(key, JSON.stringify(value)) : cache.put(key, value);

      return next();

    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = `error in ZoicCache.put: ${err}`;
      console.log(`error in ZoicCache.put: ${err}`);
    }
  }
}

export default ZoicCache;