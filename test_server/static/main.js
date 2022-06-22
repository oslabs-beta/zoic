// // import object here
// // import PerfMetrics from '../../src/performanceMetrics';
// //import ZoicCache from '../../src/zoicCache.ts';

//import 'http://localhost:8000/dbRead/Darth%20Vader'
// // import {metrics} from '/dbRead/Darth%20Vader'
// // import ZoicCache from '../../src/zoicCache.ts';

// import { multiRandomEndpointTest, singleRepeatedEndpointTest, multiRandomEndpointTestSlow, singleRepeatedEndpointTestSlow} from '../../src/fetchTest.ts'
document.addEventListener('DOMContentLoaded', () => {  
  
  const root = document.querySelector('#root');
  //const data = document.createElement('div');
  const hits = document.createElement('p');
  const misses = document.createElement('p');
  const entries = document.createElement('p');
  const avMissLatency = document.createElement('p')
  const avHitLatency = document.createElement('p');
  root.appendChild(hits);
  root.appendChild(misses);
  root.appendChild(entries);
  root.appendChild(avMissLatency);
  root.appendChild(avHitLatency);
  entries.innerHTML = "Number of entries: 0"
  hits.innerHTML = "Reads processed: 0" 
  misses.innerHTML = "Writes processed: 0" 
  avHitLatency.innerHTML = "Average cache hit latency: 0ms";
  avMissLatency.innerHTML = "Average cache miss latency: 0ms";
  
  
  setInterval(() => {
    fetch("./localDB.json", {
    headers: {
      'Cache-Control': "no-cache"},
      'pragma': 'no-cache'})
    .then(response => (response.json()))
    .then(obj => {
      
      const {number_of_entries, reads_processed, writes_processed, average_hit_latency, average_miss_latency} = obj;
    
      entries.innerHTML = "Number of entries: " + (number_of_entries || '0');
    
      hits.innerHTML = "Reads processed: " + (reads_processed || '0');
    
      misses.innerHTML = "Writes processed: " + (writes_processed || '0');

      avHitLatency.innerHTML = `Average cache hit latency: ${average_hit_latency || '0'}ms`;

      avMissLatency.innerHTML = `Average cache miss latency: ${average_miss_latency || '0'}ms`;

    
  })}, 1500);

})



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