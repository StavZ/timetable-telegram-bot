const fetch = require('node-fetch');
const cache = new Map();

class Fetcher {
  /**
   * @param {string} url
   * @param {{cache: boolean, json: boolean, headers: any}} options
   */
  async request (url, options) {
    if (cache.has(url) && options.cache) return cache.get(url);
    const res = await fetch(url, options);
    if (res.status === 522) throw new Error('522 | Connection Timed Out');
    const parsedRes = (options.json ? (await res.json()) : null);
    if (res.status === 400) throw new Error('400 | Bad Request');
    if (options.cache) {
      cache.set(url, options.json ? parsedRes : res);
      setTimeout(() => cache.delete(url), 1000 * 180);
    }
    return options.json ? parsedRes : res;
  }
  get cache () {
    return cache;
  }
}
module.exports = Fetcher;
