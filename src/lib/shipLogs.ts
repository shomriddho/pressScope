export async function shipToBetterStack(payload: any) {
  const url = process.env.BETTERSTACK_URL
  const apiKey = process.env.BETTERSTACK_API_KEY

  if (!url || !apiKey) return

  console.log('Shipping to Better Stack:', payload)
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })
  console.log('Shipped to Better Stack:', payload)
}
