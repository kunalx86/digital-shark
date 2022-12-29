import { createProtectedRouter } from "./protected-router";
import * as z from "zod"
import dayjs from "dayjs";
import { TRPCError } from "@trpc/server";
import { redisClient } from "@utils/redis";
import { pusherServer } from "@utils/pusher";

export const auctionRouter = createProtectedRouter()
  .mutation("auction-product", {
    input: z.object({
      startTime: z.string()
        .refine(dateTime => dateTime !== null || dateTime !== undefined || dateTime !== "", {
          message: "Date cannot be empty"
        })
        .refine(dateTime => {
          const diff = dayjs(dateTime).diff(dayjs(), "minutes", true)
          return diff > 10
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
  .mutation("bid", {
    input: z.object({
      price: z.number({
        required_error: "Base Price is needed"
      }),
      id: z.number({
        required_error: "Auction ID is needed"
      })
    }),
    async resolve({ ctx, input }) {
      // TODO: Add check to ensure current owner cannot bid
      const auction = await ctx.prisma.auction.findFirstOrThrow({
        where: {
          id: input.id,
          sold: null
        }
      })

      const status = await redisClient.get(`channel-${auction.id}`)
      const isRoom = status !== undefined && status === "true"

      if (!isRoom) {
        throw new TRPCError({
          message: "Not allowed to bid here",
          code: "BAD_REQUEST"
        })
      }

      const result = await redisClient.lIndex(`bid-${auction.id}`, -1) ?? ""
      const [_, topBidder, topPrice] = result?.split("$").map(num => parseInt(num, 10));

      if (topPrice && topPrice >= input.price) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Bid higher!"
        })
      }

      if (topBidder && topBidder === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot bid again!"
        })
      }

      const timerStart = dayjs().add(5, "seconds").toDate().getTime()
      const timerEnd = dayjs().add(15, "seconds").toDate().getTime()

      await redisClient.rPush(`bid-${auction.id}`, `${ctx.session.user.name}$${ctx.session.user.id}$${input.price}$${timerStart}$${timerEnd}`)

      await pusherServer.trigger(`presence-${auction.id}`, "new-bid", {
        bidPrice: input.price,
        bidderId: ctx.session.user.id,
        timerStart,
        timerEnd
      })
    }
  })
  .query("bid-status", {
    input: z.number({
      required_error: "Auction ID is necessary"
    }),
    async resolve({ input }) {
      const res = await redisClient.lRange(`bid-${input}`, 1, -1);
      console.log(res)
      return redisClient.lRange(`bid-${input}`, 1, -1)
        .then(bids => bids.map(bid => bid.split("$")) as [string, string, string, string, string][])
        .then(bids => bids.map(([username, user, price, timerStart, timerEnd]) => ({
          username: username ?? "Bob",
          user,
          price,
          timerStart,
          timerEnd
        })))
    }
  })
  .query("get", {
    input: z.number({
      required_error: "Auction ID is required"
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.auction.findUniqueOrThrow({
        where: {
          id: input
        },
        include: {
          product: true
        }
      })
    }
  })
  .mutation("bid-winner", {
    input: z.number({
      required_error: "Auction ID is necessary"
    }),
    async resolve({ ctx, input }) {
      const res = await redisClient.lIndex(`bid-${input}`, -1);
      const [_, user, price, __, ___] = res?.split("$") as [string, string, string, string, string];
      await ctx.prisma.auction.findFirstOrThrow({
        where: {
          id: input,
          sold: null,
        }
      });
      const auction = await ctx.prisma.auction.update({
        where: {
          id: input
        },
        data: {
          highestBid: parseInt(price),
          highestBidder: {
            connect: {
              id: parseInt(user)
            }
          },
          sold: true
        }
      });

      const winnerU = await ctx.prisma.user.findUniqueOrThrow({
        where: {
          id: parseInt(user)
        }
      });

      if (winnerU.coins < parseInt(price)) {
        throw new TRPCError({
          message: "Not enough balance",
          code: "BAD_REQUEST"
        })
      }

      await ctx.prisma.product.update({
        where: {
          id: auction.productId
        },
        data: {
          to: {
            connect: {
              id: parseInt(user)
            }
          },
          owner: {
            connect: {
              id: parseInt(user)
            }
          },
        }
      });

      console.log("----------")
      console.log(winnerU.coins, price)
      console.log("----------")

      const winner = await ctx.prisma.user.update({
        where: {
          id: parseInt(user)
        },
        data: {
          coins: {
            decrement: parseInt(price)
          }
        }
      });
      return {
        ...winner,
        bid: price
      };
    }
  })