document.addEventListener('DOMContentLoaded', () => {  
  
  const root = document.querySelector('#root');
  const hits = document.createElement('p');
  const misses = document.createElement('p');
  const entries = document.createElement('p');
  const avMissLatency = document.createElement('p');
  const avHitLatency = document.createElement('p');
  root.appendChild(hits);
  root.appendChild(misses);
  root.appendChild(entries);
  root.appendChild(avMissLatency);
  root.appendChild(avHitLatency);
  entries.innerHTML = "Number of entries: 0";
  hits.innerHTML = "Reads processed: 0";
  misses.innerHTML = "Writes processed: 0";
  avHitLatency.innerHTML = "Average cache hit latency: 0ms";
  avMissLatency.innerHTML = "Average cache miss latency: 0ms";
  
  
  setInterval(() => {
    fetch("./localDB.json", {
    headers: {
      'Cache-Control': "no-cache"},
      'pragma': 'no-cache'})
    .then(response => response.json())
    .then(obj => {
      
      const {number_of_entries, reads_processed, writes_processed, average_hit_latency, average_miss_latency} = obj;
    
      entries.innerHTML = `Number of entries: ${number_of_entries || '0'}`;
    
      hits.innerHTML = `Reads processed: ${reads_processed || '0'}`;
    
      misses.innerHTML = `Writes processed: ${writes_processed || '0'}`;

      avHitLatency.innerHTML = `Average cache hit latency: ${average_hit_latency || '0'}ms`;

      avMissLatency.innerHTML = `Average cache miss latency: ${average_miss_latency || '0'}ms`;

    
  })}, 1500);

});