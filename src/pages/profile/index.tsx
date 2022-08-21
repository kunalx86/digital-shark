import { Button, Flex, Spinner } from "@chakra-ui/react"
import { ProductForm } from "@components/Procuct/ProductForm"
import { authOptions } from "@pages/api/auth/[...nextauth]"
import { trpc } from "@utils/trpc"
import { GetServerSideProps } from "next"
import { unstable_getServerSession } from "next-auth"
import { useSession } from "next-auth/react"
import Head from "next/head"
import { useState } from "react"

function Profile() {
  const { data } = useSession()
  const [showForm, setShowForm] = useState(false)
  const { data: products, isLoading } = trpc.useQuery(["product.owner", { auction: false }])
  return (
    <>
      <Head>
        <title>Profile {`| ${data?.user?.name || ""}`}</title>
      </Head>
      <p>{data?.user?.name}</p>
      <Flex maxW="100%" w="inherit" direction="column">
        {isLoading && <Spinner />}
        {products?.map(product => (
          <div key={product.id}>
            {product.name}
          </div>
        ))}
        {showForm && <ProductForm />}
        <Button onClick={() => setShowForm(_s => !_s)}>
          {showForm ? "Close Form" : "Create Product"}
        </Button>
      </Flex>
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