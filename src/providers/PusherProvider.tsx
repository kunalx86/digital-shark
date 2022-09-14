import { env } from "@env/client.mjs";
import Pusher, { PresenceChannel } from "pusher-js";
import { createContext, ReactNode, useEffect, useState } from "react";

const PusherContext = createContext<{
  pusherClient: Pusher | undefined,
  presenceChannel: PresenceChannel | undefined,
} | undefined>(undefined)

function createPusher(slug: string, user_id: string) {
  const pusherClient = new Pusher(env.NEXT_PUBLIC_PUSHER_APPID, {
    authEndpoint: "/api/pusher/auth-channel",
    auth: {
      headers: {
        user_id
      }
    }
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

  useEffect(() => {
    const pusherClient_ = createPusher(slug, id.toString())
    const presenceChannel_ = pusherClient_.subscribe(`presence-${slug}`) as PresenceChannel
    setPresenceChannel(presenceChannel_)
    setPusher(pusherClient_)
    return () => {
      pusherClient_.disconnect();
    }
  }, [slug, id]);

  return (
    <PusherContext.Provider value={{
      pusherClient,
      presenceChannel,
    }}>
      {children}
    </PusherContext.Provider>
  )
}

export { PusherProvider, PusherContext }