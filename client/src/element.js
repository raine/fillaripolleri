import * as K from 'kefir'

const mutationsIn = (element) =>
  K.stream((emitter) => {
    const observer = new MutationObserver(() => {
      emitter.emit()
    })

    observer.observe(element, {
      subtree: true,
      attributes: true,
      characterData: true,
      childList: true
    })

    return () => observer.disconnect()
  }).throttle(0)

const propOf = (prop) => (element) => {
  const getProp = () => element[prop]
  return mutationsIn(element)
    .map(getProp)
    .toProperty(getProp)
    .skipDuplicates(Object.is)
}

export const offsetHeight = propOf('offsetHeight')
