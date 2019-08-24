import { createClient } from 'redis'
import { promisify } from 'util'

const client = createClient(process.env.REDIS_URL)
client.getAsync = promisify(client.get).bind(client),
client.setAsync = promisify(client.set).bind(client),
client.keysAsync = promisify(client.keys).bind(client)

module.exports = client