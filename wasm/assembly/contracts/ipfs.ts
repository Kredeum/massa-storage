import { Context } from '@massalabs/massa-as-sdk';

import { ownership } from '@massalabs/sc-standards';
import {
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  moderatorsGet,
} from './mods';
import { cidAdd, cidDelete, cidHas, cidSet, cidsGet } from './cids';

function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const caller: StaticArray<u8> = Context.caller().serialize();

  ownership.setOwner(caller);
  moderatorAdd(caller);
}

export {
  constructor,
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  moderatorsGet,
  cidAdd,
  cidDelete,
  cidHas,
  cidSet,
  cidsGet,
};
