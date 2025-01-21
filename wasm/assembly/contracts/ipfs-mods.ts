import { Address, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { _addValue, _deleteValue, _hasValue, _getValues } from './ipfs-values';
import { IPFS_mod_KEY } from '../../../common/src/constants';

// Calculate the cost for storage based on the mod address length
export function modAdd(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  // const storageCost = u64(modArg.length) * u64(1_000_000); // 1 coin per byte
  // Context.requireCoins(storageCost);

  const mod = _str(modArg);

  const success = _addValue(IPFS_mod_KEY + mod);

  if (success) generateEvent(`mod added: ${mod}`);
}

export function modDel(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const mod = _str(modArg);

  const success = _deleteValue(IPFS_mod_KEY + mod);

  if (success) generateEvent(`mod deleted: ${mod}`);
}

export function modsGet(): StaticArray<u8> {
  return new Args().add(_getValues(IPFS_mod_KEY)).serialize();
}

export function modHas(modArg: StaticArray<u8>): StaticArray<u8> {
  const mod = _str(modArg);

  const hasValue = _hasValue(IPFS_mod_KEY + mod);

  return new Args().add(hasValue).serialize();
}

function _str(modArg: StaticArray<u8>): string {
  return new Address(
    new Args(modArg).nextString().expect('Invalid address'),
  ).toString();
}
