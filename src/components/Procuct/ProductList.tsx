import { Stack, Heading, Box, Spinner } from "@chakra-ui/react";
import { trpc } from "@utils/trpc";
import { Product } from "./Product";

export function ProductList({ subscribed = false }: {
  subscribed?: boolean
}) {
  const { isLoading, data: products } = trpc.useQuery(["product.products", { subscribed }])
  return (
  <Box
    maxW={{ base: '3xl', lg: '7xl' }}
    mx="auto"
    px={{ base: '4', md: '8', lg: '12' }}
    py={{ base: '6', md: '8', lg: '12' }}
  >
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      align={{ lg: 'flex-start' }}
      spacing={{ base: '8', md: '16' }}
    >
      <Stack spacing={{ base: '8', md: '10' }} flex="2">
        <Heading fontSize="2xl" fontWeight="extrabold">
          Products that you {subscribed ? "Subscribed" : "Own"}
        </Heading>
        <Stack spacing="6">
          {
            isLoading
            ? <Spinner />
            : products
            ? products?.map(product => 
              <Product key={product.id} product={product} />
            )
            : null
          } 
        </Stack>
      </Stack>
    </Stack>
  </Box>
  )
}