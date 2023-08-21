
import { NextPage } from "next";
import Head from "next/head";

import { api } from "~/utils/api";



const ProfilePage: NextPage = () => {



  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div> Profile View<div />

        </div>
      </main>
    </>
  );
}
export default ProfilePage;