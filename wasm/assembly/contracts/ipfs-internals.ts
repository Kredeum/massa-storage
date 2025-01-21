import {
  boolToByte,
  bytesToString,
  byteToBool,
  stringToBytes,
} from '@massalabs/as-types';
import { Storage } from '@massalabs/massa-as-sdk';

import { IPFS_MODERATOR_KEY } from '../../../common/src/constants';

function _key(moderator: string): StaticArray<u8> {
  return stringToBytes(IPFS_MODERATOR_KEY + moderator);
}

function _getModeratorsKeys(): StaticArray<u8>[] {
  return Storage.getKeys(_key(''));
}

function _getModeratorFromKey(key: StaticArray<u8>): string {
  return bytesToString(key).slice(IPFS_MODERATOR_KEY.length);
}

export function _addModerator(moderator: string): bool {
  if (_isModerator(moderator)) return false;

  Storage.set(_key(moderator), boolToByte(true));

  return true;
}

export function _deleteModerator(moderator: string): bool {
  if (!_isModerator(moderator)) return false;

  Storage.del(_key(moderator));

  return true;
}

export function _isModerator(moderator: string): bool {
  return Storage.has(_key(moderator));
}

export function _getModerators(): string[] {
  return _getModeratorsKeys().map((key: StaticArray<u8>) =>
    _getModeratorFromKey(key),
  );
}
