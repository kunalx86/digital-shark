import { Button, Container, FormControl, FormErrorMessage, Image, FormLabel, Icon, Input, InputGroup, InputLeftElement, Spinner, Textarea, useColorMode, useColorModeValue, useUpdateEffect } from "@chakra-ui/react";
import { useForm, useFieldArray, useController, Control, UseFormSetValue } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { trpc } from "@utils/trpc";
import { TagDropDownList } from "./DropDownList";
import { FaFile } from "react-icons/fa";

type FormData = {
  name: string,
  description: string,
  image: File,
  topics: Topic[]
}

type Topic = {
  tag: string
}

const formSchema = z.object({
  name: z.string().max(255, "Name cannot exceed 255 characters").min(1),
  description: z.string(),
  image: z.any(),
  topics: z.array(z.object({
    tag: z.string()
  })).min(0).max(4)
})

export function ProductForm() {
  const { 
    handleSubmit,
    register,
    control,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "topics",
    rules: {
      maxLength: 4,
      minLength: 0
    }
  })

  const { mutateAsync } = trpc.useMutation(["product.create"])

  const bg = useColorModeValue("cyan.200", "darkcyan")
  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} as="div" borderRadius="md" bg={bg} boxShadow="base" p={3}>
    <form onSubmit={handleSubmit(async ({ name, description, image, topics }) => {
      const formData = new FormData()
      formData.append("product", image);
      const res = await fetch("/api/upload", {
        method: "post",
        body: formData
      });
      const { publicURL } = await res.json() as { publicURL: string }
      const product = await mutateAsync({
        name,
        description,
        topics,
        image: publicURL,
      })
    })}>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
      <FormControl p={2} isInvalid={!!errors.name}>
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
      <FormControl p={2} isInvalid={!!errors.description}>
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
        <FormControl pt={2} pb={2} key={field.id}>
          <FormLabel>Tag #{idx}</FormLabel>
          <TagInput
            name={`topics.${idx}.tag`}
            control={control}
          />
          <Button onClick={() => remove(idx)}>Remove Tag</Button>
        </FormControl>
      ))} 
      <Button mr={2} isDisabled={Object.keys(fields).length >= 4} variant="outline" onClick={() => Object.keys(fields).length < 4 && append({
        tag: ""
      })}>Add Tags</Button>
      <Button ml={2} isLoading={isSubmitting} type="submit" variant="solid">Save</Button>
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