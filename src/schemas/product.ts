import * as z from "zod"

export const createProductSchema = z.object({
  name: z.string()
    .max(255, "Name cannot exceed 255 characters")
    .min(3, "Name must have atleast 3 characters"),
  description: z.string()
    .max(1024, "Description cannot exceed 255 characters")
    .min(4, "Atlest 4 characters are needed"),
  image: 
    typeof window === "undefined" 
    ? z.string()
      .url("Image must be a valid URL")
    : z.instanceof(File)
      .refine(file => file !== undefined || file !== null,{
        message: "Product image is necessary"
      })
      .refine(file => file.type === "image/png" || file.type === "image/jpg" || file.type === "image/jpeg", {
        message: "Only image is allowed"
      }),
  topics: z.array(
    z.object({
      tag: z.string()
        .max(255, "Tag cannot exceed 255 characters")
        .min(3, "Tag must be atleast 3 characters long")
  }))
    .min(0)
    .max(4, "No more than 4 tags cannot allotted")
})