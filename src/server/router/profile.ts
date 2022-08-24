import { createProtectedRouter } from "./protected-router";

export const profileRouter = createProtectedRouter()
  .query("stats", {
   async resolve({ ctx }) {
      const results = await Promise.all([
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
        })
      ]);

      return results
    }
  })