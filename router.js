import { Router } from "https://deno.land/x/oak/mod.ts";

const router = new Router();

// router.get('/json', async ctx => {
//   ctx.response.body = await Deno.readFile(`${Deno.cwd()}/test.json`);
// })

router.get('/json', async ctx => {
  ctx.response.url =`${Deno.cwd()}/test.json`;
})

router.get('/anotherEndpoint', ctx => {
  ctx.response.body = 'woww cool'
})

export default router;