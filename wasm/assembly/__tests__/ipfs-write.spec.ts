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
  cidsGet,
} from '../contracts/ipfs';
import { ownership } from '@massalabs/sc-standards';

const testAddress = 'AU12345678901234567890123456789012345678901234567890';
const testIpfsHash = 'QmTest123456789';

describe('IPFS CID Tests', () => {
  test('CIDs list should not be empty', () => {
    // First add a test CID
    const testCidArg = new Args().add(testIpfsHash).serialize();
    cidAdd(testCidArg);

    // Then check the list
    const prefixArg = new Args().add('').serialize();
    const result = cidsGet(prefixArg);
    const args = new Args(result);
    const keys = args.nextStringArray().expect('Invalid keys');
    const values = args.nextStringArray().expect('Invalid values');
    expect(keys.length).toBeGreaterThan(0);
    expect(values.length).toBe(keys.length);
    expect(keys).toInclude(testIpfsHash);
  });
});

describe('IPFS Moderator Tests', () => {
  beforeAll(() => {
    setDeployContext();
    // Initialize contract with empty args
    constructor([0]);
  });

  describe('Moderator Tests', () => {
    test('should add then remove moderator', () => {
      const testAddressArg = new Args().add(testAddress).serialize();

      moderatorAdd(testAddressArg);

      let res = new Args(moderatorHas(testAddressArg))
        .nextBool()
        .expect('Invalid result');
      expect(res).toBeTruthy();

      moderatorDelete(testAddressArg);
      res = new Args(moderatorHas(testAddressArg))
        .nextBool()
        .expect('Invalid result');
      expect(res).toBeFalsy();
    });
  });
});
