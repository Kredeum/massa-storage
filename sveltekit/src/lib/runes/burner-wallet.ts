import { Account } from '@massalabs/massa-web3';

export interface BurnerWallet {
  address: string;
  privateKey: string;
}

/**
 * Creates a new burner wallet
 * Note: Burner wallets should only be used for testing or temporary purposes
 */
export async function createBurnerWallet(): Promise<BurnerWallet> {
  const account = await Account.generate();
  
  return {
    address: account.address.toString(),
    privateKey: account.privateKey.toString()
  };
}

/**
 * Creates a set of test accounts with different roles
 * Each account is a new burner wallet
 */
export async function createTestAccounts() {
  const contentProvider = await createBurnerWallet();
  const moderator = await createBurnerWallet();
  const nodeRunner = await createBurnerWallet();

  return {
    contentProvider,
    moderator,
    nodeRunner
  };
}
