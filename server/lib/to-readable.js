import stream from 'stream'

export default function toReadable(classicStream) {
  const readableStream = new stream.Readable({ objectMode: true })

  classicStream.on('data', (data) => {
    readableStream.push(data)
  })

  classicStream.on('end', () => {
    readableStream.push(null)
  })

  readableStream._read = () => {}
  return readableStream
}
