// // import object here
// // import PerfMetrics from '../../src/performanceMetrics';
// //import ZoicCache from '../../src/zoicCache.ts';

//import 'http://localhost:8000/dbRead/Darth%20Vader'
// // import {metrics} from '/dbRead/Darth%20Vader'
// // import ZoicCache from '../../src/zoicCache.ts';


let obj = {
  numEntries: 0,
  numHits: 0,
  numMisses: 0
}



const test = document.querySelector('div');

const data = document.createElement('div');



const hits = document.createElement('p');

const misses = document.createElement('p');


setInterval(function(){fetch("./localDB.json", {
  headers: {
    'Cache-Control': "no-cache"},
    'pragma': 'no-cache'})
.then(response => (
  //THIS LINE IS HITTING
  //THIS LINE IS HITTING TOO
   response.json()))
  // response.json())
.then(obj => {

  const {numEntries, numHits, numMisses} = obj;
  const entries = document.createElement('p');

entries.innerHTML = "numEntries: " + numEntries;
data.appendChild(entries);

hits.innerHTML = "numHits: " + numHits;
data.appendChild(hits);
misses.innerHTML = "numMisses: " + numMisses;
data.appendChild(misses);

test.appendChild(data);

})}, 1000)


// import '../../test_server/localDB.json';

// const mydata = JSON.parse(data);

// import { readJson, readJsonSync } from 'https://deno.land/x/jsonfile/mod.ts';

// const f = await readJson('..localDB.json');
// const foo = readJsonSync('../localDB.json');

// console.log(f, foo)

/////////////////////////// After this

// const {numEntries, numHits, numMisses} = obj;

// const test = document.querySelector('div');


// const data = document.createElement('div');


// const entries = document.createElement('p');
// entries.innerHTML = "numEntries: " + numEntries;
// data.appendChild(entries);

// const hits = document.createElement('p');
// hits.innerHTML = "numHits: " + numHits;
// data.appendChild(hits);

// const misses = document.createElement('p');
// misses.innerHTML = "numMisses: " + numMisses;
// data.appendChild(misses);

// test.appendChild(data);