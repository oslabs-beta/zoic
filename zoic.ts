import {
    base64decode,
    base64encode,
    Context,
    connect,
    oakCors
} from './deps.ts';
import type { Redis } from "./deps.ts";
import { options, cacheValue } from './src/types.ts'
import PerfMetrics from './src/performanceMetrics.ts'
import LRU from './src/lru.ts'
import LFU from './src/lfu.ts'

/**
  * Class to initalize new instance of cache.
  * Takes options to define if cache eviction policy, expiration time for cache itmes, and if response should be returned on cache hit.
  *
  * ### Example
  *
  * ```ts
  *
  * import { Zoic } from "https://deno.land/x/zoic"
  *
  * const cache = new Zoic({
  *   cache: 'LRU',
  *   expire: '2h, 5m, 3s',
  *   capacity: 200
  * });
  *
  * router.get('/dbRead', cache.use, controller.dbRead, ctx => {
  *  ctx.response.body = ctx.state.somethingFromDb;});
  *
  * ```
  *
  * ### Wtih Redis
  *  Note: with Reids options "expire" and "capacity" do not apply.
  * ```ts
  *
  * const cache = new Zoic({
  *   cache:'Redis',
  *   port: 6379
  *  })
  *
  * ```
  *
  * @param option (cache options)
  * @returns LRU | Redis (new cache)
*/
export class Zoic {
  capacity: number;
  expire: number;
  metrics: PerfMetrics;
  respondOnHit: boolean;
  cache: Promise < LRU | LFU | Redis >;

  constructor (options?: options) {
    if (options?.capacity !== undefined && options.capacity <= 0){
      throw new Error('Cache capacity must exceed 0 entires.');
    }
    this.capacity = options?.capacity || Infinity;
    this.expire = this.parseExpTime(options?.expire);
    this.metrics = new PerfMetrics();
    this.respondOnHit = this.setRespondOnHit(options);
    this.cache = this.initCacheType(
      this.expire,
      this.metrics,
      options?.cache?.toUpperCase(),
      options?.port,
      options?.hostname
    );

    this.use = this.use.bind(this);
    this.put = this.put.bind(this);
    this.clear = this.clear.bind(this);
    this.getMetrics = this.getMetrics.bind(this);
    this.endPerformanceMark = this.endPerformanceMark.bind(this);
  }

  /**
   * Sets cache eviction policty. Defaults to LRU.
   * @param expire
   * @param cache
   * @returns LRU | Redis
   */
  private async initCacheType(expire: number, metrics: PerfMetrics, cache?: string, redisPort?: number, hostname?: string) {
    // The client will enter the specific cache function they want as a string, which is passed as an arg here.
    if (!cache || cache === 'LRU'){
      this.metrics.cacheType = 'LRU';
      return new LRU(expire, metrics, this.capacity);
    } else if (cache === 'LFU'){
      this.metrics.cacheType = 'LFU';
      return new LFU(expire, metrics, this.capacity);
    } else if (cache === 'REDIS'){
      if (!redisPort) {
        throw new Error('Redis requires port number passed in as an options property.');
      }
      const redis = await connect({
        hostname: hostname || '127.0.0.1',
        port: redisPort
      });
      this.metrics.cacheType = 'Redis';
      return redis;
    }
    throw new TypeError('Invalid cache type.');
  }

  /**
   * Parses expire option into time in seconds.
   * @param numberString
   * @returns number
   */
  private parseExpTime(numberString?: string | number | undefined) {
    if (numberString === undefined) return Infinity;
    let seconds;
    if (typeof numberString === 'string'){
      seconds = numberString.trim().split(',').reduce((arr, el) => {
        if (el[el.length - 1] === 'd') return arr += parseInt(el.slice(0, -1)) * 86400;
        if (el[el.length - 1] === 'h') return arr += parseInt(el.slice(0, -1)) * 3600;
        if (el[el.length - 1] === 'm') return arr += parseInt(el.slice(0, -1)) * 60;
        if (el[el.length - 1] === 's') return arr += parseInt(el.slice(0, -1));
        throw new TypeError(
          'Cache expiration time must be string formatted as a numerical value followed by \'d\', \'h\', \'m\', or \'s\', or a number representing time in seconds.'
          )
      }, 0);
    } else {
      seconds = numberString;
    }
    if (seconds > 31536000 || seconds <= 0 ) throw new TypeError('Cache expiration time out of range.');
    return seconds;
  }

  /**
   * Sets respond on hit value, defaults to true.
   * @param options
   * @returns
   */
  private setRespondOnHit(options?: options) {
    if (options?.respondOnHit === undefined) return true;
    return options.respondOnHit;
  }

  /**
   * typecheck for Redis cache
   * @param cache
   * @returns
   */
  public redisTypeCheck(cache: LRU | LFU | Redis): cache is Redis {
    return (cache as Redis).isConnected !== undefined;
  }

  /**
   * Marks end of latency test for cache hit or miss, and updates read or write processed
   * @param queryRes
   */
  public endPerformanceMark(queryRes: 'hit' | 'miss') {
    performance.mark('endingMark');
    this.metrics.updateLatency(
      performance.measure('latency_timer', 'startingMark', 'endingMark').duration,
      queryRes
    );
    queryRes === 'hit'
      ? this.metrics.readProcessed()
      : this.metrics.writeProcessed();
  }

  /**
   * Primary caching middleware method on user end.
   * Resposible for querying cache and either returning results to client/attaching results to ctx.state.zoic (depending on user options)
   * or, in the case of a miss, signalling to make response cachable.
   * @param ctx
   * @param next
   * @returns Promise | void
   */
  public async use(ctx: Context, next: () => Promise<unknown>) {
    try {
      const cache = await this.cache;

      //starting mark for cache hit/miss latency performance test.
      performance.mark('startingMark');

      //defines key via api endpoint
      const key: string = ctx.request.url.pathname + ctx.request.url.search;
      //query cache
      const cacheQueryResults = await cache.get(key);
      if (!cacheQueryResults) {
        // If declared cache size is less than current cache size, we increment the count of entries.
        if (this.metrics.numberOfEntries < this.capacity) this.metrics.addEntry();

        //makes response cacheable via patch
        this.cacheResponse(ctx);
        return next();
      }

      //if cache is Redis parse base64string, decoding body header and status
      if (this.redisTypeCheck(cache) && typeof cacheQueryResults === 'string') {
        const parsedResults = cacheQueryResults.split('\n');
        const { headers, status } = JSON.parse(atob(parsedResults[0]));
        const body = base64decode(parsedResults[1]);
        if (this.respondOnHit) {
          ctx.response.body = body;
          ctx.response.status = status;
          Object.keys(headers).forEach(key => {
            ctx.response.headers.set(key, headers[key]);
          });
          this.endPerformanceMark('hit');
          return;
        }
        //attach query results to ctx.state.zoic if not respondOnHit
        ctx.state.zoicResponse = {
          body: body,
          headers: headers,
          status: status
        };

        this.endPerformanceMark('hit');
        return next();
      }

      //if in-memory cache...
      if (!this.redisTypeCheck(cache) && typeof cacheQueryResults !== 'string'){
        const { body, headers, status } = cacheQueryResults;
        if (this.respondOnHit) {
          ctx.response.body = body;
          ctx.response.status = status;
          Object.keys(headers).forEach(key => {
            ctx.response.headers.set(key, headers[key]);
          });
          this.endPerformanceMark('hit');
          return;
        }

        ///attach query results to ctx.state.zoic if not respondOnHit
        ctx.state.zoicResponse = {
          body: JSON.parse(new TextDecoder().decode(body)),
          headers: headers,
          status: status
        };
        this.endPerformanceMark('hit');
        return next();
      }
      throw new Error('Cache query failed');
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = 'Error in Zoic.use. Check server logs for details.';
      console.log(`Error in Zoic.use: ${err}`);
    }
  }

  /**
   * Makes response store to cache at the end of middleware chain in the case of a cache miss.
   * This is done by patching 'toDomResponse' to send results to cache before returning to client.
   * @param ctx
   * @returns void
   */
  private async cacheResponse(ctx: Context) {
    try {
      const cache = await this.cache;
      const redisTypeCheck = this.redisTypeCheck;
      const endPerformanceMark = this.endPerformanceMark;
      const toDomResponsePrePatch = ctx.response.toDomResponse;

      //patch toDomResponse to cache response body before returning results to client
      ctx.response.toDomResponse = async function() {
        //defines key via api endpoint and adds response body to cache
        const key: string = ctx.request.url.pathname + ctx.request.url.search;

        //extract native http response from toDomResponse to get correct headers and readable body
        const nativeResponse = await toDomResponsePrePatch.apply(this);

        //redis cache stores body as a base64 string encoded from a buffer
        if (redisTypeCheck(cache)) {
          //make response body string, and then stringify response object for storage in redis
          const body = await nativeResponse.clone().arrayBuffer();
          const headerAndStatus = {
            headers: Object.fromEntries(nativeResponse.headers.entries()),
            status: nativeResponse.status
          };
          cache.set(
            key,
            `${ btoa(JSON.stringify(headerAndStatus)) }\n${ base64encode(new Uint8Array(body)) }`
          );
        }

        //if in-memory store as native js...
        if (!redisTypeCheck(cache)) {
          //make response body unit8array and read size for metrics
          const arrBuffer = await nativeResponse.clone().arrayBuffer();
          const responseToCache: cacheValue = {
            body: new Uint8Array(arrBuffer),
            headers: Object.fromEntries(nativeResponse.headers.entries()),
            status: nativeResponse.status
          };

          //count bytes for perf metrics
          const headerBytes = Object.entries(responseToCache.headers)
            .reduce((acc: number, headerArr: Array<string>) => {
              return acc += (headerArr[0].length * 2) + (headerArr[1].length * 2);
            }, 0);

          //34 represents size of obj keys + status code.
          const resByteLength = (key.length * 2) + responseToCache.body.byteLength + headerBytes + 34;
          cache.put(key, responseToCache, resByteLength);
        }

        //ending mark for a cache miss latency performance test.
        endPerformanceMark('miss');

        return nativeResponse;
      }

      return;
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = 'Error in Zoic.#cacheResponse. Check server logs for details.';
      console.log(`Error in Zoic.#cacheResponse: ${err}`);
    }
  }

  /**
   * Manually clears all current cache entries.
   */
  public async clear(ctx: Context, next: () => Promise<unknown>) {
    try {
      const cache = await this.cache;
      this.redisTypeCheck(cache)
        ? cache.flushdb()
        : cache.clear();

      this.metrics.clearEntires();
      return next();
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = 'Error in Zoic.clear. Check server logs for details.';
      console.log(`Error in Zoic.clear: ${err}`);
    }
  }

  /**
   * Retrives cache metrics. Designed for use with Chrome extension.
   * @param ctx
   */
  public getMetrics(ctx: Context) {
    try {
      //wrap functionality of sending metrics inside of oakCors to enable route specific cors by passing in as 'next'.
      const enableRouteCors = oakCors();
      return enableRouteCors(ctx, async () => {
        const cache = await this.cache;
        const {
          cacheType,
          memoryUsed,
          numberOfEntries,
          readsProcessed,
          writesProcessed,
          missLatencyTotal,
          hitLatencyTotal
        } = this.metrics;

        ctx.response.headers.set('Access-Control-Allow-Origin', '*');
        //fetch stats from redis client if needed.
        if (this.redisTypeCheck(cache)) {
          const redisInfo = await cache.info();
          const redisSize = await cache.dbsize();
          const infoArr: string[] = redisInfo.split('\r\n');

          ctx.response.body = {
            cache_type: cacheType,
            number_of_entries: redisSize,
            memory_used: infoArr?.find((line: string) => line.match(/used_memory/))?.split(':')[1],
            reads_processed: infoArr?.find((line: string) => line.match(/keyspace_hits/))?.split(':')[1],
            writes_processed: infoArr?.find((line: string) => line.match(/keyspace_misses/))?.split(':')[1],
            average_hit_latency: hitLatencyTotal / readsProcessed,
            average_miss_latency: missLatencyTotal / writesProcessed
          }
          return;
        }

        //set in-memory stats
        ctx.response.body = {
          cache_type: cacheType,
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
      ctx.response.body = 'Error in Zoic.getMetrics. Check server logs for details.';
      console.log(`Error in Zoic.getMetrics: ${err}`);
    }
  }

  /**
   *  Manually sets response to cache.
   * @param ctx
   * @param next
   * @returns
   */
  public put(ctx: Context, next: () => Promise<unknown>) {
    try {
      performance.mark('startingMark');

      if (this.metrics.numberOfEntries < this.capacity) {
          this.metrics.addEntry()
      }

      this.cacheResponse(ctx);

      return next();
    } catch (err) {
      ctx.response.status = 400;
      ctx.response.body = 'Error in Zoic.put. Check server logs for details.';
      console.log(`Error in Zoic.put: ${err}`);
    }
  }
}

export default Zoic;
