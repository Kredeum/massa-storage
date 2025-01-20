import { Address, Context, generateEvent } from '@massalabs/massa-as-sdk';
import { Args } from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import {
  _addModerator,
  _deleteModerator,
  _isModerator,
  _getModerators,
} from './ipfs-internals';

export function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const caller = Context.caller().serialize();

  ownership.setOwner(caller);
  addModerator(caller);
}

export function addModerator(moderator: StaticArray<u8>): void {
  ownership.onlyOwner();

  const success = _addModerator(_str(moderator));

  if (success) generateEvent(`Moderator added: ${_str(moderator)}`);
}

export function deleteModerator(moderator: StaticArray<u8>): void {
  ownership.onlyOwner();

  const success = _deleteModerator(_str(moderator));

  if (success) generateEvent(`Moderator deleted: ${_str(moderator)}`);
}

export function getModerators(): StaticArray<u8> {
  return new Args().add(_getModerators()).serialize();
}

export function isModerator(moderator: StaticArray<u8>): StaticArray<u8> {
  return new Args().add(_isModerator(_str(moderator))).serialize();
}

function _str(moderatorArg: StaticArray<u8>): string {
  return new Address(
    new Args(moderatorArg).nextString().expect('Invalid address'),
  ).toString();
}
