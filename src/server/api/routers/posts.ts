import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.username, 
        imageUrl: user.imageUrl
    };
}

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client";

const addUserDataToPosts = async (posts: Post[]) => {
    const users = (
        await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorid),
            limit:100,
        })
    ).map(filterUserForClient);


    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorid);

        // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
        if (!author || !author.username)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Author for post not found",
            });

        return {
            post,
            author: {
                ...author,
                username: author?.username,
            },
        };
    });
        
}


// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true
});

export const postsRouter = createTRPCRouter({


    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const post = await ctx.prisma.post.findUnique({
                where: { id: input.id },
            });
            
            if (!post) throw new TRPCError({ code: "NOT_FOUND" });

            return (await addUserDataToPosts([post]))[0];
        }),
            
    


    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
            orderBy: [{ createdAt: "desc" }],
            
        });

        const users = (
            await clerkClient.users.getUserList({
                userId: posts.map((post) => post.authorid),
                limit:100,
            })
        ).map(filterUserForClient);


        return posts.map((post) => {
            const author = users.find((user) => user.id === post.authorid);

            // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
            if (!author || !author.username)
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Author for post not found",
                });

            return {
                post,
                author: {
                    ...author,
                    username: author?.username,
                },
            };
            
        });
        
  }),
  

  getPostsByUserId: publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(({ ctx, input }) =>
    ctx.prisma.post
      .findMany({
        where: {
          authorid: input.userId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
      })
      .then(addUserDataToPosts)
  ),


    


    create: privateProcedure
    .input(
        z.object({
            content: z.string().min(10, { message: "Must be 10 or more characters long" }).max(280, { message: "Must be 280 or fewer characters" }),
            // to only allow emojis to be posted, use this instead:
            // content: z.string().emoji().min(1).max(280),
        })
        
    )
    .mutation(async ({ ctx, input }) => {
        const authorid = ctx.userId;

        const { success } = await ratelimit.limit(authorid);

        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

        const post = await ctx.prisma.post.create({
            data: {
                authorid,
                content: input.content,
            },
        });

        return post;

    }),
});