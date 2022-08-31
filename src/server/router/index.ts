// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { productRouter } from "./product";
import { topicRouter } from "./topic";
import { profileRouter } from "./profile";
import { auctionRouter } from "./auction";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("hello", {
    resolve() {
      return "Hello from TRPC"
    }
  })
  .merge("product.", productRouter)
  .merge("topic.", topicRouter)
  .merge("profile.", profileRouter)
  .merge("auction.", auctionRouter)

// export type definition of API
export type AppRouter = typeof appRouter;
