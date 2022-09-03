import { createProtectedRouter } from "./protected-router";
import * as z from "zod"
import { createProductSchema } from "@schemas/product";
import { createRouter } from "./context";

/**
 * Create product
 * Get Products you own
 * Get Products you auctioned
 * Get Products you got in auction
 * Get Products you subscribed
 * Get Products of your tag
 */

const unAuthRouter = createRouter()
  .query("product-by-id", {
    input: z.number({
      required_error: "Product ID is needed"
    }),
    async resolve({ ctx, input }) {
      const product = await ctx.prisma.product.findUniqueOrThrow({
        where: {
          id: input
        },
        include: {
          auction: true,
          from: true,
          owner: true,
          to: true,
          topics: true,
          subscribedUsers: !(ctx.session === null || ctx.session === undefined)
        },
      })
      return product;
    }
  })

const authProductRouter = createProtectedRouter()
  .query("products", {
    input: z.object({
      subscribed: z.boolean()
    }),
    async resolve({ ctx, input }) {
      const products = await ctx.prisma.product.findMany({
        where: input.subscribed ? {
          subscribedUsers: {
            some: {
              id: ctx.session.user.id
            }
          }
        } : {
          owner: ctx.session.user,
        },
        include: {
          auction: true
        }
      })

      return products;
    }
  })
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
  .mutation("subscribe", {
    input: z.number({
      required_error: "Product ID is necessary"
    }),
    async resolve({ ctx, input }) {
      const p = await ctx.prisma.product.findUniqueOrThrow({
        where: {
          id: input
        },
        include: {
          subscribedUsers: true
        }
      })
      let includes = false;
      if (p.subscribedUsers.filter(user => user.id === ctx.session.user.id).length === 1) {
        includes = true;
      }
      await ctx.prisma.product.update({
        where: {
          id: input
        },
        data: {
          subscribedUsers: includes ? {
            disconnect: {
              id: ctx.session.user.id
            },
          } : {
            connect: {
              id: ctx.session.user.id
            }
          }
        },
        include: {
          subscribedUsers: true
        }
      });
      return !includes;
    }
  });

export const productRouter = createRouter()
  .merge(unAuthRouter)
  .merge(authProductRouter);