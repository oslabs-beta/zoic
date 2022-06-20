import { Context, Response } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import LRU from './lru.ts';
import LFU from './lfu.ts';

interface options {
  cache?: 'LRU' | 'LFU',
  expire?: number,
  respondOnHit?: boolean
}

/**
  * class user initalizes to create new instance of cache.
  * takes options to define if cache type, expire for items to remain in cache, and if response should be returned on cache hit
  * @param {object} //cache options
  * @returns {object} //new cache
**/

export class ZoicCache {
  cache: LRU | LFU;
  expire: number;
  respondOnHit: boolean;
  constructor (options?: options) {
    //initalizes cache options
    this.expire = options?.expire || 86400;
    this.cache = this.#initCacheType(this.expire, options?.cache);
    this.respondOnHit = options?.respondOnHit || true;

    this.use = this.use.bind(this);
    this.makeResponseCacheable = this.makeResponseCacheable.bind(this);
    this.put = this.put.bind(this);
  }


  /**
    * Sets cache type.
    * defaults to LRU.
    * @param {string} //cache type via options
    * @return {object} //new cache object
  **/

  #initCacheType (expire: number, cache?: string) {
    // The client will enter the specific cache function they want as a string, which is passed as an arg here.
    if (cache === 'LFU') return new LFU(expire);
    return new LRU(expire);
  }


  /**
    * Primary caching middleware method on user end.
    * Resposible for querying cache and either returning results to client/attaching results to ctx.state.zoic (depending on user options)
    * or, in the case of a miss, signalling to make response cachable.
    * @param {object} //Context object
    * @param {function} //next function
    * @return {promise || void} //enters next middleware func or returns response
  **/

  use (ctx: Context, next: () => Promise<unknown>) {
    
    //defines key via api endpoint
    const key: string = ctx.request.url.pathname + ctx.request.url.search;
    try {
      //query cache
      const cacheResults = this.cache.get(key);

      //check if cache miss
      if (!cacheResults) {
        //makes response cacheable via patch
        this.makeResponseCacheable(ctx);
        return next();
      }

      //if user selects respondOnHit option, return cache query results immediately 
      if (this.respondOnHit) {
        ctx.response.headers = cacheResults.headers;
        ctx.response.body = cacheResults.body;
        ctx.response.status = cacheResults.status;
        ctx.response.type = cacheResults.type;

        console.log('zoicCache return on hit: ', cacheResults.headers, cacheResults.body, cacheResults.status);

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
   * This is done by patching 'toDomRespone' to send results to cache before returning to client.
   * @param {object} //Context object
   * @return {promise/void} //inner function returns promise/result of toDomReponse. outter function returns void.
  **/

  makeResponseCacheable (ctx: Context) {

    //create new response object to retain access to original toDomResponse function def
    const responsePatch = new Response(ctx.request);
    const cache = this.cache;

    //patch toDomResponse to cache response body before returning results to client
    ctx.response.toDomResponse = function() {

      //add response body to cache
      const response: any = {
        body: ctx.response.body,
        headers: ctx.response.headers,
        status: ctx.response.status,
        type: ctx.response.type
      };

      const key: string = ctx.request.url.pathname + ctx.request.url.search;
      cache.put(key, response);

      //returns results to client
      responsePatch.headers = ctx.response.headers;
      responsePatch.body = ctx.response.body;
      responsePatch.status = ctx.response.status;
      responsePatch.type = ctx.response.type;

      return new Promise (resolve => {                
        resolve(responsePatch.toDomResponse());
      });
    }

    return;
  }
  

  /**
   * manually clears all current cache entries.
   */
  clearCache () {
    this.cache.clear();
  }

  
  /**
    * manually adds ctx.state.zoic to cache, in the form of a middleware function
    * ~~*potentailly no longer needed, via makeReponseCacheable*~~
    * @param {object} //Context object
    * @param {function} //next function
    * @return {promise} //next
  **/

  async put (ctx: Context, next: () => Promise<unknown>) {

    try {
    // deconstruct context obj for args to cache put
    const value: any = ctx.state.zoic; 
    
    const key: string = ctx.request.url.pathname + ctx.request.url.search;
 
    // call to put to cache: response 0 for good put, -1 for err
    const putResponse: number = await this.cache.put(key, value);
  
    if (putResponse === 0) return next();
    else if (putResponse === -1) ctx.response.body = {
      success: false,
      message: 'failed to add entry to cache'
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

// const lru = new LRU();
// lru.put('a', 1)
// lru.put('b', 2)
// lru.put('c', 3)
// lru.put('d', 4)
// lru.put('b', 5)
// lru.put('e', 7)
// lru.put('c', 10)
// lru.put('d', 11)
// lru.put('d', 12)
// lru.put('f', 15)
// lru.put('d', 11)

// lru.printLru();
// lru.get('e')
// lru.printLru();
// console.log('length', lru.length)