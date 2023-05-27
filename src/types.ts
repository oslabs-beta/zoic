export interface options {
  cache?: string;
  port?: number;
  hostname?: string;
  expire?: string | number;
  respondOnHit?: boolean;
  capacity?: number;
}

export interface cacheValue {
  headers: { [k: string]: string };
  body: Uint8Array;
  status: number;
}
