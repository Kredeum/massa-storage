const wallet = $state<{
  address?: string,
  connected?: boolean,
  balance?: number
}>({});


export { wallet }