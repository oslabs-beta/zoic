// document.addEventListener('DOMContentLoaded', () => {  
  
    const root = document.querySelector('body');
    const metrics = document.createElement('div');
  
    root.appendChild(metrics);
    metrics.setAttribute('class', 'metricsContainer');
  
    const entries = document.querySelector('#entries');
    const hits = document.querySelector('#hits');
    const misses = document.querySelector('#misses');
    const avHitLatency = document.querySelector('#avHitLatency');
    const avMissLatency = document.querySelector('#avMissLatency');

    let serverURL;

    document.querySelector('#localHostInputID').setAttribute('size',document.querySelector('#localHostInputID').getAttribute('placeholder').length);


    const button = document.querySelector('button');
    button.addEventListener('click', () => {
        let serverURL = 'http://localhost:8000';
        // serverURL = document.querySelector('#localHostInputID').value;
        console.log('serverURL: ', serverURL)

        setInterval(() => {
          fetch(`${serverURL}/localDB.json`, {
          mode: 'cors',
          headers: {
            'Cache-Control': "no-cache"},
            'pragma': 'no-cache'})
          .then(response => {
            console.log("hey")
            return response.json()})
          .then(metricsData => {
            
            const {
              number_of_entries,
              reads_processed,
              writes_processed,
              average_hit_latency,
              average_miss_latency
            } = metricsData;
          
            entries.innerHTML = `${number_of_entries || '0'}`;
            hits.innerHTML = `${reads_processed || '0'}`;
            misses.innerHTML = `${writes_processed || '0'}`;
            avHitLatency.innerHTML = `${average_hit_latency.toString().slice(0, 5) || '0'}ms`;
            avMissLatency.innerHTML = `${average_miss_latency.toString().slice(0, 6)  || '0'}ms`;
      
        }).catch((err) => console.log('I found the problem, Jasper: ', err));
    
    
    }, 1500);
    });
    
    // setInterval(() => {
    //   fetch(`${serverURL}/src/localDB.json`, {
    //   headers: {
    //     'Cache-Control': "no-cache"},
    //     'pragma': 'no-cache'})
    //   .then(response => {
    //     console.log("hey")
    //     return response.json()})
    //   .then(metricsData => {
        
    //     const {
    //       number_of_entries,
    //       reads_processed,
    //       writes_processed,
    //       average_hit_latency,
    //       average_miss_latency
    //     } = metricsData;
      
    //     entries.innerHTML = `${number_of_entries || '0'}`;
    //     hits.innerHTML = `${reads_processed || '0'}`;
    //     misses.innerHTML = `${writes_processed || '0'}`;
    //     avHitLatency.innerHTML = `${average_hit_latency.toString().slice(0, 5) || '0'}ms`;
    //     avMissLatency.innerHTML = `${average_miss_latency.toString().slice(0, 6)  || '0'}ms`;
  
    // })}, 1500);
  
  // });