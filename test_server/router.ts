import { Router, etag } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import { ZoicCache } from '../src/zoicCache.ts';

const router = new Router();

const cache = new ZoicCache({
  cache: 'Redis',
  port: 6379,
  capacity: 200,
  respondOnHit: true
});

router.get('/dbRead/:name', cache.use, controller.dbRead, async ctx => {
    ctx.response.headers.set('Content-type', 'application/json');
    const value = await etag.calculate('hello')
    ctx.response.headers.set("ETag", value);
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