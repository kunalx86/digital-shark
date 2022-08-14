import { trpc } from "@utils/trpc";
import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  const { data } = trpc.useQuery(["hello"])
  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <h1>
          Create <span>T3</span> App
        </h1>

        <div>
          <h3>This stack uses:</h3>
          <ul>
            <li>
              <a href="https://nextjs.org" target="_blank" rel="noreferrer">
                Next.js
              </a>
            </li>
            <li>
              <a href="https://trpc.io" target="_blank" rel="noreferrer">
                tRPC
              </a>
            </li>
            <li>
              <a
                href="https://typescriptlang.org"
                target="_blank"
                rel="noreferrer"
              >
                TypeScript
              </a>
            </li>
          </ul>
        </div>
        {data && <div>{data}</div>}
      </div>
    </>
  );
};

export default Home;
