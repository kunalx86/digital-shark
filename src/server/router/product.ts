import { createProtectedRouter } from "./protected-router";
import * as z from "zod"
import { Tag } from "@chakra-ui/react";

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
    input: z.object({
      name: z.string().max(255, "Name cannot exceed 255 characters"),
      description: z.string(),
      image: z.string().url(),
      topics: z.array(z.object({
        tag: z.string()
      }))
    }),
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
          image
        }
      });
      return product;
    }
  })