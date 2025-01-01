declare global {
  interface Window {
    bearby?: {
      wallet: {
        connect: (params: { title: string }) => Promise<boolean>;
        installed: boolean;
        account: {
          address: string;
        };
      };
    };
  }
}

export {};
