import { Address, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { _addValue, _deleteValue, _hasValue, _getValues } from './ipfs-values';
import { IPFS_CID_KEY } from '../../../common/src/constants';

// Calculate the cost for storage based on the CID address length
export function cidAdd(cidArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  // const storageCost = u64(cidArg.length) * u64(1_000_000); // 1 coin per byte
  // Context.requireCoins(storageCost);

  const cid = _str(cidArg);

  const success = _addValue(IPFS_CID_KEY + cid);

  if (success) generateEvent(`CID added: ${cid}`);
}

export function cidDel(cidArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const cid = _str(cidArg);

  const success = _deleteValue(IPFS_CID_KEY + cid);

  if (success) generateEvent(`CID deleted: ${cid}`);
}

export function cidsGet(): StaticArray<u8> {
  return new Args().add(_getValues(IPFS_CID_KEY)).serialize();
}

export function cidHas(cidArg: StaticArray<u8>): StaticArray<u8> {
  const cid = _str(cidArg);

  const hasValue = _hasValue(IPFS_CID_KEY + cid);

  return new Args().add(hasValue).serialize();
}

function _str(cidArg: StaticArray<u8>): string {
  return new Address(
    new Args(cidArg).nextString().expect('Invalid address'),
  ).toString();
}
