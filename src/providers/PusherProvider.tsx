import { env } from "@env/client.mjs";
import { useRouter } from "next/router";
import Pusher, { PresenceChannel } from "pusher-js";
import { createContext, ReactNode, useEffect, useMemo, useState } from "react";

export type Member = {
  id: number,
  image: string,
  name: string
}

const PusherContext = createContext<{
  pusherClient: Pusher,
  presenceChannel: PresenceChannel,
  members: Array<Member>, // Object.entries won't cooperate with Map<string, T>
  auctionId: number
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
  const [members, setMembers] = useState<Array<Member>>([])
  const router = useRouter()
  const auctionId = useMemo(() => Number(router.query.slug as string), []);

  useEffect(() => {
    const pusherClient_ = createPusher(id.toString())
    const presenceChannel_ = pusherClient_.subscribe(`presence-${slug}`) as PresenceChannel
    setPresenceChannel(presenceChannel_)
    setPusher(pusherClient_)

    const updateMembers = () => {
      setMembers(Object.entries(presenceChannel_.members.members as { [s: string]: Member }).map(([, member]: [string, Member]) => member));
    }

    presenceChannel_.bind("pusher:subscription_succeeded", updateMembers);
    presenceChannel_.bind("pusher:member_added", updateMembers);
    presenceChannel_.bind("pusher:member_removed", updateMembers);
    return () => {
      pusherClient_.disconnect();
    }
  }, [slug, id]);

  if (pusherClient === undefined || presenceChannel === undefined || members === undefined) return null;

  return (
    <PusherContext.Provider value={{
      pusherClient,
      presenceChannel,
      members,
      auctionId
    }}>
      {children}
    </PusherContext.Provider>
  )
}

export { PusherProvider, PusherContext }