import { shopifyClient } from '@/lib/shopify'
import { PRODUCT_BY_HANDLE_QUERY } from '@/lib/queries'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params

  const { data, errors } = await shopifyClient.request(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle },
  })

  console.log('handle:', handle)
  console.log('errors:', JSON.stringify(errors))
  console.log('data:', JSON.stringify(data))

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
