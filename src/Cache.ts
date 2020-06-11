import Redis from 'ioredis';
import { loggerInstance } from './Logger';

const redisClient = () => {
  if (typeof process.env.CACHE_SERVER !== 'undefined') {
    return new Redis(`redis://${process.env.CACHE_SERVER}`);
  }
};

const Cache: { [k: string]: any } = {

  client: redisClient(),

  set: function (key: string, value: string, ttl: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, 'EX', ttl)
        .then(_ => {
          resolve(true);
        }).catch(err => {
          loggerInstance().error(err);
          reject(err);
        });
    });
  },

  get: function (key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.get(key)
        .then(result => {
          resolve(result);
        }).catch(err => {
          loggerInstance().error(err);
          reject(err);
        });
    });
  },

  delete: function (key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.client.del(key)
        .then(_ => {
          resolve(true);
        }).catch(err => {
          loggerInstance().error(err);
          reject(err);
        });
    });
  }
};

export = Cache;
