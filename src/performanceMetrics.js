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
        this.addingBytesToCache = this.addingBytesToCache.bind(this);
        this.deletingBytesFromCache = this.deletingBytesFromCache.bind(this);

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
    
    addingBytesToCache = async function(newCachePiece){

        const file = new File(["Hello World😔😔😔😔"], "hello.txt");
        console.log('Bytes: ',file.size);
        this.cacheSize += whateverOurCountBytesFunctionIs(newCachePiece)
        console.log('new this.cacheSize after adding is: ', this.cacheSize)
    }; 

    deletingBytesFromCache = (evictedCachePiece) => {
        this.cacheSize -= whateverOurCountBytesFunctionIs(evictedCachePiece)
        console.log('new this.cacheSize after deleting is: ', this.cacheSize)
    }


}

export default PerfMetrics;
