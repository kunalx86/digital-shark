import { pusherServer } from "@utils/pusher";
import { NextApiRequest, NextApiResponse } from "next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@server/db/client"
import dayjs from "dayjs";

interface AuthChannelApiRequest extends NextApiRequest {
  body: {
    socket_id: string
  }
}

export default async function pusherAuthChannelHandler(
  req: AuthChannelApiRequest,
  res: NextApiResponse
) {
  const { socket_id } = req.body;
  const { user_id } = req.headers;
  const session = await unstable_getServerSession(req, res, authOptions)

  if (!user_id || typeof user_id !== "string" || session === null || session.user === undefined) {
    return res.status(403).send("Not Authenticated")
  }

  const auth = pusherServer.authenticateUser(socket_id, {
    id: user_id,
    name: session.user.name
  })

  res.send(auth)
}