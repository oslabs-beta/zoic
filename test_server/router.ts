import { Router } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts';
import  { ZoicCache } from '../src/zoicCache.ts';

const router = new Router();
const cache = new ZoicCache({ cache: 'LRU' });

router.get('/readJson', cache.get, controller.jsonRead, cache.put, ctx => {
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