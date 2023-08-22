
import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSHelper } from "~/server/helpers/ssHelper";




const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {

  const { data } = api.posts.getById.useQuery({ id });

  if (!data) return <div>Something went wrong</div>;
  return (
    <>
      <Head>
      <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView{...data} />
      </PageLayout>
    </>
  );
};







export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSHelper();

  const id = context.params?.id;

  if (typeof id !== 'string') throw new Error('no id');


  await ssg.posts.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id, 
    },
  };
};

export const getStaticPaths = () => {

  return {paths: [], fallback: "blocking"};
};







export default SinglePostPage; 

