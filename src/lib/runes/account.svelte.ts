const account = $state<{
  address?: string;
  connected?: boolean;
  balance?: bigint;
}>({});

export { account };
