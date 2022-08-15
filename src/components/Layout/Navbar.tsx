import { Button, Box, Container, HStack, useColorModeValue, Spinner, Avatar, Spacer, useColorMode } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaMoon, FaSun } from "react-icons/fa";

export function Navbar() {
  const { data, status } = useSession()
  const { push } = useRouter()
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <Container ml="auto" mr="auto" as="nav" maxW={["90%", "90%", "60%", "60%"]} pb={{ base: '12', md: '24' }}>
      <Box py="5" bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')}>
        <HStack padding="0" spacing="10" justify="space-between">
          {status === "unauthenticated" && (
            <>
              <Button onClick={() => push('/signup')} variant="primary">Sign up</Button>
              <Spacer />
              {/* TODO: Add Dark mode button in the end */}
              <Button onClick={toggleColorMode} variant="ghost">
                {colorMode === "dark" ? <FaSun /> : <FaMoon />}
              </Button>
            </>
          )}
          {status === "authenticated" && (
            <>
              <Avatar src={data.user?.image ?? ""} />
              <Spacer />
              <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
              <Button onClick={toggleColorMode} variant="ghost">
                {colorMode === "dark" ? <FaSun /> : <FaMoon />}
              </Button>
            </>
          )}
        </HStack>
      </Box>
    </Container>
  )
}