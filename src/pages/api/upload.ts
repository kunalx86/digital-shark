import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { env } from "@env/server.mjs";

const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET)

// TODO: Complete file upload
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // supabaseClient.storage
  //   .from("product-images")
  //   .upload(`${Date.now()}`)
  res.status(500).json({ error: "Not implemented" })
}