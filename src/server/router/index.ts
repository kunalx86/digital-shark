// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

export const appRouter = createRouter()
  .transformer(superjson)
  .query("hello", {
    resolve() {
      return "Hello from TRPC"
    }
  })

// export type definition of API
export type AppRouter = typeof appRouter;
