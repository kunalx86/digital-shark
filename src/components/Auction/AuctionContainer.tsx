import { Stack, Flex, Heading, Image, Box, Textarea, Text, Grid, GridItem, Input, FormLabel, InputGroup, InputLeftAddon, Button, useToast, Spinner } from "@chakra-ui/react";
import { usePusher, useSubscribeChannel } from "@hooks/pusher";
import { Auction, Product } from "@prisma/client";
import { Member } from "@providers/PusherProvider";
import { trpc } from "@utils/trpc";
import { useState } from "react";
import { FaDollarSign } from "react-icons/fa";

export function AuctionContainer({ auction }: {
  auction: Auction & {
    product: Product
  }
}) {
  return (
    <Flex direction="column" alignItems="center">
      <Heading>Auction of {auction.product.name}</Heading>
      <Image
        p={2}
        src={auction.product.image}
        alt={auction.product.name}
        height="40%"
        width="40%"
        rounded="lg"
      />
      <BiddingView />
      <OnlineUsers />
      <BidForm auctionId={auction.id} />
    </Flex>
  )
}

function BidForm({ auctionId }: {
  auctionId: number
}) {
  const toast = useToast()
  const [bid, setBid] = useState<number>(0)
  const { mutate } = trpc.useMutation(["auction.bid"], {
    onError(error) {
      toast({
        status: "error",
        description: error.message,
        title: "Something went wrong"
      })
    },
  })
  return (
    <Flex direction="row" mt={2}>
      <form onSubmit={(e) => {
        e.preventDefault();
        mutate({
          id: auctionId,
          price: bid
        })
        setBid(0);
      }}>
        <InputGroup>
          <FormLabel mt="auto">Your Bid: </FormLabel>
          <InputLeftAddon>
            <FaDollarSign />
          </InputLeftAddon>
          <Input
            name="bid" 
            type="number"
            value={bid}
            w="inherit"
            onChange={(e) => setBid(Number(e.target.value))}
          />
        </InputGroup>
        <Button alignSelf="center" type="submit">Bid</Button>
      </form>
    </Flex>
  )
}

function OnlineUsers() {
  const { members, auctionId } = usePusher()
  const { data, isLoading, refetch } = trpc.useQuery(["auction.bid-status", auctionId])
  useSubscribeChannel("new-bid", () => refetch());
  return (
    <Flex direction="column">
      Online Users:
      <Grid>
        {members.map(member => <User key={member.id} info={member} />)}
      </Grid>
      <Flex maxH="20%" direction="column">
      {
        isLoading
        ? <Spinner />
        : (data || []).map(bid => (
          <Text key={bid.timerStart}>
            Bid of {bid.price} by {bid.user}
          </Text>
        ))
      }
      </Flex>
   </Flex>
  )
}

function BiddingView() {
  return (
    <Stack direction="column">
      $10 by Kunal
      <BidLogs />
      {/* <Timer />
      <BidInput /> */}
    </Stack>
  )
}

function BidLogs() {
  return (
    <Box height="40%" width="max">
      Bidding Logs
      <Textarea value={''} onChange={() => null} />
    </Box>
  )
}

function User({ info }: {
  info: Member
}) {
  return (
    <GridItem ml={1} mr={1}>
      <Stack spacing={4}>
        <Image
          pt={2}
          src={info.image}
          rounded="lg"
          width="85px"
          height="85px"
        />
        <Text alignItems="center">
          {info.name}
        </Text>
      </Stack>
    </GridItem>
  )
}
