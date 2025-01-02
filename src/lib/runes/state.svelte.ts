const wallet = $state<{
  address?: string;
  connected?: boolean;
  balance?: string;
}>({});

export { wallet };
