import { Router, etag } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import { ZoicCache } from '../src/zoicCache.ts';

const router = new Router();

const zoic = new ZoicCache({
  cache: 'lru',
  port: 6379,
  expire: '5m'
});

router.get('/zoicMetrics', zoic.getMetrics);

router.get('/dbRead/:name', zoic.use, controller.dbRead, async ctx => {
    const value = await etag.calculate('hello');
    ctx.response.headers.set("ETag", value);
    const unit8 = new Uint8Array([12, 10, 13]);
    ctx.state.test.push(unit8);
    ctx.response.body = ctx.state.test;
});

router.post('/dbRead/2', zoic.manualPut, controller.dbWrite, ctx => {
  ctx.response.body = ctx.state.test;
})

router.get('/object', controller.objectRead, ctx => {
  ctx.response.body = ctx.state.testObj;
});

router.get('/other', ctx => {
  ctx.response.body = 'woww cool'
});

export default router;