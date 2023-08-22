
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";



const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  console.log(username);

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
      </PageLayout>
    </>
  );
};





import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import superjson from 'superjson';
import { PageLayout } from "~/components/layout";
import { IMAGES_MANIFEST } from "next/dist/shared/lib/constants";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson,
  });

  const slug = context.params?.slug as string;

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

