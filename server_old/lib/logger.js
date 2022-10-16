import pino from 'pino'

const destination = pino.destination(1)
const { name } = require('../package.json')

const logger = pino({
  name,
  level: process.env.LOG_LEVEL || 'info'
}, destination)

export default logger
