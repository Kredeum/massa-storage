// Original code from :
// 1. Near (https://github.com/near/near-sdk-as/blob/master/sdk-core/assembly/collections/persistentMap.ts)
// 2. Massa (https://github.com/massalabs/massa-as-sdk/blob/main/assembly/collections/persistentMap.ts)
//

import { generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { stringToBytes, boolToByte, bytesToString, byteToBool, Args } from '@massalabs/as-types';
import { MODERATOR, CID } from '../../../common/src/constants';

// PersistentMap : map of cid => string  
class PersistentMap {
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
  private _set(key: string, value: string): void {
    const _key:StaticArray<u8> = this._key(key);
    const _value:StaticArray<u8> = stringToBytes(value);

    Storage.set(_key, _value);
  }

  size(prefix: string): usize {
    return this._keys(prefix).length;
  }
  has(key: string): bool {
    return Storage.has(this._key(key));
  }
  get(key: string): string {
    const _key: StaticArray<u8> = this._key(key);
    return Storage.has(_key) ? bytesToString(Storage.get(_key)) : "";
  }
  keys(prefix: string): string[] {
    const keys: StaticArray<u8>[] = this._keys(prefix);
    const keysCount: u32 = keys.length;
    const prefixLength: u32 = this._key(prefix).length;
    const _keys: string[] = [];
    for (let i: u32 = 0; i < keysCount; i++) {
      _keys.push(bytesToString(keys[i]).slice(prefixLength));
    }
    return _keys;
  }
  values(prefix: string): string[] {
    const _values: string[] = [];
    const keys: StaticArray<u8>[] = this._keys(prefix);
    const keysCount: u32 = keys.length;
    for (let i: u32 = 0; i < keysCount; i++) {
      _values.push(bytesToString(Storage.get(keys[i])));
    }
    return _values;
  }
  add(key: string): bool {
    if (this.has(key)) return false;

    this._set(key, "-1");

    return true;
  }
  set(key: string, value: string): void {
    this._set(key, value);
  }
  delete(key: string): bool {
    if (!this.has(key)) return false;

    Storage.del(this._key(key));

    return true;
  }
}


// moderatorMap : map of moerator => "1"  
const moderatorMap: PersistentMap = new PersistentMap(MODERATOR);

// cidMap : map of cid => json
const cidMap: PersistentMap = new PersistentMap(CID);

export { moderatorMap, cidMap };
