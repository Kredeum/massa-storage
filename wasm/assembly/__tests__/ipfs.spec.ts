import { Address, setDeployContext } from '@massalabs/massa-as-sdk';
import { stringToBytes, boolToByte, Args } from '@massalabs/as-types';
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

const OWNER_ADDRESS = 'AU1JC5Q7c6mV7TcEtj2yA1Cv49JSiFz4xS8dnbGbmKHbVfrmFHvJ';
const MODERATOR_ADDRESS =
  'AU12UBnqTHDQALpocVBnkPNy7y5CndUJQTLutaVDDFgMJcq5kQiq';

describe('IPFS Smart Contract', () => {
  beforeAll(() => {
    setDeployContext(OWNER_ADDRESS);
    constructor([]);
  });

  test('constructor should set owner', () => {
    const ownerAddr = new Address(OWNER_ADDRESS);
    expect(ownership.isOwner(ownerAddr.serialize())).toStrictEqual(
      boolToByte(true),
    );
  });

  test('constructor should add owner as moderator', () => {
    const ownerAddr = new Address(OWNER_ADDRESS);
    expect(moderatorHas(ownerAddr.serialize())).toStrictEqual(boolToByte(true));
  });

  test('should add new moderator', () => {
    const moderator = new Address(MODERATOR_ADDRESS);
    moderatorAdd(moderator.serialize());
    expect(moderatorHas(moderator.serialize())).toStrictEqual(boolToByte(true));
  });

  test('should list moderators', () => {
    const moderators = moderatorsGet(new Args().add('MODERATOR').serialize());
    expect(moderators.length).toBeGreaterThan(0);
  });

  test('should delete moderator', () => {
    const moderator = new Address(MODERATOR_ADDRESS);
    moderatorDelete(moderator.serialize());
    expect(moderatorHas(moderator.serialize())).toStrictEqual(
      boolToByte(false),
    );
  });

  const testCid = 'QmTest123';
  const testCidBytes = stringToBytes(testCid);

  test('should add CID', () => {
    cidAdd(testCidBytes);
    expect(cidHas(testCidBytes)).toStrictEqual(boolToByte(true));
  });

  test('should list CIDs', () => {
    const cids = cidsGet(new Args().add('CID').serialize());
    expect(cids.length).toBeGreaterThan(0);
  });

  test('should delete CID', () => {
    cidDelete(testCidBytes);
    expect(cidHas(testCidBytes)).toStrictEqual(boolToByte(false));
  });

  test('should set CID', () => {
    const newTestCid = 'QmNewTest456';
    const newTestCidBytes = stringToBytes(newTestCid);
    cidSet(newTestCidBytes);
    expect(cidHas(newTestCidBytes)).toStrictEqual(boolToByte(true));
  });
});
