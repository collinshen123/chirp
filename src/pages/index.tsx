import { SignInButton, useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageLayout, } from "~/components/layout";
import { PostView } from "~/components/postview";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
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

  if (!user) return null;

  return (
    <div className="flex w-full gap-3 ">
      <div>
        <img src="/images/twitter-logo.png" alt="Twitter Logo" style={{ width: "3rem" }} />
      </div>
    
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
          if (e.key === "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isPosting}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20}/> 
        </div>
      )}
    </div>
  );
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

// create a PostMenu component that creates a menu bar on the left side of the PostView component

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      <div className="flex">
        <div className="flex-grow">
          <div className="flex border-b p-5">
            {!isSignedIn && (
              <div className="flex justify-center">
                <SignInButton />
              </div>
            )}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
        
      </div>
      
      </PageLayout>
    
  );
};
export default Home;