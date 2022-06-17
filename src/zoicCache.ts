import { Context, Response } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import LRU from './lru.ts'
//import LFU from './blahblah.js'

interface options {
  cache?: string,
  time?: number,
  returnOnHit?: boolean
}

/**
  * class user initalizes to create new instance of cache.
  * takes options to define if cache type, time for items to remain in cache, and if response should be returned on cache hit
  * @param {object} //cache options
  * @returns {object} //new cache
**/

export class ZoicCache {
  cache: LRU;
  time: number;
  returnOnHit: boolean;
  constructor (options: options) {
    //initalizes cache options
    this.cache = this.#initCacheType(options.cache = 'LRU');
    this.time = options.time || 2000;
    this.returnOnHit = options.returnOnHit || false;

    this.use = this.use.bind(this);
    this.makeResponseCacheable = this.makeResponseCacheable.bind(this);
    this.put = this.put.bind(this);
  }


  /**
    * sets cache type
    * defaults to LRU
    * @param {string} //cache type via options
    * @return {object} //new cache object
  **/

  #initCacheType (cache: string): LRU {
    if (cache === 'LRU') return new LRU();
    return new LRU();
  }


  /**
    * primary caching middleware method on user end.
    * resposible for querying cache and either returning results to client/attaching results to ctx.state.zoic (depending on user options)
    * or, in the case of a miss, signalling to make response cachable.
    * @param {object} //Context object
    * @param {function} //next function
    * @return {promise || void} //enters next middleware func or returns response
  **/

  async use (ctx: Context, next: () => Promise<unknown>) {
    
    //defines key via api endpoint
    const key: string = ctx.request.url.pathname + ctx.request.url.search;

    try {
      //query cache
      const cacheResults = await this.cache.get(key);

      //check if cache miss
      if (!cacheResults) {
        //makes response cacheable via patch
        this.makeResponseCacheable(ctx)
        return next();
      }

      //if user selects returnOnHit option, return cache query results immediately 
      if (this.returnOnHit) {
        ctx.response.body = cacheResults;
        return;
      }

      //attach query results to ctx.state.zoic
      ctx.state.zoic = cacheResults;

      return next();

      //error handling (~~* needs work *~~)
    } catch {
      ctx.response.body = {
        success: false,
        message: 'failed to retrive data from cache'
      }
    }
  }



  /**
   * makes response store to cache at the end of middleware chain in the case of a cache miss.
   * this is done by patching 'toDomRespone' to send results to cache before returning to client.
   * @param {object} //Context object
   * @return {promise/void} //inner function returns promise/result of toDomReponse. outter function returns void.
  **/

  makeResponseCacheable (ctx: Context) {

    //create new response object to retain access to original toDomResponse function def
    const zoicResponse = new Response(ctx.request);
    const cache = this.cache;

    //patch toDomResponse to cache response body before returning resutls to client
    ctx.response.toDomResponse = function () {

      //add response body to cache
      const value: any = ctx.response.body; 
      const key: string = ctx.request.url.pathname + ctx.request.url.search;
      cache.put(key, value);

      //returns results to client
      zoicResponse.body = ctx.response.body;
      return new Promise (resolve => {                
        resolve(zoicResponse.toDomResponse());
      });
    }
    return;
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
 
    // call to put to cache: response +1 for good put, -1 for err
    const putResponse: number = await this.cache.put(key, value) 
  
    if (putResponse === +1) return next();
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