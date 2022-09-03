import { Flex, Stack, Heading, Box, Image, Text, Button, Input, InputGroup, InputRightElement, FormControl, FormLabel, FormErrorMessage, useToast, InputLeftElement } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Auction, Product as _Product } from "@prisma/client";
import { trpc } from "@utils/trpc";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaClock, FaRupeeSign } from "react-icons/fa";
import { z } from "zod";


export function Product({ product }: {
  product: _Product & {
    auction: Auction | null
  }
}) {
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()
  const date = dayjs(product.auction?.startTime).format('DD-MM-YYYY HH:mm')
  return (
    <Flex direction="row" align="center">
      <Stack direction="row">
        <Image
          onClick={() => router.push(`/product/${product.id}`)} 
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
          <Flex position="relative" align="center" direction="column">
            {
              product.toId === null
              ? product.auction === null
              ? <Button onClick={() => setShowForm(s => !s)} mt={2} variant="outline">Auction Product</Button>
              : <Text><>Product will be auctioned on {date}</></Text>
              : null
            }
            {
              showForm
              ? <AuctionForm disableForm={() => setShowForm(false)} id={product.id} />
              : null
            }
          </Flex>
        </Box>
      </Stack>
    </Flex>
  )
}

type FormData = {
  startTime: string,
  basePrice: string
}

const createAuctionSchema = z.object({
  startTime: z.string()
    .refine(dateTime => dateTime !== null || dateTime !== undefined || dateTime !== "", {
      message: "Date cannot be empty"
    })
    .refine(dateTime => {
      const utcDate = new Date(Date.parse(dateTime)).toUTCString().split("GMT")[0] as string;
      const date = new Date(Date.parse(utcDate) - Date.now())
      if (date.getFullYear() < 1970 || date.getMinutes() < 10) {
        return false
      }
      return true
    }, {
      message: "Date should be atleast 10 minutes from now"
    }),
  basePrice: z.string({
      required_error: "Base Price is needed"
    })
    .regex(/^\d+$/, "Base Price should be a number")
})

function AuctionForm({ id, disableForm }: {
  id: number,
  disableForm: () => void
}) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(createAuctionSchema)
  });
  const utils = trpc.useContext()
  const toast = useToast()
  const { mutateAsync } = trpc.useMutation(["auction.auction-product"], {
    onError(error, _, __) {
      toast({
        status: "error",
        title: "Product auction failed",
        description: error.message
      })
    },
    onSuccess(data, _, __) {
      toast({
        status: "success",
        title: "Product auction successful",
        description: `Product with name ${data.product.name} will be auctioned on ${data.startTime}`
      })
      utils.invalidateQueries(["product.products"])
      reset()
      disableForm()
    },
  })
  return (
    <Box w="auto">
    <form onSubmit={handleSubmit(async ({ startTime, basePrice }) => {
      await mutateAsync({
        productId: id,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        startTime,
        basePrice: parseInt(basePrice, 10)
      }) 
    })}>
      <FormControl p={2} isInvalid={!!errors.startTime}>
        <FormLabel>Start Time of Auction</FormLabel>
        <InputGroup>
          <Input
            id="startDate"
            type="datetime-local"
            {...register("startTime")}
          />
          <InputRightElement>
            <FaClock />
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>
          {errors.startTime ? errors.startTime.message : null}
        </FormErrorMessage>
      </FormControl>
      <FormControl p={2} isInvalid={!!errors.basePrice}>
        <FormLabel>Base Price</FormLabel>
        <InputGroup>
          <InputLeftElement>
            <FaRupeeSign />
          </InputLeftElement>
          <Input
            id="basePrice"
            type="number"
            {...register("basePrice")}
          />
        </InputGroup>
        <FormErrorMessage>
          {errors.basePrice ? errors.basePrice.message : null}
        </FormErrorMessage>
      </FormControl>
      <Button type="submit" variant="solid">Auction</Button>
    </form>
    </Box>
  )
}