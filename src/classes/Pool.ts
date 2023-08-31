export default class Pool<T> {
  private pool: T[];
  private Func: Pool.Resettable<T>;

  //private preAllocate: number | undefined;
  private maxPoolSize: number | undefined;

  constructor(Func: Pool.Resettable<T>, {preAllocate, maxPoolSize}: {preAllocate?: number, maxPoolSize?: number} = {}) {
    this.pool = [];
    this.Func = Func;

    this.maxPoolSize = maxPoolSize;

    if(maxPoolSize !== undefined && maxPoolSize < 1) {
      throw new Error(`\`Invalid arguments: value of 'maxPoolSize' may not be 0 or less`);
    }

    if(preAllocate !== undefined && preAllocate < 0) {
      throw new Error(`\`Invalid arguments: value of 'preAllocate' may not be less than 0`);
    }

    if(maxPoolSize !== undefined && preAllocate !== undefined && preAllocate > maxPoolSize) {
      throw new Error(`\`Invalid arguments: value of 'preAllocate' may not be larger than 'maxPoolSize'`);
    }

    if(preAllocate) {
      for(let i = 0; i < preAllocate; i++) {
        this.pool[i] = new Func();
      }
    }
  }

  get(): T {
    if (this.pool.length) {
      return this.pool.pop();
    }
    return new this.Func();
  }

  release(obj: T): void {
    this.Func.reset?.(obj);

    if(this.maxPoolSize === undefined || this.maxPoolSize > this.pool.length) {
      this.pool.push(obj);
    }
  }
}
  
module Pool {
  export interface Resettable<T extends Object> {
    // constructor
    new (): T;
    // static
    reset?(obj: T): void;
  }
}
  