import { Flex } from "@chakra-ui/react"
import { useRouter } from "next/router"

function AuctionPage() {
  const router = useRouter()
  const slug = router.query.slug as string

  return (
    <Flex direction="column">
      Auction page for {slug}
    </Flex>
  )
}

export default AuctionPage