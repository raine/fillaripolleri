import * as U from 'karet.util'
import * as R from 'kefir.ramda'
import * as L from 'partial.lenses'
import searchParamsL from './search-params'

const queryStringify = L.getInverse(searchParamsL)

const API_URL = process.env.API_URL

const hasAbort = typeof AbortController !== 'undefined'
const fetchJSON = hasAbort
  ? (path, query = {}, params = {}) =>
      U.fromPromise(() => {
        const url = API_URL + path + queryStringify(R.pickBy(Boolean, query))
        const controller = new AbortController()

        return {
          ready: fetch(url, {
            ...params,
            signal: controller.signal
          }).then((res) => res.json()),
          abort() {
            controller.abort()
          }
        }
      })
  : (path, params = {}) =>
      U.fromPromise(() =>
        fetch(API_URL + path, params).then((res) => res.json())
      )

export default fetchJSON
