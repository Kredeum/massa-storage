import { Args, stringToBytes, bytesToString } from '@massalabs/as-types';
import { setDeployContext, Storage, Context } from '@massalabs/massa-as-sdk';
import {
  constructor,
  moderatorAdd,
  moderatorDelete,
  moderatorHas,
  cidAdd,
  cidDelete,
  cidHas,
  moderatorsGet,
  cidsGet,
} from '../contracts/ipfs';
import { ownership } from '@massalabs/sc-standards';

describe('IPFS Smart Contract Tests', () => {
  const testAddress = 'AU12345678901234567890123456789012345678901234567890';
  const testIpfsHash = 'QmTest123456789';

  beforeAll(() => {
    setDeployContext();
    // Initialize contract with empty args
    constructor([0]);
  });

  describe('Owner Tests', () => {
    test('Owner should match Caller address', () => {
      const owner = Storage.get('OWNER');
      expect(owner.length).toBeGreaterThan(0);
      const callerAddress = Context.caller().toString();
      expect(owner).toBe(callerAddress);
    });

    test('Owner should be Moderator', () => {
      const owner = Storage.get('OWNER');
      const ownerArg = new Args().add(owner).serialize();
      const result = moderatorHas(ownerArg);
      const isModerator = new Args(result).nextBool().expect('Invalid result');
      expect(isModerator).toBeTruthy();
    });

    test('Moderators list should not be empty', () => {
      const prefixArg = new Args().add('').serialize();
      const result = moderatorsGet(prefixArg);
      const moderators = new Args(result).nextStringArray().expect('Invalid result');
      expect(moderators.length).toBeGreaterThan(0);
    });

  });
});
