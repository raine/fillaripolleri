import * as U from 'karet.util'

const hasAbort = typeof AbortController !== 'undefined'
const fetchJSON = hasAbort
  ? (url, params = {}) =>
      U.fromPromise(() => {
        const controller = new AbortController()
        return {
          ready: fetch(url, { ...params, signal: controller.signal }).then(
            (res) => res.json()
          ),
          abort() {
            controller.abort()
          }
        }
      })
  : (url, params = {}) =>
      U.fromPromise(() => fetch(url, params).then((res) => res.json()))

export default fetchJSON
