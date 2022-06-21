import { Context, helpers } from "https://deno.land/x/oak/mod.ts";
import { writeJson, readJson } from 'https://deno.land/x/jsonfile/mod.ts';
import Client from '../model/db.ts'

const controller: Record <string, (ctx: Context, next: () => Promise<unknown>) => Promise<unknown> | void> = {};

controller.dbRead = async (ctx: Context, next: () => Promise<unknown>) => {

  // Get params of query for performance metrics testing
  const { name } = helpers.getQuery(ctx, { mergeParams: true })

  console.log(name)
  const queryObj = await Client.queryArray(
    `SELECT * FROM "public"."people" WHERE _id=$CHARNAME;`,
    //Parameterization
    { CHARNAME: name }
  );

  //fixes stringifying type bigint
  function toJson(data: any) {
    return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v}n` : v).replace(/"(-?\d+)n"/g, (_, a) => a);
  }

  //removes bigint and parses back to object
  ctx.state.test = JSON.parse(toJson(queryObj.rows));
  return next();
};

controller.dbWrite = async (ctx: Context, next: () => Promise<unknown>) => {
  const reqBody = ctx.request.body();
  if (!reqBody.value || reqBody.type !== 'json') {
    ctx.response.status = 400;
    ctx.response.body = {
      success: false,
      message: 'no data provided'
    }
    return;
  }
  const reqBodyVal = await reqBody.value;
  const currentJSON: any = await readJson(`${Deno.cwd()}/test.json`);
  Object.keys(reqBodyVal).forEach((key: string) => {
    currentJSON[key] = reqBodyVal[key];
  });
  await writeJson(`${Deno.cwd()}/test.json`, currentJSON);
  return next();
};

controller.objectRead = (ctx: Context, next: () => Promise<unknown>) => {
  const testObj: Record <string, number | string> = {
    test: 'hi',
    test2: 12
  };
  testObj.name = 'hank';
  testObj.age = 31; 
  ctx.state.testObj = testObj;
  return next();
};

export default controller;