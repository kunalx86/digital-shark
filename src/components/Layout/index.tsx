import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <Flex ml="auto" mr="auto" direction="column" alignItems="center" maxW={["90%", "90%", "60%", "60%"]}>
        {children}
      </Flex>
      <Footer />
    </>
  )
}