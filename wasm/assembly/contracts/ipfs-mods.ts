import { generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { modMap } from './boolean-map';
import { _addressArgToString, _stringArgToString } from './utils';

export function modAdd(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const mod = _addressArgToString(modArg);

  const success = modMap.add(mod);

  if (success) generateEvent(`Moderator added: ${mod}`);
}

export function modDelete(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const mod = _addressArgToString(modArg);

  const success = modMap.del(mod);

  if (success) generateEvent(`Moderator deleted: ${mod}`);
}

export function modsGet(prefixArg: StaticArray<u8>): StaticArray<u8> {
  const prefix = _stringArgToString(prefixArg);

  return new Args().add(modMap.values(prefix)).serialize();
}

export function modHas(modArg: StaticArray<u8>): StaticArray<u8> {
  const mod = _addressArgToString(modArg);

  const hasValue = modMap.has(mod);

  return new Args().add(hasValue).serialize();
}
