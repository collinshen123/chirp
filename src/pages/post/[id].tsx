
import { NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";



const SinglePostPage: NextPage = () => {



  return (
    <>
      <Head>
        <title>Post</title>
      </Head>
      <main className="flex h-screen justify-center">
        <div> Post View<div />

        </div>
      </main>
    </>
  );
}
export default SinglePostPage;