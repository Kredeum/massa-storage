import { bytesToString, stringToBytes } from '@massalabs/as-types';
import { Storage } from '@massalabs/massa-as-sdk';

// import { IPFS_MODERATOR_KEY } from '../../../common/src/constants';
const IPFS_MODERATORS_KEY = stringToBytes('MODERATORS_LIST');

function _setModerators(moderators: string): void {
  Storage.set(IPFS_MODERATORS_KEY, stringToBytes(moderators));
}

export function _getModerators(): string {
  return Storage.has(IPFS_MODERATORS_KEY)
    ? bytesToString(Storage.get(IPFS_MODERATORS_KEY))
    : '';
}

export function _isModerator(moderator: string): bool {
  return _getModerators().includes(moderator);
}

export function _addModerator(moderator: string): bool {
  if (_isModerator(moderator)) return false;

  _setModerators(_getModerators() + ',' + moderator);

  return true;
}

export function _deleteModerator(moderator: string): bool {
  if (!_isModerator(moderator)) return false;

  _setModerators(_getModerators().replace(moderator, ''));

  return true;
}
