import * as R from 'ramda'
import * as L from 'partial.lenses'
import log from './logger'
import * as nearley from 'nearley'
import * as frameSizeGrammar from  '../grammar/frame-size'
import fs from 'fs'
import camelCase from 'lodash.camelcase'
import { DateTime } from 'luxon'
import TurndownService from 'turndown'

const turndownService =  new TurndownService()
const locations = require('../data/cities.json')
const abbrevToLocation = require('../data/cities-abbreviations.json')
const locationToAbbrev = R.invertObj(abbrevToLocation)

const remove = R.replace(R.__, '')
const removePatterns = (patterns) => (str) =>
  R.reduce((acc, pat) => remove(pat, acc), str, patterns)

const removeSellingPrefix = remove(/^m\s?:|^myydään?|^myynnissä/i)
const removeSold = remove(/^myyty( - |:)?\s?/i)
const trimSpecial = removePatterns([
  /^[\s!:_\-,]*/,
  /[\s!:_\-,/\*]*$/,
  /\(\)/, // If removing price/location results in ()
  /\[\]/ // If removing price/location results in []
])

const sortById = R.sortBy(L.get('id'))
const isSold = (str) => /myyty/i.test(str)
const isNotSold = R.complement(isSold)

const lastSnapshotIsSold = L.get([
  L.normalize(sortById),
  L.last,
  'subject',
  isSold
])

// There must be a better way for this
const tryPatterns = (patterns) => (str) =>
  R.reduce(
    (acc, pat) => {
      const match = R.match(pat, str)
      const fst = match[1]
      return fst ? R.reduced(fst) : null
    },
    null,
    patterns
  )

const tryFns = (fns) => (val) =>
  R.reduce(
    (acc, fn) => {
      const res = fn(val)
      return res ? R.reduced(res) : null
    },
    null,
    fns
  )

export const removePrice = removePatterns([
  /\bhinta\b/,
  /\d+\s?euroa/,
  /\b\d+\s?e\b/,
  /\d+\s?€/
])

export const parsePrice = R.pipe(
  R.replace(/\u00a0/g, ' '),
  tryPatterns([
    /(?:Hintapyyntö|Hinta|Hp):?\s?(\d?[\s\.]?\d+)\s?(?:€|e|euroa|eur)?/i,
    /(\d+),-\B/, // 7,-
    /(\d+)\s?€/,
    /(\d+) euroa/i,
    /(\d+) euros/i,
    // Match '2e' without matching '.2e' or 'f2e'
    /(?<!\.|\w)(\d+)e/
  ]),
  R.when((x) => x, remove(' ')),
  R.when((x) => x, parseInt),
  R.defaultTo(null)
)

const lastIsAWithUmlauts = (x) => x.slice(-1) === 'ä'
const locationWordBoundary = (location) =>
  `\\b${location}${lastIsAWithUmlauts(location) ? '' : '\\b'}`
const caseInsensitiveRegex = (str) =>
  new RegExp(str, 'iu')
export const cleanUpSubject = (location) =>
  R.pipe(
    removeSold,
    removeSold,
    removeSellingPrefix,
    removePrice,
    location
      ? remove(caseInsensitiveRegex(locationWordBoundary(location)))
      : R.identity,
    location && locationToAbbrev[location]
      ? remove(caseInsensitiveRegex(locationWordBoundary(locationToAbbrev[location])))
      : R.identity,
    R.replace(/\s\s+/g, ' '),
    // Handle removed location that leaves something like (55cm, 2017, )
    // Ideally location removal would match ", <location>"
    R.replace(/,\s?\)/g, ')'),
    trimSpecial,
    R.trim
  )

const capitalize = (str) =>
  str[0].toUpperCase() + str.slice(1).toLowerCase()

// no \\b after {x} because ä in Jyväskylä is unicode and word boundaries don't
// work with unicode
const locationsRegex = new RegExp(locations.map(locationWordBoundary).join('|'), 'iu')
const abbrevs = Object.keys(abbrevToLocation)
const abbrevsRegex = new RegExp(abbrevs.map(locationWordBoundary).join('|'), 'iu')

const matchGetHead = R.curry((pat, str) => {
  const m = str.match(pat)
  return m ? m[0] : null
})

export const parseLocation = (str) => R.pipe(
  R.replace(/\u00a0/g, ' '),
  tryFns([
    matchGetHead(locationsRegex),
    (str) => {
      const abbrev = matchGetHead(abbrevsRegex, str)
      return abbrev ? abbrevToLocation[abbrev.toUpperCase()] : null
    },
    tryPatterns([
      /Paikkakunta \(lisää myös otsikkoon\):\s?(\p{L}{3,})/u,
      /Paikkakunta\s?(?<!\(lisää myös otsikkoon\)):\s?(\p{L}{3,})/u
    ])
  ]),
  R.when(Boolean, capitalize)
)(str)

const parseEachLineWithGrammar = (grammar, sanitizedMessage) =>
  R.pipe(
    R.split('\n'),
    R.addIndex(R.map)((line, idx) => {
      const parser = new nearley.Parser(grammar)
      parser.feed(line)
      return parser.results
    }),
    R.flatten
  )(sanitizedMessage)

export const parseFrameSize = (id) => (sanitizedMessage) => {
  let results
  try {
    // fs.writeFileSync(`tmp/${id}.txt`, sanitizedMessage, 'utf8')
    results = parseEachLineWithGrammar(
      nearley.Grammar.fromCompiled(frameSizeGrammar), sanitizedMessage
    )
  } catch (err) {
    log.error(err, 'error parsing sanitized message')
    fs.writeFileSync(`tmp/${Date.now()}.txt`, sanitizedMessage, 'utf8')
    return null
  }
  return results.length ? results[0] : null
}

const frameSizeResultToDbSchema = ({ type, value }) => ({
  frameSizeTshirt: type === 't-shirt' ? value : null,
  frameSizeCm: type === 'cm' ? value : null
})

const sanitizeMsg = R.pipe(
  remove(/\u2028/g),
  html => turndownService.turndown(html)
)

const FRAME_SIZE_CATEGORIES = [
  8, 52, 54, 55, 56, 57, 58, 60, 61, 62, 63, 69, 72, 74, 75, 84, 85, 86
]

export const processTopic = (topic) => {
  const { snapshots, guid, date, category, categoryId } = topic
  const snapshot = findLastUnsoldSnapshot(snapshots) || snapshots[0]
  const { link, subject, message } = snapshot
  const location = parseLocation(`${subject} ${message}`)
  const sanitizedMessage = sanitizeMsg(message)

  return {
    id: guid,
    timestamp: date,
    category,
    categoryId,
    link,
    ...frameSizeResultToDbSchema(
      FRAME_SIZE_CATEGORIES.includes(categoryId)
        ? parseFrameSize(guid)(sanitizedMessage) || {}
        : {}
    ),
    title: cleanUpSubject(location)(subject),
    sold: lastSnapshotIsSold(snapshots),
    price: parsePrice(message),
    location
  }
}

export const findLastUnsoldSnapshot = R.pipe(
  sortById,
  R.findLast(L.get(['subject', isNotSold]))
)

const camelizeKeys = L.modify(L.keys, camelCase)
const snapshotsL = ['snapshots', L.elems]
const camelizeSnapshotKeys = L.modify(snapshotsL, camelizeKeys)
const parseSnapshotDates = L.modify([snapshotsL, 'createdAt'], DateTime.fromISO)
const dateToDateTime = L.modify('date', DateTime.fromJSDate)

export const sanitizeTopicRow = R.pipe(
  camelizeKeys,
  camelizeSnapshotKeys,
  parseSnapshotDates,
  dateToDateTime
)
