import * as R from 'ramda'
import * as L from 'partial.lenses'
import log from './logger'

const remove = R.replace(R.__, '')
const removePatterns = (patterns) => (str) =>
  R.reduce((acc, pat) => remove(pat, acc), str, patterns)

const removeSellingPrefix = remove(/^m:|^myydään?|^myynnissä/i)
const removeSold = remove(/^myyty( - |:)?\s?/i)
const trimSpecial = removePatterns([
  /^[\s!:_\-,]*/,
  /[\s!:_\-,/]*$/,
  /\(\)/ // If removing price results in ()
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
      const fst = R.match(pat, str)[1]
      return fst ? R.reduced(fst) : null
    },
    null,
    patterns
  )

export const removePrice = removePatterns([
  /\bhinta\b/,
  /\d+\s?euroa/,
  /\d+\s?[€e]/
])

export const parsePrice = R.pipe(
  tryPatterns([
    /(?:Hintapyyntö|Hinta|Hp):?\s?(\d+)\s?(?:€|e|euroa|eur)?/,
    /(\d+),-\B/, // 7,-
    /(\d+)\s?€/,
    /(\d+) euroa/i,
    /(\d+) euros/i,
    // Match '2e' without matching '.2e' or 'f2e'
    /(?<!\.|\w)(\d+)e/
  ]),
  R.when((x) => x, parseInt),
  R.defaultTo(null)
)

export const cleanUpSubject = R.pipe(
  removeSold,
  removeSold,
  removeSellingPrefix,
  removePrice,
  trimSpecial,
  R.trim
)

export const processTopic = (topic) => {
  const { snapshots, guid, date, category } = topic
  const snapshot = findLastUnsoldSnapshot(snapshots) || snapshots[0]
  const { link, subject, message } = snapshot

  return {
    id: guid,
    timestamp: date,
    category,
    link,
    title: cleanUpSubject(subject),
    sold: lastSnapshotIsSold(snapshots),
    price: parsePrice(message)
  }
}

export const findLastUnsoldSnapshot = R.pipe(
  sortById,
  R.findLast(L.get(['subject', isNotSold]))
)
