import { useContext, useEffect, useRef } from "react";
import { PusherContext } from "@providers/PusherProvider";

function usePusher() {
  const ctx = useContext(PusherContext)
  if (ctx === undefined)
    throw new Error("Pusher Provider undefined");
  return ctx;
}

function useSubscribeChannel<T>(event: string, callback: (data: T) => void) {
  const { presenceChannel } = usePusher();
  const ref = useRef(callback)

  // useEvent would have been more cleaner here! React plx fix
  useEffect(() => {
    ref.current = callback;
  }, [callback])

  useEffect(() => {
    const reference = (data: T) => {
      ref.current(data)
    }
    presenceChannel.bind(event, reference)
    return () => {
      presenceChannel?.unbind(event, reference)
    }
  }, [presenceChannel, event])
}

export { usePusher, useSubscribeChannel }