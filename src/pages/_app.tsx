// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "@server/router";
import type { AppType } from "next/dist/shared/lib/utils";
import superjson from "superjson";
import { SessionProvider, useSession } from "next-auth/react";
import "../styles/globals.css";
import { ChakraProvider, Spinner } from "@chakra-ui/react";
import Layout from "@components/Layout";
import theme from "src/theme"
import { ReactNode } from "react";
import { ReactQueryDevtools } from "react-query/devtools"
import { env } from "process";

function AuthLoader({ children }: { children: ReactNode }) {
  const { status } = useSession();
  if (status === "loading") {
    return <Spinner m="auto" />
  } else {
    return <>{children}</>
  }
}

const MyApp: AppType = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <SessionProvider session={session}>
        <Layout>
          <AuthLoader>
            <Component {...pageProps} />
          </AuthLoader>
          <ReactQueryDevtools initialIsOpen={false} />
        </Layout>
      </SessionProvider>
    </ChakraProvider>
  );
};

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
})(MyApp);
