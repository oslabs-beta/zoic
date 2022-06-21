class PerfMetrics {
    constructor(){
        this.numEntries = 0;
        this.numHits = 0;
        this.numMisses = 0;
        this.cacheMissTime = 0;
        this.cacheHitTimes = [];
        this.latency = 0;
        this.cacheSize = 0;
    }

    addEntry = () => {
        return new Promise(() => {
            this.numEntries++;
            console.log('new this.numEntries after adding: ', this.numEntries);
        }, () => console.log('addEntry promise rejected'));
    };

    deleteEntry = () => {
        return new Promise(() => {
            this.numEntries--;
            console.log('new this.numEntries after deleting: ', this.numEntries);
        }, () => console.log('deleteEntry promise rejected'));
    };

    addHit = () => {
        return new Promise(() => {
            this.numHits++;
            console.log('Cache hits: ', this.numHits);
        }, () => console.log('addHit promise rejected'));
    };

    addMiss = () => {
        return new Promise(() => {
            this.numMisses++;
            console.log('Cache misses: ', this.numMisses);
        }, () => console.log('addMiss promoise rejected'));
    };

    updateCacheMissTime = (newCacheTime) => {
        return new Promise(() => {
            this.cacheMissTime = newCacheTime;
            this.cacheHitTimes = [];
            console.log('Miss latency timer: ', newCacheTime);
        }, () => console.log('updateCacheMissTime'));
    };

    addCacheHitTime = (newCacheHitTime) => {
        return new Promise(() => {
            this.cacheHitTimes.push(newCacheHitTime);
            this.latency = this.cacheMissTime - this.cacheHitTimes[this.cacheHitTimes.length - 1];
            console.log('Hit latency timer: ', newCacheHitTime);
        }, () => console.log('addCacheHitTime'));
    };

    //Attempt at implementing cache size (in bytes / mb) functionality

    // addingBytesToCache = async function(newCachePiece){

    //     const file = new File(["Hello World😔😔😔😔"], "hello.txt");
    //     console.log('Bytes: ',file.size);
    //     this.cacheSize += whateverOurCountBytesFunctionIs(newCachePiece)
    //     console.log('new this.cacheSize after adding is: ', this.cacheSize)
    // }; 

    // deletingBytesFromCache = (evictedCachePiece) => {
    //     this.cacheSize -= whateverOurCountBytesFunctionIs(evictedCachePiece)
    //     console.log('new this.cacheSize after deleting is: ', this.cacheSize)
    // }
}

export default PerfMetrics;
