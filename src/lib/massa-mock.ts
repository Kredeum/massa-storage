// Mock implementations for development
class Provider {
    constructor() {}
}

class Args {
    constructor() {}
}

class EventPoller {
    static start(provider: Provider, options: any, onData: any, onError: any, interval: number) {
        return {
            stopPolling: () => {}
        };
    }
}

interface Wallet {
    accounts: () => Promise<{ address: string }[]>;
}

async function getWallets(): Promise<Wallet[]> {
    return [{
        accounts: async () => [{
            address: "AS12b4pgVgvF9GKL6S8wZ6AEKENeqihZ8Qmxkr5NT4Ho7wYp9D9NT"
        }]
    }];
}

export {
    Provider,
    Args,
    EventPoller,
    type Wallet,
    getWallets
};
