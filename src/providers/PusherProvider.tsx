import { env } from "@env/client.mjs";
import Pusher, { PresenceChannel } from "pusher-js";
import { createContext, ReactNode, useEffect, useState } from "react";

const PusherContext = createContext<{
  pusherClient: Pusher | undefined,
  presenceChannel: PresenceChannel | undefined,
  members: Map<string, any> | undefined
} | undefined>(undefined)

function createPusher(user_id: string) {
  const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_KEY, {
    authEndpoint: "/api/pusher/auth-channel",
    auth: {
      headers: {
        user_id
      }
    },
    cluster: "ap2",
    forceTLS: true
  })

  return pusherClient;
}

function PusherProvider({ slug, id, children }: {
  slug: string,
  id: number,
  children: ReactNode
}) {
  const [pusherClient, setPusher] = useState<Pusher>();
  const [presenceChannel, setPresenceChannel] = useState<PresenceChannel>();
  const [members, setMembers] = useState<Map<string, any>>()

  useEffect(() => {
    const pusherClient_ = createPusher(id.toString())
    const presenceChannel_ = pusherClient_.subscribe(`presence-${slug}`) as PresenceChannel
    setPresenceChannel(presenceChannel_)
    setPusher(pusherClient_)

    presenceChannel_.bind("pusher:subscription_succeeded", () => setMembers(presenceChannel_.members.members));
    presenceChannel_.bind("pusher:member_added", () => setMembers(presenceChannel_.members.members));
    presenceChannel_.bind("pusher:member_removed", () => setMembers(presenceChannel_.members.members));
    return () => {
      pusherClient_.disconnect();
    }
  }, [slug, id]);

  return (
    <PusherContext.Provider value={{
      pusherClient,
      presenceChannel,
      members
    }}>
      {children}
    </PusherContext.Provider>
  )
}

export { PusherProvider, PusherContext }