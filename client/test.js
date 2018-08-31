import * as L from 'partial.lenses'
import * as R from 'ramda'
import URL from 'url'

const url = 'postgres://postgres:c16f374090c1a7d6e8fb41c2329d4316@localhost:54322/abc'
const urlL = L.iso(URL.parse, URL.format)

const modifyUrl = (params, url) =>
  URL.format({ ...URL.parse(url), ...params })

console.log(modifyUrl({ pathname: '/foo', auth: 'foo:bar' }, url))
