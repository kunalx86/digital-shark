import { createProtectedRouter } from "./protected-router";
import * as z from "zod"

/**
 * Search Topic
 * Create Topic
 */
export const topicRouter = createProtectedRouter()
  .query("search", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const topics = await ctx.prisma.topic.findMany({
        where: {
          tag: {
            contains: input
          }
        }
      })

      return topics;
    }
  })
  .mutation("create", {
    input: z.string(),
    async resolve({ ctx, input }) {
      const topic = await ctx.prisma.topic.create({
        data: {
          tag: input
        }
      })

      return topic;
    }
  });