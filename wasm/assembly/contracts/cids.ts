import { generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { cidMap } from './map';

export function cidAdd(cidArg: StaticArray<u8>): void {
  const args: Args = new Args(cidArg);
  const cid: string = args.nextString().expect('Invalid CID');

  const success: bool = cidMap.add(cid);

  if (success) generateEvent(`CID added: ${cid}`);
}

export function cidDelete(cidArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const args: Args = new Args(cidArg);
  const cid: string = args.nextString().expect('Invalid CID');

  const success: bool = cidMap.delete(cid);

  if (success) generateEvent(`CID deleted: ${cid}`);
}

export function cidsGet(prefixArg: StaticArray<u8>): StaticArray<u8> {
  const args: Args = new Args(prefixArg);
  const prefix: string = args.nextString().expect('Invalid prefix');

  const keys: string[] = cidMap.keys(prefix);
  const values: string[] = cidMap.values(prefix);

  return new Args().add(keys).add(values).serialize();

  // return new Args().serialize();
}

export function cidSet(paramsArg: StaticArray<u8>): void {
  const args: Args = new Args(paramsArg);
  const key: string = args.nextString().expect('Invalid key');
  const value: string = args.nextString().expect('Invalid value');

  cidMap.set(key, value);

  generateEvent(`Set CID: ${key} -> ${value}`);
}

export function cidHas(cidArg: StaticArray<u8>): StaticArray<u8> {
  const args: Args = new Args(cidArg);
  const cid: string = args.nextString().expect('Invalid CID');

  const hasValue: bool = cidMap.has(cid);

  return new Args().add(hasValue).serialize();
}
