import * as R from 'ramda'

const remove = R.replace(R.__, '')

const removeSellingAbbr = remove(/^M:\s?/)

const processItem = (item) =>
  R.assoc('title', removeSellingAbbr(item.title), item)

export default processItem
