import { deployerBase64, contractDataBase64 } from "$lib/bearby";
import type { Bearby, EventFilter } from "$lib/bearby";

let web3: Bearby;

// Buildnet contract
const USDC = "AS12k8viVmqPtRuXzCm6rKXjLgpQWqbuMjc37YHhB452KSUUb9FgL";

const initBearby = async (): Promise<void> => {
  while (!("web3" in globalThis.window)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  web3 = globalThis.window.bearby as Bearby;
};

const connect = async () => {
  console.log(web3.wallet.installed);
  const status = await web3.wallet.connect();
  console.log(web3.wallet.installed);
  console.log(status);
};

const disconnect = async () => {
  const status = await web3.wallet.disconnect();
  console.log(status);
};

const accountBalance = async () => {
  const account = web3.wallet.account.base58;
  const res = await web3.massa.getAddresses(account);
  const { final_balance, candidate_balance } = res.result[0];
  console.log(final_balance, candidate_balance);
};

const test_req_pub_key = async () => {
  const pubkey = await web3.wallet.requestPubKey();
  console.log(pubkey);
};

const test_sign = async () => {
  const res = await web3.wallet.signMessage("test");

  console.log(res);
};

const tryReadContract = async () => {
  const account = web3.wallet.account.base58;
  const result = await web3.contract.readSmartContract({
    fee: 0,
    maxGas: 4294167295,
    simulatedGasPrice: 0,
    targetAddress: "AS1CNmKBzXY3jwkqempmrv95wZUMqBHRBAQK3G4vicb3WpxZAy3e",
    targetFunction: "getMessage",
    parameter: [],
    callerAddress: account
  });
  console.log(result);
};

const tryReadContractWithUnsafeParams = async () => {
  const account = web3.wallet.account.base58;
  const Args = window["Args"];
  if (!Args) {
    console.error("Massa-web3 is not loaded. please wait a second");
    return;
  }
  const unsafeParameters = new Args().addString(account).serialize();
  const result = await web3.contract.readSmartContract({
    maxGas: 4294167295,
    targetAddress: USDC,
    targetFunction: "balanceOf",
    parameter: Array.from(unsafeParameters)
  });
  console.log(result);
};

const readBalance = async () => {
  const data = await web3.contract.readSmartContract({
    fee: 0,
    maxGas: 2100000,
    simulatedGasPrice: 0,
    targetAddress: "AS12Emra1SrLsFgYdFRQXBjsksWummAs8zG14iFytS73bZBjbVY5v",
    targetFunction: "balanceOf",
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: "AU1aFiPAan1ucLZjS6iREznGYHHpTseRFAXEYvYsbCocU9RL64GW"
      }
    ]
  });
  console.log("readSmartContract", data.result[0]);
};

const transfer = async () => {
  const hash = await web3.contract.call({
    maxGas: 2000000,
    maxCoins: 100000000,
    coins: 0,
    targetAddress: "AS1brg4nueUAT41sm8eRZrmYndUgkAhs2hwEkJD4N8UejtK2Qa9C",
    functionName: "transfer",
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: "Hello, World!"
      },
      {
        type: web3.contract.types.BOOL,
        value: true
      },
      {
        type: web3.contract.types.F64,
        value: 32
      },
      {
        type: web3.contract.types.U256,
        value: "435435345234324324324323243242398854684"
      }
    ]
  });

  console.log(hash);
};

const getDatastoreEntries = async () => {
  const data = await web3.contract.getDatastoreEntries({ address: USDC, key: "SYMBOL" });
  console.log("Datastore data:", data.result[0]);
};

const testunsafe = async () => {
  const hash = await web3.contract.call({
    maxGas: 1000000,
    coins: 0,
    fee: 1000,
    targetAddress: "AS1X4atEfMdoV4Rj9agjgpowsFgdZULpCig6SXhyX22kgnHMqK4y",
    functionName: "logEventArgAll",
    unsafeParameters: [
      2, 0, 0, 0, 1, 2, 3, 0, 0, 0, 49, 49, 49, 9, 0, 0, 0, 114, 101, 99, 101, 105, 118, 101, 114,
      49, 3, 0, 0, 0, 77, 65, 83, 0, 0, 0, 0
    ]
  });

  console.log(hash);
};

const deploy = async () => {
  const hash = await web3.contract.deploy({
    fee: 0,
    maxGas: 3980167295n,
    maxCoins: 0.1 * 10 ** 9,
    coins: 100000000n,
    parameter: [
      {
        type: web3.contract.types.STRING,
        value: "Hello, World!"
      }
    ],
    targetAddress: "",
    functionName: "deploy",
    deployerBase64,
    contractDataBase64
  });

  let k = 0;
  const intr = setInterval(async () => {
    const eventsFilter: EventFilter = {
      start: null,
      end: null,
      original_caller_address: null,
      original_operation_id: hash,
      emitter_address: null
    };
    const response = await web3.contract.getFilteredSCOutputEvent(eventsFilter);
    if (response && response.result && response.result[0] && response.result[0].data) {
      clearInterval(intr);
      window.contract = String(response.result[0].data).replace("Address:", "");
      console.log(window.contract);
      alert(window.contract);
    }

    console.log(response);

    if (k > 10) {
      clearInterval(intr);
    }
    k += 1;
  }, 4000);
};

const getNodesStatus = async () => {
  const network = await web3.wallet.network;
  console.log("network", network);
  const data = await web3.massa.getNodesStatus();
  console.log("getNodesStatus", data);
};

export {
  USDC,
  initBearby,
  connect,
  disconnect,
  accountBalance,
  test_req_pub_key,
  test_sign,
  tryReadContract,
  tryReadContractWithUnsafeParams,
  readBalance,
  transfer,
  getDatastoreEntries,
  testunsafe,
  deploy,
  getNodesStatus
};
