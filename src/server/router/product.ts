import { createProtectedRouter } from "./protected-router";
import * as z from "zod"
import { Tag } from "@chakra-ui/react";
import { createProductSchema } from "@schemas/product";

/**
 * Create product
 * Get Products you own
 * Get Products you auctioned
 * Get Products you got in auction
 * Get Products you subscribed
 * Get Products of your tag
 */
export const productRouter = createProtectedRouter()
  .query("owner", {
    input: z.object({
      auction: z.boolean().default(false)
    }),
    async resolve({ ctx, input }) {
      const products = await ctx.prisma.product.findMany({
        where: {
          owner: ctx.session.user,
          to: input.auction ? ctx.session.user : undefined
        }
      })

      return products;
    }
  })
  // TODO: Fix schema
  .mutation("create", {
    input: createProductSchema,
    async resolve({ ctx, input }) {
      const { name, description, topics, image } = input;
      const product = await ctx.prisma.product.create({
        data: {
          name,
          description,
          topics: {
            connectOrCreate: topics.map(topic => ({
              create: topic,
              where: topic
            }))
          },
          fromId: ctx.session.user.id,
          ownerId: ctx.session.user.id,
          image: image as string
        }
      });
      return product;
    }
  })