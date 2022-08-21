import { Button, Container, FormControl, FormErrorMessage, Image, FormLabel, Icon, Input, InputGroup, InputLeftElement, Spinner, Textarea, useToast, Flex, Heading, useColorModeValue } from "@chakra-ui/react";
import { useForm, useFieldArray, useController, Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDeferredValue, useState } from "react";
import { trpc } from "@utils/trpc";
import { TagDropDownList } from "./DropDownList";
import { FaFile } from "react-icons/fa";
import { TRPCClientError } from "@trpc/client";
import { createProductSchema } from "@schemas/product";

type FormData = {
  name: string,
  description: string,
  image: File,
  topics: Topic[]
}

type Topic = {
  tag: string
}

export function ProductForm() {
  const { 
    handleSubmit,
    register,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(createProductSchema)
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "topics",
    rules: {
      maxLength: 4,
      minLength: 0
    }
  })
  const toast = useToast();
  const { mutateAsync } = trpc.useMutation(["product.create"], {
    onError(error, _, __) {
      toast({
        status: "error",
        title: "Product creation failed",
        description: error.message,
      })
    },
    onSuccess(data, _, __) {
      toast({
        status: "success",
        title: "Product creation successful",
        description: `Product with name ${data.name} successfully created`
      })
      reset()
    },
  })

  const bg = useColorModeValue("gray.100", "blackAlpha.300")

  return (
    <Container
      maxW="lg"
      px={{ base: '0', sm: '8' }}
      as="div"
      bg={bg}
      borderRadius="md"
      boxShadow="outline gray"
      p={3}
    >
    <form onSubmit={handleSubmit(async ({ name, description, image, topics }) => {
      const formData = new FormData()
      formData.append("product", image);
      fetch("/api/upload", {
        method: "post",
        body: formData
      })
        .then(res => res.json() as Promise<{ publicURL: string }>)
        .then(({ publicURL }) => mutateAsync({
          name,
          description,
          topics,
          image: publicURL
        }))
        .catch(err => {
          console.log(err)
          if (err instanceof TRPCClientError) return;
          toast({
            status: "error",
            title: "Product creation failed",
            description: err?.message || "Something went wrong"
          })
        })
    })}>
      <Heading>Create Product</Heading>
      <FormControl isInvalid={!!errors.name}>
        <FormLabel htmlFor="name">Name</FormLabel>
        <Input
          id="name"
          placeholder="Name of your Product"
          {...register('name')}
        />
        <FormErrorMessage>
          {errors.name && errors.name.message}
        </FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.description}>
        <FormLabel htmlFor="name">Description</FormLabel>
        <Textarea
          id="description"
          placeholder="Name of your Product"
          {...register('description')}
        />
        <FormErrorMessage>
          {errors.description && errors.description.message}
        </FormErrorMessage>
      </FormControl>
      <FileUpload name="image" control={control} />
      {fields.map((field, idx) => (
        <FormControl pt={2} pb={2} key={field.id} isInvalid={!!errors.topics?.[idx]?.tag?.message}>
          <FormLabel>Tag #{idx}</FormLabel>
          <TagInput
            name={`topics.${idx}.tag`}
            control={control}
          />
          <FormErrorMessage>
            {errors.topics?.[idx]?.tag?.message}
          </FormErrorMessage>
          <Button mt={2} onClick={() => remove(idx)}>Remove Tag</Button>
        </FormControl>
      ))} 
      <Flex justify="center" mt={2}>
        <Button isDisabled={Object.keys(fields).length >= 4} variant="outline" onClick={() => Object.keys(fields).length < 4 && append({
          tag: ""
        })}>Add Tag</Button>
        <Button ml={2} isLoading={isSubmitting} type="submit" variant="solid">Save</Button>
      </Flex>
    </form> 
    </Container>
  )
}

function TagInput({ name, control }: { name: `topics.${number}.tag`, control: Control<FormData, any> }) {
  const { field } = useController({
    name,
    control
  })
  const term = useDeferredValue(field.value)
  const [open, setOpen] = useState(false)
  const { isLoading, data } = trpc.useQuery(["topic.search", term], {
    enabled: term !== ""
  })
  return (
    <>
      <Input
        id={name}
        onClick={() => setOpen(true)}
        placeholder="Enter relevant tag"
        autoCapitalize="off"
        {...field}
      />
      {isLoading && <Spinner />}
      {open && data && data.length > 0 && <TagDropDownList onChange={field.onChange} open={open} setOpenOff={() => setOpen(false)} topics={data} />}
    </>
  )
}

function FileUpload({ name, control }: { 
  name: `image`,
  control: Control<FormData, any>,
}) {
  const {
    field: { ref, value, onChange, ...inputProps },
    fieldState: { error },
  } = useController({
    name,
    control
  })
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor="writeUpFile">Image of Product</FormLabel>
      <InputGroup>
        <InputLeftElement
          pointerEvents="none"
        >
          <Icon as={FaFile} />
        </InputLeftElement>
        <Input
          type="file"
          ref={ref}
          placeholder={"Upload your product file"}
          onChange={e => {
            onChange(e.target.files![0]!)
          }}
          {...inputProps}
        />
      </InputGroup>
      {value && <ImagePreview file={value} />}
      <FormErrorMessage>
        {error?.message}
      </FormErrorMessage>
    </FormControl>
  )
}

function ImagePreview({ file }: {
  file: File
}) {
  const [img, setImg] = useState<string>("");
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => setImg(reader.result as string);
  return img !== "" ? <Image alt="Product Image" p={2} width="500px" height="500px" src={img} /> : <></>;
}