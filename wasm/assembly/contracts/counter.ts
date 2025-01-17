import { Storage, Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args, u64ToBytes, stringToBytes } from '@massalabs/as-types';
import { setOwner, onlyOwner } from './utils/ownership';

/**
 * @notice Initializes the contract with the deployer's address as the owner.
 * @dev Can only be called during the contract deployment phase.
 * @param deployer The deployer's address serialized as a `StaticArray<u8>`.
 */
export function constructor(deployer: StaticArray<u8>): void {
  assert(Context.isDeployingContract(), "Constructor can only be called during deployment");
  setOwner(deployer); // Set the deployer as the owner
  initialize(); // Set initial counter value
}

/** @notice Key used to store the counter value in the contract's storage. */
export const COUNT_KEY = stringToBytes('count');

/**
 * @notice Initializes the counter to the default value of 7.
 * @dev This function is called internally during the contract's deployment.
 */
export function initialize(): void {
  Storage.set(COUNT_KEY, u64ToBytes(7));
}

/**
 * @notice Retrieves the current value of the counter from storage.
 * @return The counter value serialized as a `StaticArray<u8>`.
 */
export function getCount(): StaticArray<u8> {
  return Storage.get(COUNT_KEY);
}

/**
 * @notice Sets the counter to a specific value.
 * @dev The input value must be valid and non-negative.
 * @param c The new counter value serialized as a `StaticArray<u8>`.
 */
export function setCount(c: StaticArray<u8>): void {
  const countValue = new Args(c)
    .nextU64()
    .expect('count argument is missing or invalid');
  Storage.set(COUNT_KEY, u64ToBytes(countValue)); // Save the new counter value
  generateEvent(`Counter set to ${countValue}`); // Emit an event for the new value
}

/**
 * @notice Increments the counter by a specified value.
 * @dev The input value is added to the current counter value.
 * @param n The increment value serialized as a `StaticArray<u8>`.
 */
export function increment(n: StaticArray<u8>): void {
  const incrementValue = new Args(n)
    .nextU64()
    .expect('increment argument is missing or invalid');
  const countValue = new Args(getCount()).nextU64().expect('getCount is missing or invalid');
  const totalCount = countValue + incrementValue; // Calculate the new counter value
  setCount(u64ToBytes(totalCount)); // Update the counter
}

/**
 * @notice Resets the counter value to 0.
 * @dev Only the contract owner can call this function.
 */
export function reset(): void {
  onlyOwner(); // Ensure the caller is the owner
  setCount(u64ToBytes(0)); // Reset the counter to 0
}