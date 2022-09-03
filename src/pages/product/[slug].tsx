import { Button, Flex, Heading, Image, Spinner, Text, useToast } from "@chakra-ui/react";
import Head from "next/head";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { trpc } from "@utils/trpc";
import { useRouter } from "next/router";

function ProductPage() {
  const session = useSession()
  const router = useRouter()
  const { data: product, isLoading } = trpc.useQuery(["product.product-by-id", parseInt(router.query.slug as string, 10)])
  let subscribed = product?.subscribedUsers?.filter(user => user.id === session.data?.user?.id).length === 1;
  const utils = trpc.useContext()
  const { mutate } = trpc.useMutation(["product.subscribe"], {
    onError(error, _, __) {
      toast({
        status: "error",
        description: error.message
      })
    },
    onSuccess(data, _, __) {
      let description = `Subscribed product ${product!.name} succesfully`
      subscribed = !data;
      if (!data) {
        description = `Unsubscribed product ${product!.name} succesfully` 
      }
      toast({
        status: "info",
        description
      })
      utils.invalidateQueries(["product.product-by-id"])
    }
  })
  const toast = useToast()
  if (isLoading) {
    return <Spinner />
  }
  if (product === null || product === undefined) {
    return (
      <Flex>
        <Heading>
          No such Product
        </Heading>
      </Flex>
    )
  }
  const date = dayjs(product.auction?.startTime).format("DD/MM/YYYY HH:mm")
  return (
    <>
      <Head>
        <title>Product {product.name}</title>
      </Head>
      <Flex align="center" direction="column">
        <Heading>
          {product.name}
        </Heading>
        <Image
          rounded="lg"
          maxW={["50%", "50%", "60%", "60%"]}
          maxH={["50%", "50%", "60%", "60%"]}
          src={product.image}
          alt={product.name}
        />
        {
          product.auction !== null ?
          product.auction.sold ?
            <Text>
              Product sold to {product.to?.name}
            </Text> 
          : <Text>
              <> For auction on {date}</>
            </Text>
          : null
        }
        {
          product.ownerId === session.data?.user?.id || 
          product.fromId === session.data?.user?.id ||
          product.toId === session.data?.user?.id
          ? null
          : <Button onClick={() => {
              mutate(product.id)
            }} variant="outline" disabled={session.status === "unauthenticated"}>
              {subscribed ? "Unsubscribe" : "Susbrcribe"}
            </Button>
        }
      </Flex>
    </>
  )
}

export default ProductPage;

// TODO: Figure out SSR with TRPC
// export async function getServerSideProps (ctx: GetServerSidePropsContext) {
//   const slug = ctx.query.slug as string;
//   const product = await prisma.product.findUnique({
//     where: {
//       id: parseInt(slug, 10)
//     },
//     include: {
//       auction: true,
//       from: true,
//       owner: true,
//       to: true,
//       topics: true
//     }
//   })
//   return {
//     props: {
//       product
//     }
//   }
// }