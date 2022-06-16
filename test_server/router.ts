import { Router } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import LRU from '../src/lru.js';

const router = new Router();
const lru = new LRU();

const cache = new zoicCache({
  cacheType: LRU,
  returnOnHit: true,
  time: 10
});

router.get('/readJson', lru.get, controller.jsonRead, lru.put, ctx => {
    console.log('ctx.response.body: ', ctx.state.json)
    ctx.response.body = ctx.state.json;
});

router.post('/writeJson', controller.writeJson, controller.jsonRead, ctx => {
  ctx.response.body = ctx.state.json;
})

router.get('/object', controller.objectRead, ctx => {
  ctx.response.body = ctx.state.testObj;
});

router.get('/other', ctx => {
  ctx.response.body = 'woww cool'
});

export default router;