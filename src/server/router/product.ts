import { createProtectedRouter } from "./protected-router";

export const productRouter = createProtectedRouter()
  .query("getMyProducts", {
    async resolve({ ctx }) {
      const products = await ctx.prisma.product.findMany({
        where: {
          owner: ctx.session.user
        }
      });

      return products;
    }
  })