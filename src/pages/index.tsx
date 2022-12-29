import { Box, Container, Flex, Heading, Spacer, Spinner, Text, Image, Grid, GridItem } from "@chakra-ui/react";
import { Product, User } from "@prisma/client";
import { trpc } from "@utils/trpc";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const { data: latestProducts, isLoading: isLoadingLatest } = trpc.useQuery(["product.latest-products"])
  const { data: biddingProducts, isLoading: isLoadingBidding } = trpc.useQuery(["product.latest-bidding-products"])

  return (
    <>
      <Head>
        <title>Digital Shark</title>
        <meta name="description" content="Digital Realtime Auction House" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxW={"7xl"}>
        <Flex direction={"column"} alignItems={"center"}>
          <Heading alignSelf={"center"}>
            <Text>
              Digital Shark
            </Text>
          </Heading>
          <Text>
            Your online bidding platform!
          </Text>
        </Flex>
        <Text>Latest products</Text>
        <Grid templateColumns={`repeat(5, 1fr)`}>
          {isLoadingLatest || latestProducts === undefined ? <Spinner /> : (
            latestProducts.map(product => <GridItem key={product.id}><ProductCard product={product} /></GridItem>)
          )}
        </Grid>
        <Text mt={5}>Products to soon go on Bidding</Text>
        <Grid templateColumns={`repeat(5, 1fr)`}>
          {isLoadingBidding || biddingProducts === undefined ? <Spinner /> : (
            biddingProducts.map(product => <GridItem key={product.id}><ProductCard product={product} /></GridItem>)
          )}
        </Grid>
        <Spacer h={"25vh"} />
        <Spacer h={"25vh"} />
      </Container>
    </>
  );
};

function ProductCard({ product }: {
  product: Product & {
    owner: User
  }
}) {
  const router = useRouter();
  return (
    <Box>
      <Image
        src={product.image}
        alt={product.name}
        h={"95%"}
        w={"95%"}
        onClick={() => router.push(`/product/${product.id}`)}
        borderRadius={"md"}
      />
      <Text>{product.name}</Text>
    </Box>
  )
}

export default Home;
