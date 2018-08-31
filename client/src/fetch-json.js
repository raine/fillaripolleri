import * as U from 'karet.util'

const hasAbort = typeof AbortController !== 'undefined'
const fetchJSON = 
  (url, params = {}) =>
      U.fromPromise(() => fetch(url, params).then(res => res.json()))

export default fetchJSON
