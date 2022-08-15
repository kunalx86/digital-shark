import { Flex } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  // const { data } = trpc.useQuery(["hello"])
  return (
    <>
      <Head>
        <title>Digital Shark</title>
        <meta name="description" content="Digital Realtime Auction House" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      Index Page
    </>
  );
};

export default Home;
