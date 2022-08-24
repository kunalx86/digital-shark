import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { readFile } from "fs/promises"
import { env } from "@env/server.mjs";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "@pages/api/auth/[...nextauth]"
import formidable from "formidable"

const expiresIn = 60 * 60 * 24 * 30 * 365 * 10;
const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({
      error: "Not authenticated"
    })
  }

  const { files } = await new Promise<{
    fields: formidable.Fields
    files: formidable.Files
  }>((res, rej) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) rej(err);
      res({fields, files})
    })
  })
  const productFile = files.product as formidable.File
  const productImage = await readFile(productFile.filepath)
  const extension = productFile.originalFilename?.split('.').at(-1)

  if (!["jpg", "jpeg", "png"].includes(extension ?? ""))
    return res.status(400).json({ error: "Only images are allowed" })

  const { data, error } = await supabaseClient.storage
    .from("product-images")
    .upload(`${Date.now()}-${productFile.newFilename}.${productFile.originalFilename?.split('.').at(-1)}`, productImage)
  
  if (!data && error) return res.status(500).json({ error })

  const { publicURL, error: _error } = supabaseClient.storage
    .from("product-images")
    .getPublicUrl(data?.Key.split('/')[1] ?? "")

  if (publicURL === null && _error) return res.status(500).json({ error: _error })

  res.status(201).json({ publicURL })
}

export const config = {
  api: {
    bodyParser: false
  }
}