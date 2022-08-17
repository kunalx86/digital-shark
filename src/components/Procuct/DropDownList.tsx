import { Container, Flex, useOutsideClick } from "@chakra-ui/react";
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
  return (
    <>
      <Flex
        className={styles.searchresult}
        direction="column"
        position="relative"
        overflowY="scroll"
        overflowX="hidden"
        bgColor="cyan.800"
        borderRadius="md"
        boxShadow="md"
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
            bg: "cyan.900"
          }}
        >
          {topic.tag}
        </Container>
      ))}
      </Flex>
    </>
  )
}