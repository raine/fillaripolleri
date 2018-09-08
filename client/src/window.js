import * as R from 'ramda'
import * as U from 'karet.util'
import * as K from 'kefir'

let unique = 0
const next = () => ++unique

const isServer = typeof window === 'undefined'

const fromWindow = isServer
  ? () => U.never
  : (event) => U.fromEvents(window, event, next).toProperty(next)

export const scroll = fromWindow('scroll')
export const touchmove = fromWindow('touchmove')
export const popstate = fromWindow('popstate')
export const resize = fromWindow('resize')
export const orientationchange = fromWindow('orientationchange')

export const dimensions = U.parallel([
  resize,
  orientationchange
]).toProperty(next)

function getLocation() {
  const l = isServer ? {} : window.location
  return {
    path: l.pathname,
    search: l.search,
    hash: l.hash
  }
}
export const location = U.atom(getLocation())

location.onValue((next) => {
  if (!R.equals(getLocation(), next))
    window.history.pushState(null, '', `${next.path}${next.search}${next.hash}`)
})

const any = K.merge([
  scroll,
  touchmove,
  popstate,
  resize,
  orientationchange
]).throttle(0)

const fromWindowProp = (prop, on) => {
  const getProp = () => window[prop]
  return on
    .map(getProp)
    .toProperty(getProp)
    .skipDuplicates(Object.is)
}

export const scrollY = fromWindowProp('scrollY', any)
export const innerHeight = fromWindowProp('innerHeight', any)

popstate.onValue(() => location.set(getLocation()))
