import * as R from 'ramda'
import * as L from 'partial.lenses'
import log from './logger'

const remove = R.replace(R.__, '')
const removeSellingPrefix = remove(/^m:|^myydään?|^myynnissä/i)
const removeSold = remove(/^myyty( - |:)?\s?/i)
const trimSpecial = remove(/^[\s!:_\-,]*|[!:_\-,]*$/g)

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

export const parsePrice = R.pipe(
  tryPatterns([
    /(?:Hintapyyntö|Hinta|Hp):?\s?(\d+)\s?(?:€|e|euroa|eur)?/,
    /(\d+),-\B/, // 7,-
    /(\d+)€/,
    // Match '2e' without matching '.2e' or 'f2e'
    /(\d+) euroa/,
    /(?<!\.|\w)(\d+)e/
  ]),
  R.when(x => x, parseInt),
  R.defaultTo(null)
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
    title: R.pipe(
      removeSold,
      removeSold,
      removeSellingPrefix,
      trimSpecial,
      R.trim
    )(subject),
    sold: lastSnapshotIsSold(snapshots),
    price: parsePrice(message)
  }
}

export const findLastUnsoldSnapshot = R.pipe(
  sortById,
  R.findLast(L.get(['subject', isNotSold]))
)
