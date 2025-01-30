import { generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { cidMap } from './boolean-map';
import { _addressArgToString, _stringArgToString } from './utils';

export function cidAdd(cidArg: StaticArray<u8>): void {
  const cid = _stringArgToString(cidArg);

  const success = cidMap.add(cid);

  if (success) generateEvent(`CID added: ${cid}`);
}

export function cidDelete(cidArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const cid = _stringArgToString(cidArg);

  const success = cidMap.delete(cid);

  if (success) generateEvent(`CID deleted: ${cid}`);
}

export function cidsGet(prefixArg: StaticArray<u8>): StaticArray<u8> {
  const prefix = _stringArgToString(prefixArg);

  return new Args().add(cidMap.kvalues(prefix)).serialize();
}

export function cidHas(cidArg: StaticArray<u8>): StaticArray<u8> {
  const cid = _stringArgToString(cidArg);

  const hasValue = cidMap.has(cid);

  return new Args().add(hasValue).serialize();
}
