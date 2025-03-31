import { Context } from '@massalabs/massa-as-sdk';

import {
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  moderatorsGet,
} from './mods';
import { cidAdd, cidDelete, cidHas, cidSet, cidsGet, cidGet } from './cids';
import { setOwner } from '@massalabs/sc-standards/assembly/contracts/utils/ownership';

function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const caller: StaticArray<u8> = Context.caller().serialize();

  setOwner(caller);
  moderatorAdd(caller);
}

export {
  constructor,
  setOwner,
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  moderatorsGet,
  cidAdd,
  cidDelete,
  cidHas,
  cidSet,
  cidsGet,
  cidGet,
};
