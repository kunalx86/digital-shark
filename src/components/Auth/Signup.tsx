import {
  Box,
  Button,
  Container,
  Divider,
  HStack,
  Stack,
  Text,
  useColorModeValue,
  Flex,
  Heading,
  Image
} from '@chakra-ui/react'
import { ClientSafeProvider, LiteralUnion, signIn } from 'next-auth/react'
import { BuiltInProviderType } from 'next-auth/providers'
import { useRouter } from 'next/router'

function GoogleLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="24" width="24">
      <path fill="#4285f4" d="M386 400c45-42 65-112 53-179H260v74h102c-4 24-18 44-38 57z"></path>
      <path fill="#34a853" d="M90 341a192 192 0 0 0 296 59l-62-48c-53 35-141 22-171-60z"></path>
      <path fill="#fbbc02" d="M153 292c-8-25-8-48 0-73l-63-49c-23 46-30 111 0 171z"></path>
      <path fill="#ea4335" d="M153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55z"></path>
    </svg>
  )
}

function DiscordLogo() {
  return (
    <Image width="28px" height="28px" alt="Discord Logo" src="/logos/d-logo.png" />
  )
}

function Auth0Logo() {
  return (
    <Image width="28px" height="28px" alt="Auth0 Logo" src="/logos/a-logo.svg" />
  )
}

export function Signup({ providers }: { providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null }) {
  const { query } = useRouter()
  let callbackUrl: string | undefined = undefined;
  if ("next" in query && typeof query.next === "string") {
    callbackUrl = (query.next as string).startsWith("/") ? (query.next as string) : undefined;
  }
  return (
    <Container 
      borderRadius="md"
      boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
      bgColor="cyan.500"
      maxW="lg"
      py={{ base: '12', md: '24' }}
      px={{ base: '0', sm: '8' }}
    >
      <Stack spacing="8">
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          // bg={useBreakpointValue({ base: 'transparent', sm: 'bg-surface' })}
          // boxShadow={{ base: 'none', sm: useColorModeValue('md', 'md-dark') }}
          // borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <Heading pb={2} textAlign="center">
            Log In or Sign Up
          </Heading>
          <HStack>
            <Divider borderColor={useColorModeValue('md', 'md-dark')} />
            <Text fontSize="sm" whiteSpace="nowrap" color="muted">
              Continue with
            </Text>
            <Divider borderColor={useColorModeValue('md', 'md-dark')}/>
          </HStack>
          <Flex alignItems="center" direction="column" pt="2vh">
            <Button onClick={() => signIn(providers?.google.id, {
              callbackUrl
            })} m={3} _hover={{
              bg: "gray.200"
            }} bg="white" color="#4285F4" w="60%" variant="solid" leftIcon={<GoogleLogo />}>Google</Button>
            <Button onClick={() => signIn(providers?.discord.id, {
              callbackUrl
            })} m={3} _hover={{
              bg: "gray.200"
            }} bg="white" color="#5865F2" w="60%" variant="solid" leftIcon={<DiscordLogo />}>Discord</Button>
            <Button onClick={() => signIn(providers?.auth0.id, {
              callbackUrl
            })} m={3} _hover={{
              bg: "gray.200"
            }} bg="white" color="#eb5424" w="60%" variant="solid" leftIcon={<Auth0Logo />}>Auth0</Button>
          </Flex>
        </Box>
      </Stack>
    </Container>
  )
}
