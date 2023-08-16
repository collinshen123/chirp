import type { User } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { z } from "zod";

const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.username, 
        profileImageUrl: user.profileImageUrl,
    };
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
    });

    const users = (
        await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorid),
            limit:100,
        })
    ).map(filterUserForClient);


    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorid);

        if (!author || !author.username)
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Author for post not found",
            });

        return {
            post,
            author: {
                ...author,
                username: author.username,
            },
        };
        
    });
        
  }),
});