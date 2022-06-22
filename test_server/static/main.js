document.addEventListener('DOMContentLoaded', () => {  
  
  const root = document.querySelector('#root');
  const metrics = document.createElement('div');

  root.appendChild(metrics);
  metrics.setAttribute('class', 'metricsContainer');

  const entries = document.querySelector('#entries');
  const hits = document.querySelector('#hits');
  const misses = document.querySelector('#misses');
  const avHitLatency = document.querySelector('#avHitLatency');
  const avMissLatency = document.querySelector('#avMissLatency');
  
  setInterval(() => {
    fetch("/localDB.json", {
    headers: {
      'Cache-Control': "no-cache"},
      'pragma': 'no-cache'})
    .then(response => response.json())
    .then(metricsData => {
      
      const {
        number_of_entries,
        reads_processed,
        writes_processed,
        average_hit_latency,
        average_miss_latency
      } = metricsData;
    
      entries.innerHTML = `Number of entries:  ${number_of_entries || '0'}`;
      hits.innerHTML = `Reads processed:  ${reads_processed || '0'}`;
      misses.innerHTML = `Writes processed: ${writes_processed || '0'}`;
      avHitLatency.innerHTML = `Average cache hit latency:  ${average_hit_latency.toString().slice(0, 5) || '0'}ms`;
      avMissLatency.innerHTML = `Average cache miss latency:  ${average_miss_latency.toString().slice(0, 6)  || '0'}ms`;

  })}, 1500);

});