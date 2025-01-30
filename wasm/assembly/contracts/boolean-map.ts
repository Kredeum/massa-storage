// Original code from :
// 1. Near (https://github.com/near/near-sdk-as/blob/master/sdk-core/assembly/collections/persistentMap.ts)
// 2. Massa (https://github.com/massalabs/massa-as-sdk/blob/main/assembly/collections/persistentMap.ts)
//

import { Storage } from '@massalabs/massa-as-sdk';
import { stringToBytes, boolToByte, bytesToString, byteToBool } from '@massalabs/as-types';
import { MODERATOR, CID } from '../../../common/src/constants';

// Boolean Map, 3 map values : true, false or undefined, real value inside key
class BooleanMap {
  private _mapPrefix: string;

  constructor(mapPrefix: string) {
    this._mapPrefix = mapPrefix;
  }

  private _key(key: string): StaticArray<u8> {
    return stringToBytes(this._mapPrefix + key);
  }
  private _keys(prefix: string): StaticArray<u8>[] {
    return Storage.getKeys(this._key(prefix));
  }
  private _set(key: string, value: bool): bool {
    const _key = this._key(key);
    const _has = Storage.has(_key);

    Storage.set(_key, boolToByte(value));

    return _has;
  }

  size(prefix: string): usize {
    return this._keys(prefix).length;
  }
  has(key: string): bool {
    return Storage.has(this._key(key));
  }
  get(key: string):  StaticArray<u8> {
    const _key = this._key(key);
    return Storage.has(_key) ? Storage.get(_key) : [];
  }
  keys(prefix: string): string[] {
    const _keys: string[] = [];
    const keys = this._keys(prefix);
    for (let i = 0; i < keys.length; i++) {
      _keys.push(bytesToString(keys[i]).slice(this._key(prefix).length));
    }
    return _keys;
  }
  values(prefix: string): bool[] {
    const _values: bool[] = [];
    const keys = this._keys(prefix);
    for (let i = 0; i < keys.length; i++) {
      _values.push(byteToBool(Storage.get(keys[i])));
    }
    return _values;
  }
  add(key: string): bool {
    return this._set(key, true);
  }
  set(key: string, value: bool): void {
    this._set(key, value);
  }
  delete(key: string): bool {
    if (!this.has(key)) return false;

    Storage.del(this._key(key));

    return true;
  }
}

const moderatorMap = new BooleanMap(MODERATOR);
const cidMap = new BooleanMap(CID);

export { moderatorMap, cidMap };
