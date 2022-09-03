import { Flex, Tab, Image, TabList, TabPanel, TabPanels, Text, Tabs, useColorModeValue, Box, Spinner } from "@chakra-ui/react"
import { ProductForm } from "@components/Procuct/ProductForm"
import { ProductList } from "@components/Procuct/ProductList"
import { authOptions } from "@pages/api/auth/[...nextauth]"
import { trpc } from "@utils/trpc"
import { GetServerSideProps } from "next"
import { unstable_getServerSession, User } from "next-auth"
import { useSession } from "next-auth/react"
import Head from "next/head"

function UserCard({ user }: {
  user: User
}) {
  const { isLoading, data } = trpc.useQuery(["profile.stats"])
  return (
    <Flex
      h='365px'
      w={{ base: "350px", md: "375px" }}
      alignItems='center'
      direction='column'
      mb={3}
    >
      <Box
        w='100%'
        h='200px'
        borderRadius='lg'
        bgGradient='linear(to-l, #7928CA, #FF0080)'
      />
      <Flex flexDirection='column' mb='30px'>
        <Image
          src={user.image || ""}
          border='5px'
          mx='auto'
          width='80px'
          height='80px'
          mt='-38px'
          borderRadius='50%'
          alt={user.name || ""}
        />
        <Text
          fontWeight='600'
          textAlign='center'
          fontSize='xl'>
            {user.name}
        </Text>
      </Flex>
      <Flex justify='space-between' w='100%' px='36px'>
        {
          isLoading
          ? <Spinner />
          :
          <>
            <Flex flexDirection='column'>
              <Text
                fontWeight='600'
                fontSize='xl'
                textAlign='center'>
                {data?.at(0)}
              </Text>
              <Text align="center" fontWeight='500'>
                Products Owned
              </Text>
            </Flex>
            <Flex flexDirection='column'>
              <Text
                fontWeight='600'
                fontSize='xl'
                textAlign='center'
              >
                {data?.at(1)}
              </Text>
              <Text align="center" fontWeight='500'>
                Products Auctioned
              </Text>
            </Flex>
            <Flex flexDirection='column'>
              <Text
                fontWeight='600'
                fontSize='xl'
                textAlign='center'
              >
                {data?.at(1)}
              </Text>
              <Text align="center" fontWeight='500'>
                Products won
              </Text>
            </Flex>
          </>
        }
      </Flex>
    </Flex>
  )
}

function Profile() {
  const { data } = useSession()
  return (
    <>
      <Head>
        <title>Profile {`| ${data?.user?.name || ""}`}</title>
      </Head>
      <UserCard user={data?.user!} />
      <Flex mt={4} maxW="100%" w="inherit" direction="column">
        <Tabs align="center" variant="line">
          <TabList>
            <Tab p={1}>Your Products</Tab>
            <Tab p={1}>Products on Auction</Tab>
            <Tab p={1}>Subscribed Products</Tab>
            <Tab p={1}>Create Products</Tab>
          </TabList>
          <TabPanels>
            <TabPanel><ProductList /></TabPanel>
            <TabPanel>Your Product</TabPanel>
            <TabPanel><ProductList subscribed /></TabPanel>
            <TabPanel><ProductForm /></TabPanel>
          </TabPanels>
        </Tabs>
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