import { Router, etag } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import { ZoicCache } from '../src/zoicCache.ts';

const router = new Router();

const zoic = new ZoicCache({
  cache: 'lru',
  port: 6379,
  respondOnHit: true
});

router.get('/dbRead/:name', zoic.use, controller.dbRead, async ctx => {
    //ctx.response.headers.set('Content-type', 'application/json');
    const value = await etag.calculate('hello')
    ctx.response.headers.set("ETag", value);
    const unit8 = new Uint8Array([12, 10, 13]);
    const blob = new Blob(['<div>hello</div>'])
    ctx.state.test.push(unit8)
    ctx.state.test.push(blob)
    ctx.response.body = ctx.state.test;
});


router.get('/zoicMetrics', zoic.getMetrics);

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