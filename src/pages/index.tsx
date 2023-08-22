import { SignInButton, useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import Head from "next/head";
// import Link from "next/link";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { LOADIPHLPAPI } from "dns";
import Link from "next/link";
dayjs.extend(relativeTime);


const CreatePostWizard = () => {

  const { user } = useUser();

  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Post must be between 10 and 280 characters.");
      }


    },
  });

  console.log(user);

  if (!user) return null;

  return (
  <div className="flex w-full gap-3 ">
    <Image
      src={user.imageUrl}
      alt="Profile image"
      className="h-10 w-10 rounded-full"
      width={56}
      height={56}
    />
    <input 
      placeholder="Post something!" 
      className="grow bg-transparant outline-none" 
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}

      onKeyDown={(e) => {
        if (e.key === "Enter") {;
          e.preventDefault();
          if (input != "") {
            mutate({content: input});
          }
        }
      }}

      disabled={isPosting}
    /> 
    {input != "" && !isPosting && (
      <button onClick={() => mutate({content: input })}>Post</button>
    )}
    {isPosting && (
      <div className="flex items-center justify-center">
        <LoadingSpinner size={20}/> 
      </div>
    )}
  </div>
  );
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
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
        <div className="flex gap-1 text-slate-600">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          <Link href={'/post/${post.id}'}> <span className=" text-slate-400">{`· ${dayjs(post.createdAt).fromNow()}`}</span></Link>
        </div>
        <span className="text-black"> {post.content} </span>
      </div>
      
    </div>
  )

}

const Feed = () => {
  const {data, isLoading: postsLoading} = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage />

  if (!data) return <div> Something went wrong</div>

  return(
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id}/>
      ))}
    </div>
  )

}

const Home: NextPage = () => {
  const {isLoaded: userLoaded, isSignedIn} = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;




  return (
      
      <main className="flex h-screen justify-center">
        <div className="w-full border-x md:max-w-2xl">
          <div className="flex border-b p-4">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
              )}
            {isSignedIn && < CreatePostWizard/>}
          </div>
          <Feed />

        </div>
      </main>
  );
}
export default Home;