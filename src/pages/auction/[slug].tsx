import { Flex, Spinner, Stack, Text } from "@chakra-ui/react"
import { Auction } from "@prisma/client"
import { trpc } from "@utils/trpc"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useCountDown } from "@hooks/countdown"
import { PusherProvider } from "@providers/PusherProvider"
import { useSession } from "next-auth/react"
import { AuctionContainer } from "@components/Auction/AuctionContainer"

function AuctionPage() {
  const router = useRouter()
  const slug = router.query.slug as string
  const { isLoading, data: auction } = trpc.useQuery(["auction.get", parseInt(slug, 10)])

  if (isLoading || auction === undefined) {
    return <Spinner />
  }

  return (
    <Flex direction="column">
      <CountDown auction={auction} />
    </Flex>
  )
}

function CountDown({ auction }: {
  auction: Auction
}) {
  const { expired, days, hours, minutes, seconds } = useCountDown(dayjs(auction.startTime).toDate().getTime())
  const { data, status } = useSession()

  if (status === "unauthenticated" || data === null || data.user === undefined) {
    return (
      <Flex>
        Please Login
      </Flex>
    )
  }

  // TODO: Remove in PROD
  if (expired || true) {
    return (
      <PusherProvider slug={auction.id.toString()} id={data.user.id}>
        <AuctionContainer />
      </PusherProvider>
    )
  }

  return (
    <Stack direction="row" spacing="2">
      <Text>
        Days: {days}
      </Text>
      <Text>
        Hours: {hours}
      </Text>
      <Text>
        Minutes: {minutes}
      </Text>
      <Text>
        Seconds: {seconds}
      </Text>
    </Stack>
  )
}

export default AuctionPage