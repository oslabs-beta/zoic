import { Router } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import { ZoicCache } from '../src/zoicCache.ts';

const router = new Router();

const cache = new ZoicCache({
  cache: 'LRU',
  expire: '5m, 3s',
  capacity: 50,
  respondOnHit: true
});

router.get('/dbRead/:name', cache.use, controller.dbRead, ctx => {
    ctx.response.body = ctx.state.test;
});

router.post('/dbWrite', controller.dbWrite, controller.dbRead, ctx => {
  ctx.response.body = ctx.state.zoic;
})

router.get('/object', controller.objectRead, ctx => {
  ctx.response.body = ctx.state.testObj;
});

router.get('/other', ctx => {
  ctx.response.body = 'woww cool'
});

export default router;