import { Stack, Flex, Heading, Image, Box, Textarea, Text, Grid, GridItem, Input, FormLabel, InputGroup, InputLeftAddon, Button, useToast, Spinner } from "@chakra-ui/react";
import { useCountDown } from "@hooks/countdown";
import { usePusher, useSubscribeChannel } from "@hooks/pusher";
import { Auction, Product } from "@prisma/client";
import { Member } from "@providers/PusherProvider";
import { trpc } from "@utils/trpc";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaRupeeSign } from "react-icons/fa";

type SubscribeBid = {
  bidPrice: number,
  bidderId: number,
  timerStart: number,
  timerEnd: number
};


export function AuctionContainer({ auction }: {
  auction: Auction & {
    product: Product
  }
}) {
  const toast = useToast();
  const [bid, setBid] = useState(0);
  const [bidOver, setBidOver] = useState(!!auction.sold);
  const { mutate } = trpc.useMutation("auction.bid-winner", {
    onSuccess(data, variables, context) {
      toast({
        status: "success",
        title: "Bidding Concluded",
        description: `${data.name} has been declared the winner with his bid of ${data.bid}`
      });
      setBidOver(true);
    },
  })

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
      {/* <BiddingView /> */}
      <OnlineUsers setBid={setBid} />
      <BidForm enabled={bidOver} bid={bid} setBid={setBid} auctionId={auction.id} />
      {bidOver ? <Text>The bidding is over. Thank you for participating in the bidding</Text> : null}
    </Flex>
  )
}

function TimerView({ seconds }: {
  seconds: number
}) {
  return (
    <Stack direction="row" spacing="2">
      <Text>
        Seconds: {seconds}
      </Text>
    </Stack>
  )
}

function BidForm({ auctionId, enabled, bid, setBid }: {
  auctionId: number,
  bid: number,
  enabled: boolean,
  setBid: Dispatch<SetStateAction<number>>
}) {
  const toast = useToast()
  const { mutate } = trpc.useMutation(["auction.bid"], {
    onError(error) {
      toast({
        status: "error",
        description: error.message,
        title: "Something went wrong"
      })
    },
  });
  const { data, isLoading } = trpc.useQuery(["profile.stats"]);
  const utils = trpc.useContext();
  const { mutate: mutateCoins } = trpc.useMutation("profile.give-coins", {
    onMutate(variables) {
      const oldData = utils.getQueryData(["profile.stats"]);
      utils.setQueryData(["profile.stats"], _ => [bid, oldData?.at(1) ?? -1, oldData?.at(2) ?? -1, oldData?.at(3) ?? -1]);
      return oldData;
    },
    onSuccess(data, variables, context) {
      utils.invalidateQueries(["profile.stats"]);
    },
  })

  if (isLoading || data === undefined) return <Spinner />
  return (
    <Flex direction="row" mt={2}>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (bid > data[0]) {
          toast({
            status: "error",
            render: _ => (
              <Box p={3} bg={"blue.500"} borderRadius={"md"}>
                <Text>You dont have enough coins! Want to buy more?</Text>
                <Button alignSelf={"center"} onClick={() => mutateCoins(bid - data[0] + 20)}>Get Coins! {bid - data[0] + 20}</Button>
              </Box>
            ),
            isClosable: true
          })
        }
        else {
          mutate({
            id: auctionId,
            price: bid
          });
          setBid(bid + 10);
        }
      }}>
        <InputGroup>
          <FormLabel mt="auto">Your Bid: </FormLabel>
          <InputLeftAddon>
            <FaRupeeSign />
          </InputLeftAddon>
          <Input
            name="bid"
            type="number"
            value={bid}
            disabled={enabled}
            w="inherit"
            onChange={(e) => setBid(Number(e.target.value))}
          />
        </InputGroup>
        <Button alignSelf="center" type="submit">Bid</Button>
      </form>
    </Flex>
  )
}

function OnlineUsers({ setBid }: {
  setBid: Dispatch<SetStateAction<number>>,
}) {
  const { members, auctionId, reorderMembers } = usePusher()
  const { data, isLoading, refetch } = trpc.useQuery(["auction.bid-status", auctionId])
  useSubscribeChannel<SubscribeBid>("new-bid", (bid) => {
    reorderMembers(bid.bidderId);
    refetch();
    setBid(bid.bidPrice + 10);
  });

  return (
    <Flex direction="column" mb={"6px"} p={"5px"}>
      Online Users:
      <Grid templateColumns={"repeat(2, 5fr)"}>
        {members.map(member => <User key={member.id} info={member} />)}
      </Grid>
      <Flex maxH="20%" direction="column">
        {
          isLoading
            ? <Spinner />
            : (data || []).map(bid => (
              <Text key={bid.timerStart}>
                Bid of {bid.price} by {bid.username}
              </Text>
            ))
        }
      </Flex>
    </Flex>
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
