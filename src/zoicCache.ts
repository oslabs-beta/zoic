import { Context, isHttpError, Status } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import LRU from './lru.ts'
//import LFU from './blahblah.js'

interface options {
  cache: string,
  time?: number,
  returnOnHit?: boolean
}

export class ZoicCache {
  cache: LRU;
  time: number;
  returnOnHit: boolean;
  constructor (options: options) {
    this.cache = this.#initCacheType(options.cache)
    this.time = options.time || 2000,
    this.returnOnHit = options.returnOnHit || false

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
  }
  
  #initCacheType (cache: string): LRU {
    console.log('cache: ', cache)
    if (cache === 'LRU') return new LRU();
    return new LRU();
  }

  async get (ctx: Context, next: () => Promise<unknown>) {
    const key: string = ctx.request.url.pathname + ctx.request.url.search;
    try {
      const cacheResults = await this.cache.get(key);

      // if (!cacheResults) {
      //   ctx.state._zoicMonkeyPatchReponse = ctx.state.toDomResponse
      //   ctx.response.toDomResponse = async function () {
      //     console.log('testing toDomResponse monkeypatch')
      //     ctx.state._zoicMonkeyPatchReponse()
      //   }
      //   return next()
      // }

      if (this.returnOnHit) {
        ctx.response.body = cacheResults;
        return;
      }

      ctx.state.zoic = cacheResults;

      return next();

    } catch {
      ctx.response.body = {
        success: false,
        message: 'failed to retrive data from cache'
      }
    }
    
  }
  
  async put (ctx: Context, next: () => Promise<unknown>) {

    try {
    // deconstruct context obj for args to cache put
    const value: any = ctx.state.zoic; 
    const key: string = ctx.request.url.pathname + ctx.request.url.search;
 
    // call to put to cache: response +1 for good put, -1 for err
    const putResponse: number = await this.cache.put(value, key) 
  
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


const lru = new LRU();
lru.put('a', 1)
lru.put('b', 2)
lru.put('c', 3)
lru.put('d', 4)
lru.put('b', 5)
lru.put('e', 7)
lru.put('c', 10)
lru.put('d', 11)
lru.put('d', 12)
lru.put('f', 15)
lru.put('d', 11)

lru.printLru();
lru.get('e')
lru.printLru();
console.log('length', lru.length)


//define middleware method/function, taking in options as arg
//code example:
//this.middleware = function (strDuration, middlewareToggle, localOptions)
  //define helper function, 'cache', within middleware method for HTTP route handling, taking in req, res, and next
  //code exmple:
  //var cache = function(req, res, next)
    //assign local variable 'key' the value of req.originalURL or req.url (will be different Oak)
    //attempt cache hit, assigning variable 'cached' the value of calling the imported cache function's get method, passing in 'key'
    //if 'cached' has value
      //return the the value of calling 'sendCachedResponse' passing in, req, res, 'cached', next, etc (function definition requires further investigation)
        //code example:
        // perf.hit(key)
        //return sendCachedResponse(req, res, cached, middlewareToggle, next, duration)
    //if 'cached' does NOT have value
      //return value of calling 'makeResponseCachable' passing in, req, res, 'cached', next, etc (function definition requires further investigation)
        //code example:
        // perf.miss(key)
        //return makeResponseCacheable(req, res, next, key, duration, strDuration, middlewareToggle)
  //middleware function returns value of calling 'cache'