import { createProtectedRouter } from "./protected-router";
import * as z from "zod"

export const profileRouter = createProtectedRouter()
  .query("stats", {
   async resolve({ ctx }) {
      const [{ coins }, ...result] = await Promise.all([
        ctx.prisma.user.findUniqueOrThrow({
          where: {
            id: ctx.session.user.id
          },
          select: {
            coins: true
          }
        }),
        ctx.prisma.product.count({
          where: {
            ownerId: ctx.session.user.id
          }
        }),
        ctx.prisma.product.count({
          where: {
            fromId: ctx.session.user.id,
            NOT: {
              ownerId: ctx.session.user.id
            }
          }
        }),
        ctx.prisma.product.count({
          where: {
            ownerId: ctx.session.user.id,
            NOT: {
              fromId: ctx.session.user.id 
            }
          }
        }),
      ]);

      return [coins, ...result]
    }
  })
  .mutation("give-coins", {
    input: z.number().default(400),
    async resolve({ ctx, input }) {
      const { coins } = await ctx.prisma.user.update({
        where: {
          id: ctx.session.user.id
        },
        data: {
          coins: {
            increment: input
          }
        },
        select: {
          coins: true
        }
      })
      return coins;
    }
  })