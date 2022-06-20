class PerfMetrics {
    constructor(){
        this.numEntries = 0;
        this.addEntry = () => {
            this.numEntries++;
            console.log('new this.numEntries after adding: ', this.numEntries)
        }
        this.deleteEntry = () => {
            this.numEntries--;
            console.log('new this.numEntries after deleting: ', this.numEntries)
        }
        this.cacheSize = 0;
        this.metricsAddToCache = this.metricsAddToCache.bind(this);
        this.metricsDeletingFromCache = this.metricsDeletingFromCache.bind(this);

        this.numHits = 0;
        this.addHit = () => {
            this.numHits++;
            console.log('new this.numHits after adding is: ', this.numHits)
        }
        this.numMisses = 0;
        this.addMiss = () => {
            this.numMisses++;
            console.log('new this.numMisses after adding is: ', this.numMisses)
        }

    }
    
    metricsAddToCache = (newCachePiece) => {
                this.cacheSize += whateverOurCountBytesFunctionIs(newCachePiece)
                console.log('new this.cacheSize after adding is: ', this.cacheSize)
    }; 
    
    metricsDeletingFromCache = (evictedCachePiece) => {
        this.cacheSize -= whateverOurCountBytesFunctionIs(evictedCachePiece)
        console.log('new this.cacheSize after deleting is: ', this.cacheSize)
    }


}

export default PerfMetrics;
