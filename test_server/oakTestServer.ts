import { Application } from "https://deno.land/x/oak/mod.ts";
import router from './router.ts'

const app = new Application();

const portNum = 8000;

console.log('Deno.cwd() ', Deno.cwd())

//These tell the server to run the route files
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

app.addEventListener('listen', ({secure, hostname, port}) => {
  const protocol = secure ? 'https://' : 'http://';
  const url = `${protocol}${hostname || 'localhost'}:${port}`;
  console.log(`listening on port ${url}`);
})

await app.listen({ port: portNum });