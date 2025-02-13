import { generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import { moderatorMap } from './map';

export function moderatorAdd(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const args: Args = new Args(modArg); 
  const mod: string = args.nextString().expect('Invalid moderator');

  const success: bool = moderatorMap.add(mod);

  if (success) generateEvent(`Moderator added: ${mod}`);
}

export function moderatorDelete(modArg: StaticArray<u8>): void {
  ownership.onlyOwner();

  const args: Args = new Args(modArg); 
  const mod: string = args.nextString().expect('Invalid moderator');

  const success: bool = moderatorMap.delete(mod);

  if (success) generateEvent(`Moderator deleted: ${mod}`);
}

export function moderatorsGet(prefixArg: StaticArray<u8>): StaticArray<u8> {
  const args: Args = new Args(prefixArg); 
  const prefix: string = args.nextString().expect('Invalid prefix');

  return new Args().add(moderatorMap.keys(prefix)).serialize();
}

export function moderatorHas(modArg: StaticArray<u8>): StaticArray<u8> {
  const args: Args = new Args(modArg); 
  const mod: string = args.nextString().expect('Invalid moderator');

  const hasValue:bool = moderatorMap.has(mod);

  return new Args().add(hasValue).serialize();
}
