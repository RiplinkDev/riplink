import SuccessClient from "./SuccessClient"

export const dynamic = "force-dynamic"

export default async function Success(props: { params: Promise<{ hash: string }> }) {
  const { hash } = await props.params

  return <SuccessClient hash={hash} />
}
