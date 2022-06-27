import { Context } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import { connect, Redis } from "https://deno.land/x/redis/mod.ts";
import PerfMetrics from './performanceMetrics.ts'
import LRU from './lru.ts';
import LFU from './lfu.ts';

interface options {
  cache?: string;
  port?: number;
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
    this.capacity = options?.capacity || 50;
    this.expire = this.#parseExpTime(options?.expire);
    this.metrics = new PerfMetrics();
    this.respondOnHit = options?.respondOnHit || true;
    this.cache = this.#initCacheType(this.expire, this.metrics, options?.cache?.toUpperCase(), options?.port);

    this.use = this.use.bind(this);
    this.cacheResponse = this.cacheResponse.bind(this);
    this.put = this.put.bind(this);
  }


  /**
   * Sets cache eviction policty. Defaults to LRU.
   * @param expire 
   * @param cache 
   * @returns LRU | LFU
   */
  async #initCacheType (expire: number, metrics: InstanceType<typeof PerfMetrics>, cache?: string, redisPort?: number) {
    // The client will enter the specific cache function they want as a string, which is passed as an arg here.
    if (this.capacity < 0) throw new TypeError('Cache capacity must exceed 0 entires.');
    if (cache === 'REDIS') {
      if (!redisPort) throw new Error('Redis requires port number passed in as an options property.')
      const redis = await connect({
        hostname: '127.0.0.1',
        port: redisPort
      });
      await redis.flushall();
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
    
    const cache = await this.cache;

    //starting mark for cache hit/miss latency performance test.
    performance.mark('startingMark');

    //defines key via api endpoint
    const key: string = ctx.request.url.pathname + ctx.request.url.search;

    try {
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

      //checking if cache is Redis cache and parsing string
      if (this.#redisTypeCheck(cache)) {
        cacheResults = JSON.parse(cacheResults);
      }

      //if user selects respondOnHit option, return cache query results immediately 
      if (this.respondOnHit) {
        ctx.response.body = cacheResults.body;
        ctx.response.type = cacheResults.type;
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

      return next();

    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = `error in ZoicCache.use: ${err}`
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

    // const responsePatch = new Response(ctx.request);

    const cache = await this.cache;
    const metrics = this.metrics;
    const toDomResponsePatch = ctx.response.toDomResponse;
    const redisTypeCheck = this.#redisTypeCheck;

    //patch toDomResponse to cache response body before returning results to client
    ctx.response.toDomResponse = function() {

      //defines key via api endpoint and adds response body to cache
      const key: string = ctx.request.url.pathname + ctx.request.url.search;

      //data to be cached
      const response: any = {
        headers: {},
        body: ctx.response.body,
        status: ctx.response.status,
        type: ctx.response.type
      };
      
      //iterate through current headers and store in mock headers object
      ctx.response.headers.forEach((value, key) => {
        response.headers[key] = value;
      });
      
      //check if current cache is in memory or Redis and handle accordingly
      if (redisTypeCheck(cache)){
        cache.set(key, JSON.stringify(response));
      } else {
        cache.put(key, response);
      }
      
      // count of cache miss
      metrics.writeProcessed();

      // responsePatch.body = ctx.response.body;
      // responsePatch.status = ctx.response.status;
      // responsePatch.type = ctx.response.type;

      //ending mark for a cache miss latency performance test.
      performance.mark('endingMark');
      // metrics.updateMissLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key);
      metrics.updateLatency(performance.measure('cache hit timer', 'startingMark', 'endingMark').duration, key, 'miss');

      return new Promise (resolve => {                
        resolve(toDomResponsePatch.apply(this));
      });
    }

    return;
  }
  

  /**
   * Manually clears all current cache entries.
   */
  //TODO: link method with perf metrics ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  // clearCache () {
  //   this.cache.clear();
  // }


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
  
      // call to put to cache: response 0 for good put, -1 for err
      if (this.#redisTypeCheck(cache)){
        cache.set(key, JSON.stringify(value));
      } else {
        const putResponse: number = await cache.put(key, value);
    
        if (putResponse === 0) return next();
        else if (putResponse === -1) ctx.response.body = {
          success: false,
          message: 'failed to add entry to cache'
        } 
      }
    } catch (err) {

    // handle errors in caching process and emit
      ctx.response.body = {
        success: false,
        message: `${err} ocurred when trying to add to the cache`
      }
    }
  }
}

export default ZoicCache;