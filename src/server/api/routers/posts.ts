import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.username, 
        profileImageUrl: user.profileImageUrl,
    };
}

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 5 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true
});

export const postsRouter = createTRPCRouter({
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

    create: privateProcedure
    .input(
        z.object({
            content: z.string().min(1).max(280),
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