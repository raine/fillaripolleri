import pino from 'pino'

const destination = pino.destination(1)
const { name } = require('../package.json')

const logger = pino({ name }, destination)

export default logger
