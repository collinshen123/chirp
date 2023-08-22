
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSHelper } from "~/server/helpers/ssHelper";


const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};


const ProfilePage: NextPage<{ username: string }> = ({ username }) => {

  const { data } = api.profile.getUserByUsername.useQuery({ username});

  if (!data) return <div>Something went wrong</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
          <div className="relative h-36  bg-slate-500">
            <img
              src={data.imageUrl}
              alt={`${data.username ?? ""}'s profile picture`}
              width={120}
              height={120}
              className="-mb-[60px] absolute bottom-0 left-0  ml-8 border-4 border-white rounded-full"
            />
          
        </div>
        <div className="h-[80px]"></div>
        <div className="p-6 text-xl font-bold" >@{data.username}</div>
        <div className="w-full border-b border-slate-300" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};







export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSHelper();

  const slug = context.params?.slug;

  if (typeof slug !== 'string') throw new Error('no slug');

  const username = slug.replace("@", "");


  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username, // Use the fetched username
    },
    revalidate: 1,
  };
};

export const getStaticPaths = () => {

  return {paths: [], fallback: "blocking"};
};







export default ProfilePage; 

