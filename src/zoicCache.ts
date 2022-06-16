import { Context } from 'https://deno.land/x/oak@v10.6.0/mod.ts';
import LRU from './lru.ts'
//import LFU from './blahblah.js'


class ZoicCache {
  cache: LRU;
  time: number;
  returnOnHit: boolean;
  constructor (cache: string = 'LRU', time: number = 8.64e+7, returnOnHit: boolean = false) {
    this.cache = this.#initCacheType(cache);
    this.time = time,
    this.returnOnHit = returnOnHit
  }

  #initCacheType (cache: string) {
    if (cache === 'LRU') return new LRU();
    //if (cache === 'LFU') return new LFU();
  }

  async get (ctx: Context, next: () => Promise<unknown>) {
    
    const key: string = ctx.request.url.pathname + ctx.request.url.search;

    try {
      ctx.state.zoic = await this.cache.get(key);
      return next();
    } catch {
      return next({
        err: 'There was an error during cache retreival'
      });
    }
  


  }
  
  async put (ctx: Context, next: () => Promise<unknown>) {

    const value: any = ctx.state.zoic; 
    const key: string = ctx.request.url.pathname + ctx.request.url.search;
  
    const putResponse: any = await this.cache.put(value, key) 
   
    if (putResponse === +1) return next();
    if (putResponse === -1) return next({
      err: 'There was an error during cache inserting'
    })
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