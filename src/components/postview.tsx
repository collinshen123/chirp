
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3 p-4 border-b">
      <Image 
        src={author.imageUrl} 
        className="h-6 w-6 rounded-full"
        alt={`@${author.username}'s profile picture`}
        width={56}
        height={56}
      />
      
      <div className="flex flex-col">
        <div className="flex gap-1 text-black items-center">
          <Link href={`/@${author.username}`}>
            <span className="font-bold hover:underline  transition">{`@${author.username}`}</span>
          </Link>
          <img
            src="/images/twitter-verified.png"
            alt="Twitter Verified symbol"
            style={{ width: "1.5rem" }}
          />
          <Link href={`/post/${post.id}`}>
            <span className="text-slate-400 hover:underline hover:text-blue-500 transition">{`· ${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>
        <div style={{ height: "8px" }} /> {/* Add blank space */}
        <span className="text-slate-600">{post.content}</span>
        <div style={{ height: "16px" }} /> {/* Add blank space */}
      </div>
    </div>
  );
};

