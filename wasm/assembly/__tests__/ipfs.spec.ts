import { Context, Address } from '@massalabs/massa-as-sdk';
import {
  bytesToString,
  stringToBytes,
  boolToByte,
  Args,
} from '@massalabs/as-types';
import { ownership } from '@massalabs/sc-standards';
import {
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
} from '../contracts/ipfs';

describe('IPFS Smart Contract', () => {
  describe('constructor', () => {
    it('should set owner and add caller as moderator', () => {
      const mockAddress = new Address(
        'AU1JC5Q7c6mV7TcEtj2yA1Cv49JSiFz4xS8dnbGbmKHbVfrmFHvJ',
      );
      Context.caller = () => mockAddress;
      Context.isDeployingContract = () => true;

      constructor([]);

      expect(ownership.isOwner(mockAddress.serialize())).toBe(boolToByte(true));
      expect(moderatorHas(mockAddress.serialize())).toBe(boolToByte(true));
    });
  });

  // Tests des fonctions de modération
  describe('Moderator functions', () => {
    const mockModerator = new Address(
      'AU1JC5Q7c6mV7TcEtj2yA1Cv49JSiFz4xS8dnbGbmKHbVfrmFHvJ',
    );

    it('should add and check moderator', () => {
      moderatorAdd(mockModerator.serialize());
      expect(moderatorHas(mockModerator.serialize())).toBe(boolToByte(true));
    });

    it('should list moderators', () => {
      const moderators = moderatorsGet(new Args().add('MODERATOR').serialize());
      const serializedModerator = mockModerator.serialize();

      expect(moderators.length).toBeGreaterThan(0);

      // Compare arrays manually
      let found = false;
      for (let i = 0; i < moderators.length; i++) {
        if (moderators[i] == serializedModerator[i]) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should delete moderator', () => {
      moderatorDelete(mockModerator.serialize());
      expect(moderatorHas(mockModerator.serialize())).toBe(boolToByte(false));
    });
  });

  // Tests des fonctions CID
  describe('CID functions', () => {
    const mockCid = stringToBytes('QmTest123');

    it('should add and check CID', () => {
      cidAdd(mockCid);
      expect(cidHas(mockCid)).toBe(boolToByte(true));
    });

    // it('should set CID status', () => {
    //   const mockCid = stringToBytes('QmTest456');
    //   const mockStatus = stringToBytes('APPROVED');

    //   cidAdd(new Args().add(mockCid).serialize());
    //   cidSet(new Args().add(mockCid).add(mockStatus).serialize());

    //   const cids = cidsGet(new Args().add('CID').serialize());
    //   let found = false;
    //   for (let i = 0; i < cids.length; i++) {
    //     if (bytesToString(cids[i]) === bytesToString(mockCid)) {
    //       found = true;
    //       expect(bytesToString(cids[i + 1])).toBe(bytesToString(mockStatus));
    //       break;
    //     }
    //   }
    //   expect(found).toBe(true);
    // });

    it('should get CIDs', () => {
      cidAdd(new Args().add(mockCid).serialize());

      const cids = cidsGet(new Args().add('CID').serialize());
      const serializedCid = mockCid;

      expect(cids.length).toBeGreaterThan(0);

      let found = false;
      for (let i = 0; i < cids.length; i++) {
        if (cids[i] == serializedCid[i]) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });

    it('should delete CID', () => {
      cidDelete(mockCid);
      expect(cidHas(mockCid)).toBe(boolToByte(false));
    });
  });
});
