import { env } from "@env/server.mjs"
import { createClient } from "redis"

const redisClient = createClient({
  url: env.REDIS_URL
})

redisClient.connect()

redisClient.on("ready", () => console.log("Connected to REDIS"))
redisClient.on("error", (err) => console.error(err))

export { redisClient }