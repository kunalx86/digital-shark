import { Button, Box, Container, HStack, useColorModeValue } from "@chakra-ui/react";

export function Navbar() {
  return (
    <Container ml="auto" mr="auto" as="nav" maxW={["90%", "90%", "60%", "60%"]} pb={{ base: '12', md: '24' }}>
      <Box py="5" bg="bg-surface" boxShadow={useColorModeValue('sm', 'sm-dark')}>
        <HStack padding="0" spacing="10" justify="space-between">
          <Button variant="primary">Sign up</Button>
        </HStack>
      </Box>
    </Container>
  )
}