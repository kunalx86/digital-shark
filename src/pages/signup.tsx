import { Signup } from "@components/Auth/Signup";
import { InferGetServerSidePropsType } from "next";
import { getProviders } from "next-auth/react";
import Head from "next/head";

export default function SignupPage({ providers }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <>
      <Head>
        <title>Digital Shark | Sign Up</title>
      </Head>
      <Signup providers={providers} />
    </>
  )
}

export async function getServerSideProps() {
  const providers = await getProviders()
  return {
    props: {
      providers
    }
  }
}