export interface Options {
  cache?: string;
  port?: number;
  hostname?: string;
  expire?: string | number;
  respondOnHit?: boolean;
  capacity?: number;
}

export interface CacheValue {
  headers: { [k:string]:string };
  body: Uint8Array;
  status: number;
}
