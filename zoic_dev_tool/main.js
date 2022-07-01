const root = document.querySelector('body');
const metrics = document.createElement('div');

root.appendChild(metrics);
metrics.setAttribute('class', 'metricsContainer');

const cacheType = document.querySelector('#cacheType');
const memoryUsed = document.querySelector('#memUsed');
const entries = document.querySelector('#entries');
const hits = document.querySelector('#hits');
const misses = document.querySelector('#misses');
const avHitLatency = document.querySelector('#avHitLatency');
const avMissLatency = document.querySelector('#avMissLatency');

document.querySelector('#localHostInputID').setAttribute('size',document.querySelector('#localHostInputID').getAttribute('placeholder').length);
const urlForm = document.querySelector('#localHostInputID');
urlForm.value = 'http://localhost:3000/zoicMetrics';

let fetchInterval;
const button = document.querySelector('button');
button.addEventListener('click', () => {
    if (fetchInterval) clearInterval(fetchInterval);
    const serverURL = document.querySelector('#localHostInputID').value;
    urlForm.value = '';
    document.querySelector('#loadingError').innerHTML = '';

    hits.innerHTML = 'loading...';
    misses.innerHTML = 'loading...';
    entries.innerHTML = 'loading...';
    cacheType.innerHTML = 'loading...';
    memoryUsed.innerHTML = 'loading...';
    avHitLatency.innerHTML = 'loading...';
    avMissLatency.innerHTML = 'loading...';

    fetchInterval = setInterval(() => {
      fetch(`${serverURL}`, {
        method:'get',
        mode: 'cors'
      })
      .then(response => response.json())
      .then(metricsData => {
        
        if(metricsData) {

          const {
            cache_type,
            memory_used,
            number_of_entries,
            reads_processed,
            writes_processed,
            average_hit_latency,
            average_miss_latency
          } = metricsData;
        
          cacheType.innerHTML = `${cache_type}`;
          memoryUsed.innerHTML = `${(memory_used / 1048576).toString().slice(0, 6) || '0'}mb`
          entries.innerHTML = `${number_of_entries || '0'}`;
          hits.innerHTML = `${reads_processed || '0'}`;
          misses.innerHTML = `${writes_processed || '0'}`;
          avHitLatency.innerHTML = `${average_hit_latency.toString().slice(0, 5) || '0'}ms`;
          avMissLatency.innerHTML = `${average_miss_latency.toString().slice(0, 6)  || '0'}ms`;
        }
    }).catch((err) =>{
      document.querySelector('#loadingError').innerHTML = "Error loading URL.";
      clearInterval(fetchInterval);
      return console.log(err);
    });
  }, 500);
});