const { env } = process
const config = {
  DATABASE_URL: env.DATABASE_URL,
  PORT: env.PORT ? parseInt(env.PORT) : undefined
}

for (const k in config) {
  if (config[k] === undefined) {
    throw new Error(`${k} not defined in env`)
  }
}

export default config
