import { boolToByte, bytesToString, stringToBytes } from '@massalabs/as-types';
import { Storage } from '@massalabs/massa-as-sdk';
import { IPFS_KEY_LENGTH } from '../../../common/src/constants';

function _getValuesKeys(prefix: string): StaticArray<u8>[] {
  return Storage.getKeys(stringToBytes(prefix));
}

export function _getValues(prefix: string): string[] {
  return _getValuesKeys(prefix).map((keyArg: StaticArray<u8>) =>
    bytesToString(keyArg).slice(IPFS_KEY_LENGTH),
  );
}

export function _addValue(key: string): bool {
  if (_hasValue(key)) return false;

  Storage.set(stringToBytes(key), boolToByte(true));

  return true;
}

export function _deleteValue(key: string): bool {
  if (!_hasValue(key)) return false;

  Storage.del(stringToBytes(key));

  return true;
}

export function _hasValue(key: string): bool {
  return Storage.has(stringToBytes(key));
}
