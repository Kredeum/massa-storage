import { Context } from '@massalabs/massa-as-sdk';

import { ownership } from '@massalabs/sc-standards';
import { modAdd, modDelete, modHas, modsGet } from './ipfs-mods';
import { cidAdd, cidDelete, cidHas, cidsGet } from './ipfs-cids';

function constructor(_: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  const caller = Context.caller().serialize();

  ownership.setOwner(caller);
  modAdd(caller);
}

export {
  constructor,
  modAdd,
  modDelete,
  modHas,
  modsGet,
  cidAdd,
  cidDelete,
  cidHas,
  cidsGet,
};
