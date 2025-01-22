import { generateEvent, Storage, Context } from '@massalabs/massa-as-sdk';
import { GREETING_KEY } from '../../../common/src/constants';
import { Args } from '@massalabs/as-types';

// deployed to "AS15R8LW3sbDpGqqbJyee7zJCXbFTjVDWg56JWz59muHxLdtSZQP"

/**
 * This function is meant to be called only one time: when the contract is deployed.
 */
export function constructor(greetingArg: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  assert(Context.isDeployingContract());

  const greeting = new Args(greetingArg)
    .nextString()
    .expect('greetingArg invalid');

  // Set the greeting message in the contract storage
  Storage.set(GREETING_KEY, greeting);

  // Emit an event to notify that the greeting message has been set
  generateEvent(`Bonjour ok`);
}
