import { createProtectedRouter } from "./protected-router";
import * as z from "zod"
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";

export const auctionRouter = createProtectedRouter()
  .mutation("auction-product", {
    input: z.object({
      startTime: z.string()
        .refine(dateTime => dateTime !== null || dateTime !== undefined || dateTime !== "", {
          message: "Date cannot be empty"
        })
        .refine(dateTime => {
          const utcDate = new Date(Date.parse(dateTime)).toUTCString().split("GMT")[0] as string;
          const date = new Date(Date.parse(utcDate) - Date.now())
          if (date.getFullYear() < 1970 || date.getUTCMinutes() < 10) {
            return false
          }
          return true
        }, {
          message: "Date should be atleast 10 minutes from now"
        }),
      timeZone: z.string({
        required_error: "Time Zone is needed"
      }),
      productId: z.number({
        required_error: "Product ID is needed"
      }),
      basePrice: z.number({
        required_error: "Base Price is needed"
      })
    }),
    async resolve({ ctx, input }) {
      const { startTime, timeZone, productId, basePrice } = input;
      await ctx.prisma.product.findFirstOrThrow({
        where: {
          id: productId,
          fromId: ctx.session.user.id,
          ownerId: ctx.session.user.id,
          toId: null,
          auction: null
        }
      })
      const auction = await ctx.prisma.auction.create({
        data: {
          startTime: new Date(startTime),
          timeZone,
          product: {
            connect: {
              id: productId
            }
          },
          basePrice
        },
        include: {
          product: true
        }
      })
      return auction;
    }
  })
  .mutation("mark-unsold", {
    input: z.number({
      required_error: "Auction ID is necessary"
    }),
    async resolve({ ctx, input }) {
      const auction = await ctx.prisma.auction.findFirstOrThrow({
        where: {
          id: input,
          sold: null,
        },
        include: {
          product: {
            include: {
              from: true
            }
          }
        }
      })
      const diff = dayjs(auction.startTime).diff() < (-1000) * 10 // This means more than 10 minutes have been passed since startTime
      if (!diff) throw new TRPCError({
        message: "Product Auction has not expired yet",
        code: "BAD_REQUEST"
      })
      return await ctx.prisma.auction.update({
        where: {
          id: auction.id
        },
        data: {
          sold: false,
          product: {
            update: {
              ownerId: auction.product.fromId,
              toId: auction.product.toId
            }
          }
        }
      });
    }
  })