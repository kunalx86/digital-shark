import { Stack, Flex, Heading, Image, Text, Input, Button } from "@chakra-ui/react";
import { usePusher } from "@hooks/pusher";

export function AuctionContainer() {
  return (
    <Flex direction="column">
      <OnlineUsers />
    </Flex>
  )
}

function OnlineUsers() {
  const { members } = usePusher()
  return (
    <Flex direction="column">
      Online Users:
      {Object.entries(members || {}).map(([, member]) => <User key={member.id} info={member} />)}
   </Flex>
  )
}

function User({ info }: {
  info: any
}) {
  return (
    <Stack spacing={4}>
      <Image
        pt={2}
        src={info.image}
        alt={info.name}
        width="85px"
        height="85px"
      />
      <Heading alignItems="center">
        {info.name}
      </Heading>
    </Stack>
  )
}
