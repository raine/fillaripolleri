import * as R from 'ramda'
import * as L from 'partial.lenses'

const topicToItem = (t) => ({
  id: t.guid,
  timestamp: t.date,
  category: t.category,
  link: t.link
})

const remove = R.replace(R.__, '')
const removeSellingPrefix = remove(/^m:|^myydään?|^myynnissä/i)
const removeSold = remove(/^myyty( - |:)\s?/i)
const trimSpecial = remove(/^[\s!:_\-,]*|[!:_\-,]*$/)

const sortById = R.sortBy(L.get('id'))
const isSold = (str) => /myyty/i.test(str)
const isNotSold = R.complement(isSold)

const lastSnapshotIsSold = L.get([
  L.normalize(sortById),
  L.last,
  'subject',
  isSold
])

export const processTopic = (topic) => {
  const { snapshots, guid, date, category } = topic
  const snapshot = findLastUnsoldSnapshot(snapshots) || snapshots[0]
  const { link, subject } = snapshot

  return {
    id: guid,
    timestamp: date,
    category,
    link,
    title: R.pipe(
      removeSold,
      removeSellingPrefix,
      trimSpecial,
      R.trim
    )(subject),
    sold: lastSnapshotIsSold(snapshots)
  }
}

export const findLastUnsoldSnapshot = R.pipe(
  sortById,
  R.findLast(L.get(['subject', isNotSold]))
)
