import { pusherServer } from "@utils/pusher";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@server/db/client"
import dayjs from "dayjs";
import { redisClient } from "@utils/redis";
import { env } from "@env/server.mjs";

interface AuthChannelApiRequest extends NextApiRequest {
  body: {
    channel_name: `presence-${string}`,
    socket_id: string
  }
}

export default async function pusherAuthChannelHandler(
  req: AuthChannelApiRequest,
  res: NextApiResponse
) {
  const { channel_name, socket_id } = req.body;
  const { user_id } = req.headers;
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!user_id || typeof user_id !== "string" || session === null || session.user === undefined) {
    return res.status(403).send("Not Authenticated")
  }

  const channel = channel_name.split("-")[1];

  if (channel === undefined || channel === "") {
    return res.status(400).send("Bad channel name")
  }

  const auction = await prisma.auction.findUnique({
    where: {
      id: parseInt(channel, 10)
    }
  })

  if (auction === null) {
    return res.status(400).send(`No auction by the id of ${channel} exists`)
  }

  if (env.NODE_ENV === "production") {
    const diff = dayjs(auction.startTime).diff() < (-1000) * 10
    if (auction.sold !== null || !diff) {
      return res.status(400).send("Cannot join the auction")
    }
  }
  const status = await redisClient.get(`channel-${auction.id}`)
  const isRoom = status !== undefined && status === "true"
  if (!isRoom) {
    await Promise.all([
      redisClient.set(`channel-${auction.id}`, "true"),
      redisClient.rPush(`bid-${auction.id}`, `-1$${auction.basePrice}`)
    ])
  }

  const auth = pusherServer.authorizeChannel(socket_id, channel_name, {
    user_id,
    user_info: {
      id: session.user.id,
      name: session.user.name,
      image: session.user.image
    }
  })

  res.send(auth)
}