import { authOptions } from "@pages/api/auth/[...nextauth]"
import { GetServerSideProps } from "next"
import { unstable_getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import Head from "next/head"

function Profile() {
  const { data } = useSession()
  return (
    <>
      <Head>
        <title>Profile {`| ${data?.user?.name || ""}`}</title>
      </Head>
      <p>{data?.user?.name}</p>
    </>
  )
}

export default Profile

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: {
        destination: "/signup?next=/profile",
        statusCode: 301
      }
    }
  }
  return {
    props: {
    }
  }
}