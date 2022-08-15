import { Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
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
