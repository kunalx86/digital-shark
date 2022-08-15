import { Signup } from "@components/Auth/Signup";
import { getProviders } from "next-auth/react";

export default Signup

export async function getServerSideProps() {
  const providers = await getProviders()
  return {
    props: {
      providers
    }
  }
}