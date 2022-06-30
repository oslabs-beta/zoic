// document.addEventListener('DOMContentLoaded', () => {  
  
    const root = document.querySelector('body');
    const metrics = document.createElement('div');
  
    root.appendChild(metrics);
    metrics.setAttribute('class', 'metricsContainer');
  
    const memoryUsed = document.querySelector('#memUsed');
    const entries = document.querySelector('#entries');
    const hits = document.querySelector('#hits');
    const misses = document.querySelector('#misses');
    const avHitLatency = document.querySelector('#avHitLatency');
    const avMissLatency = document.querySelector('#avMissLatency');

    document.querySelector('#localHostInputID').setAttribute('size',document.querySelector('#localHostInputID').getAttribute('placeholder').length);


    const button = document.querySelector('button');
    button.addEventListener('click', () => {
        let serverURL = 'http://localhost:8000';
        // serverURL = document.querySelector('#localHostInputID').value;
        console.log('serverURL: ', serverURL)

        setInterval(() => {
          fetch(`${serverURL}/zoicMetrics`, {
          method:'get',
          // headers: {
          //   'Cache-Control': "no-cache"},
          //   'pragma': 'no-cache'
          })
          .then(response => {
            console.log("hey")
            return response.json()})
          .then(metricsData => {
            
            const {
              memory_used,
              number_of_entries,
              reads_processed,
              writes_processed,
              average_hit_latency,
              average_miss_latency
            } = metricsData;
          
            memoryUsed.innerHTML = `${(memory_used * 1000).toString().slice(0, 6) || '0'}mb`
            entries.innerHTML = `${number_of_entries || '0'}`;
            hits.innerHTML = `${reads_processed || '0'}`;
            misses.innerHTML = `${writes_processed || '0'}`;
            avHitLatency.innerHTML = `${average_hit_latency.toString().slice(0, 5) || '0'}ms`;
            avMissLatency.innerHTML = `${average_miss_latency.toString().slice(0, 6)  || '0'}ms`;
      
        }).catch((err) => console.log('I found the problem, Jasper: ', err));
    
    
    }, 1500);
    });