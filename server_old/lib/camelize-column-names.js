import camelCase from 'lodash.camelcase'

// Copied with minor changes from
// https://github.com/vitaly-t/pg-promise/issues/78

export default function camelizeColumnNames(data) {
  const template = data[0]
  for (const prop in template) {
    const camel = camelCase(prop)
    if (!(camel in template)) {
      for (let i = 0; i < data.length; i++) {
        const d = data[i]
        d[camel] = d[prop]
        delete d[prop]
      }
    }
  }
}
