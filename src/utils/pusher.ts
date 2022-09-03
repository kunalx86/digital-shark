import { env } from "@env/server.mjs"
import Pusher from "pusher"

export const pusherServer = new Pusher({
  appId: env.PUSHER_APPID,
  key: env.PUSHER_KEY,
  secret: env.PUSHER_SECRET,
  cluster: "ap2",
  useTLS: true
})