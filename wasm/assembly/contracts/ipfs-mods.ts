import { generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { moderatorMap } from './boolean-map';
import { _addressArgToString, _stringArgToString } from './utils';

export function moderatorAdd(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const mod = _addressArgToString(modArg);

  const success = moderatorMap.add(mod);

  if (success) generateEvent(`Moderator added: ${mod}`);
}

export function moderatorDelete(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const mod = _addressArgToString(modArg);

  const success = moderatorMap.delete(mod);

  if (success) generateEvent(`Moderator deleted: ${mod}`);
}

export function moderatorsGet(prefixArg: StaticArray<u8>): StaticArray<u8> {
  const prefix = _stringArgToString(prefixArg);

  return new Args().add(moderatorMap.values(prefix)).serialize();
}

export function moderatorHas(modArg: StaticArray<u8>): StaticArray<u8> {
  const mod = _addressArgToString(modArg);

  const hasValue = moderatorMap.has(mod);

  return new Args().add(hasValue).serialize();
}
