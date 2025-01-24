// Original code from :
// 1. Near (https://github.com/near/near-sdk-as/blob/master/sdk-core/assembly/collections/persistentMap.ts)
// 2. Massa (https://github.com/massalabs/massa-as-sdk/blob/main/assembly/collections/persistentMap.ts)
//

import { Storage } from '@massalabs/massa-as-sdk';
import { stringToBytes, boolToByte, bytesToString } from '@massalabs/as-types';
import { MODERATOR, CID } from '../../../common/src/constants';

// Boolean Map : map values always true, real value inside key
class BooleanMap {
  private _mapPrefix: string;
  private _size: usize;

  constructor(mapPrefix: string) {
    this._mapPrefix = mapPrefix;
    this._size = 0;
  }

  key(key: string): StaticArray<u8> {
    return stringToBytes(this._mapPrefix + key);
  }
  size(): usize {
    return this._size;
  }
  has(key: string): bool {
    return Storage.has(this.key(key));
  }
  keys(prefix: string): StaticArray<u8>[] {
    return Storage.getKeys(this.key(prefix));
  }
  values(prefix: string): string[] {
    const values: string[] = [];
    const keys = this.keys(prefix);
    for (let i = 0; i < keys.length; i++) {
      values.push(bytesToString(keys[i]).slice(this.key(prefix).length));
    }
    return values;
  }
  add(key: string): bool {
    if (this.has(key)) return false;
    Storage.set(this.key(key), boolToByte(true));
    this._size += 1;
    return true;
  }
  delete(key: string): bool {
    if (!this.has(key)) return false;
    Storage.del(this.key(key));
    this._size -= 1;
    return true;
  }
}

const moderatorMap = new BooleanMap(MODERATOR);
const cidMap = new BooleanMap(CID);

export { moderatorMap, cidMap };
