document.addEventListener('DOMContentLoaded', () => {  
  
  const root = document.querySelector('#root');
  const metrics = document.createElement('div');

  root.appendChild(metrics);
  metrics.setAttribute('class', 'metricsContainer');

  const entries = document.createElement('div')
  const hits = document.createElement('div');
  const misses = document.createElement('div');
  const avHitLatency = document.createElement('div');
  const avMissLatency = document.createElement('div');

  const entriesContainer = document.createElement('div')
  const hitsContainer = document.createElement('div')
  const missesContainer = document.createElement('div')
  const avHitLatencyContainer = document.createElement('div')
  const avMissLatencyContainer = document.createElement('div')

  entriesContainer.setAttribute('class', 'metricContainer');
  hitsContainer.setAttribute('class', 'metricContainer');
  missesContainer.setAttribute('class', 'metricContainer');
  avHitLatencyContainer.setAttribute('class', 'metricContainer');
  avMissLatencyContainer.setAttribute('class', 'metricContainer');

  metrics.appendChild(entriesContainer);
  metrics.appendChild(hitsContainer);
  metrics.appendChild(missesContainer);
  metrics.appendChild(avHitLatencyContainer);
  metrics.appendChild(avMissLatencyContainer);

  entriesContainer.appendChild(entries)
  hitsContainer.appendChild(hits);
  missesContainer.appendChild(misses);
  avHitLatencyContainer.appendChild(avHitLatency);
  avMissLatencyContainer.appendChild(avMissLatency);

  entries.innerHTML = "Number of entries: loading...";
  hits.innerHTML = "Reads processed: loading...";
  misses.innerHTML = "Writes processed: loading...";
  avHitLatency.innerHTML = "Average cache hit latency: loading...";
  avMissLatency.innerHTML = "Average cache miss latency: loading...";
  
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