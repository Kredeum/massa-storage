import { Context } from '@massalabs/massa-as-sdk';

import { ownership } from '@massalabs/sc-standards';
import {
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  moderatorsGet,
} from './ipfs-mods';
import { cidAdd, cidDelete, cidHas, cidsGet } from './ipfs-cids';

function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const caller = Context.caller().serialize();

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
  cidsGet,
};
