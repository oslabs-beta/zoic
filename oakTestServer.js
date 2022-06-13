import { Application } from "https://deno.land/x/oak/mod.ts";
import router from './router.js'

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(async ctx => {
  await ctx.send({ root: `${Deno.cwd()}/static`, index: 'index.html'});
})

app.use(async ctx => {
  await ctx.send({root: `${Deno.cwd()}/static`})
})

app.addEventListener('error', event => {
  console.log(event.error)
});

await app.listen({ port: 8000 });