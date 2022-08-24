import { Flex, Stack, Heading, Box, Image, Text, Button } from "@chakra-ui/react";
import { Product } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function Product({ product }: {
  product: Product
}) {
  const [showForm, setShowForm] = useState(false)
  return (
    <Flex direction="row" align="center">
      <Stack direction="row">
        <Image
          rounded="lg"
          maxW={["50%", "50%", "60%", "60%"]}
          maxH={["50%", "50%", "60%", "60%"]}
          src={product.image}
          alt={product.name}
        />
        <Box>
          <Heading size="lg">
            {product.name}
          </Heading>
          <Text>
            {product.description}
          </Text>
          {
            product.toId === null
            ? <Button onClick={() => setShowForm(s => !s)} mt={2} variant="outline">Auction Product</Button>
            : null
          }
          {
            showForm
            ? <AuctionForm id={product.id} />
            : null
          }
        </Box>
      </Stack>
    </Flex>
  )
}

type FormData = {
  startDate: Date,
  timeZone: string
}

function AuctionForm({  }: {
  id: number
}) {
  const {} = useForm<FormData>();
  return (
    <form>
      
    </form>
  )
}