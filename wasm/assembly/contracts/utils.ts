import { Args } from '@massalabs/as-types';
import { Address } from '@massalabs/massa-as-sdk';

function _stringArgToString(stringArg: StaticArray<u8>): string {
  return new Args(stringArg).nextString().expect('Invalid address').toString();
}
function _addressArgToString(addressArg: StaticArray<u8>): string {
  return new Address(_stringArgToString(addressArg)).toString();
}

export { _stringArgToString, _addressArgToString };
