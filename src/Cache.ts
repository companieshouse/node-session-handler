import Redis from "ioredis";
import { loggerInstance } from "./Logger";

const client = null;

const Cache = {

  _setClient: function (): void {
    try {
      if (!this.clent || typeof this.client === 'undefined') {
        this.client = new Redis(`redis://${process.env.CACHE_SERVER}`);
      }
    } catch (err) {
      loggerInstance().error(err);
    }
  },

  set: function (key: string, value: string, ttl: number): Promise<boolean> {
    this._setClient();
    return new Promise ((resolve, reject) => {
      this.client.set(key, value, "EX", ttl)
        .then(_ => {
          resolve(true);
        }).catch(err => {
          loggerInstance().error(err);
          reject(false);
        });
      });
  },

  get: function (key: string): Promise<string> {
    this._setClient();
    return new Promise ((resolve, reject) => {
      this.client.get(key)
        .then(result => {
          resolve(result);
        }).catch(err => {
          loggerInstance().error(err);
          reject(false);
        });
      });
  },

  delete: function (key: string): Promise<boolean> {
    this._setClient();
    return new Promise ((resolve, reject) => {
      this.client.del(key)
        .then(_ => {
          resolve(true);
        }).catch(err => {
          loggerInstance().error(err);
          reject(false);
        });
      });
  }
};

export = Cache;
