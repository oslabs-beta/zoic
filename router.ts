import { Router } from "https://deno.land/x/oak/mod.ts";
import controller from './controllers.ts'

const router = new Router();

router.get('/readJson', controller.jsonRead, ctx => {
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