import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import * as L from 'partial.lenses'
import searchParamsL from './search-params'

const queryStringify = L.getInverse(searchParamsL)

const API_URL = process.env.API_URL
const formatUrl = (path, query) =>
  API_URL + path + queryStringify(R.pickBy(Boolean, query))

const hasAbort = typeof AbortController !== 'undefined'
const fetchJSON = hasAbort
  ? (path, query = {}, params = {}) =>
      U.fromPromise(() => {
        const controller = new AbortController()
        return {
          ready: fetch(formatUrl(path, query), {
            ...params,
            signal: controller.signal
          }).then((res) => res.json()),
          abort() {
            controller.abort()
          }
        }
      })
  : (path, query = {}, params = {}) =>
      U.fromPromise(() =>
        fetch(formatUrl(path, query), params).then((res) => res.json())
      )

export default fetchJSON
