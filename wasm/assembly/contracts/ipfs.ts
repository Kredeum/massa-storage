import { Context, generateEvent, Storage } from '@massalabs/massa-as-sdk';
import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';
import { setOwner, onlyOwner } from './utils/ownership';

export function constructor(deployer: StaticArray<u8>): void {
  assert(Context.isDeployingContract());

  setOwner(deployer);

  addModerator(deployer);
}

export function addModerator(moderator: StaticArray<u8>): void {
  onlyOwner();
  const moderatorStr = bytesToString(moderator);

  // Get existing moderators or initialize empty string
  const moderatorsKey = 'moderators';
  let moderators = Storage.has(moderatorsKey) ? Storage.get(moderatorsKey) : '';

  // Check if moderator already exists
  if (moderators.includes(moderatorStr)) {
    return;
  }

  // Add new moderator to the list
  moderators =
    moderators.length > 0 ? moderators + ',' + moderatorStr : moderatorStr;
  Storage.set(moderatorsKey, moderators);

  generateEvent(`Moderator added: ${moderatorStr}`);
}

export function getModerators(): string {
  return Storage.has('moderators') ? Storage.get('moderators') : '';
}

export function isModerator(address: StaticArray<u8>): bool {
  const addressStr = bytesToString(address);
  const moderators = getModerators();
  return moderators.includes(addressStr);
}
