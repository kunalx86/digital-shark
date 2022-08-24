import { ButtonGroup, Container, Divider, IconButton, Stack, Text } from "@chakra-ui/react";
import { FaGithub, FaLinkedin } from "react-icons/fa"

export function Footer() {
  return (
    <Container as="footer" maxW={["90%", "90%", "60%", "60%"]} position="relative" bottom="0" left="0" right="0" mt="auto" role="footer">
      <Stack
        spacing="8"
        direction={{ base: 'row', md: 'row' }}
        justify="space-between"
        justifyContent="center"
        alignItems="center"
        py={{ base: '12', md: '16' }}
      >
        <Text>
          Online Realtime Auction House 
        </Text>
        <Text>
          The coins provided are as is and as of now cannot be converted to any legal tender
        </Text>
      </Stack>
      <Divider />
      <Stack
        pt="8"
        pb="12"
        direction={{ base: 'column-reverse', md: 'row' }}
        justify="space-between"
        alignContent="center"
        alignItems="center"
        align="center"
      >
        <Text fontSize="sm" color="subtle">
          Made by Kunal Joshi with ❤️
        </Text>
        <ButtonGroup variant="ghost">
          <IconButton
            as="a"
            href="https://in.linkedin.com/in/kunal-joshi-592751195"
            aria-label="LinkedIn"
            icon={<FaLinkedin size="32px"/>}
          />
          <IconButton as="a" href="https://github.com/kunalx86" aria-label="GitHub" icon={<FaGithub size="32px" />} />
        </ButtonGroup>
      </Stack>
    </Container> 
  )
}