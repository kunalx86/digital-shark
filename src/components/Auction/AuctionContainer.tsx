import { Stack, Flex, Heading, Image, Box, Textarea, Avatar, AvatarBadge, AvatarGroup } from "@chakra-ui/react";
import { usePusher } from "@hooks/pusher";
import { Auction, Product } from "@prisma/client";
import { Member } from "@providers/PusherProvider";

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
    </Flex>
  )
}

function OnlineUsers() {
  const { members } = usePusher()
  return (
    <Flex direction="column">
      Online Users:
      <AvatarGroup max={1}>
        {/* {Object.entries<Member>(members).map(([, member]) => <User key={member.id} info={member} />)} */}
        {members.map(member => <User key={member.id} info={member} />)}
      </AvatarGroup>
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
    // <GridItem ml={1} mr={1}>
    //   <Stack spacing={4}>
    //     <Avatar
    //       size="lg"
    //       rounded="full"
    //       pt={2}
    //       src={info.image}
    //       width="85px"
    //       height="85px"
    //     >
    //       <AvatarBadge borderColor="AppWorkspace" boxSize="1.5em">$10</AvatarBadge>
    //     </Avatar>
    //     <Text alignItems="center">
    //       {info.name}
    //     </Text>
    //   </Stack>
    // </GridItem>
    <Avatar
      name={info.name}
      src={info.image}
    >
      <AvatarBadge boxSize="1.5em">$10</AvatarBadge>
    </Avatar>
  )
}
