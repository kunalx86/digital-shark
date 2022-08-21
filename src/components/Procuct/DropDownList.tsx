import { Container, Flex, useColorModeValue, useOutsideClick } from "@chakra-ui/react";
import { ChangeEvent, useRef } from "react";
import styles from "./DropDownList.module.css"

export function TagDropDownList({ topics, open, setOpenOff, onChange }: { 
  topics: Array<{ tag: string }>,
  open: boolean,
  setOpenOff: () => void,
  onChange: (...event: any[]) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useOutsideClick({
    ref,
    handler: (_) => {
      if (open && ref.current)
        setOpenOff()
    }
  })
  const bg = useColorModeValue("gray.300", "blackAlpha.500")
  return (
    <>
      <Flex
        className={styles.searchresult}
        direction="column"
        position="relative"
        overflowY="scroll"
        overflowX="hidden"
        bg={bg}
        borderRadius="md"
        width="100%"
        maxHeight={["100px", "100px", "200px", "200px"]}
        p={2}
        zIndex={9}
        ref={ref}
      >
      {topics.map(topic => (
        <Container 
          ml="auto"
          mr="auto"
          mt={2}
          borderRadius="md"
          border="ActiveBorder"
          p={2}
          key={topic.tag}
          onClick={e => {
            e.preventDefault();
            const event = (e as unknown) as ChangeEvent<HTMLInputElement>;
            event.target.value = topic.tag;
            onChange(event)
            setOpenOff()
          }}
          _hover={{
            bg
          }}
        >
          {topic.tag}
        </Container>
      ))}
      </Flex>
    </>
  )
}