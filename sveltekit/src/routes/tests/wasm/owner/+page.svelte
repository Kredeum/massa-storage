<script lang="ts">
  import { Ipfs } from "$lib/runes/ipfs.svelte";
  import { ipfsAddress } from "$lib/ts/config";
  import { shortenString } from "$lib/ts/utils";
  import { Args, OperationStatus } from "@massalabs/massa-web3";
  import { getContext } from "svelte";
  import toast from "svelte-hot-french-toast";

  const newOwner = "AU129GN1pGMpTy7ZL9LAHjsAFMNJb2YVyst5VyFjDiduxN3YamjHR";
  // const newOwner = "AU12uBCaT1baa7cFmdfG8yAzFpHpyhUyvxPxWzAEfaC94e9CLCmPK"; // Seb address

  const ipfs: Ipfs = getContext("ipfs");
  $inspect("ipfs", ipfs);

  const ownerSet = async (): Promise<boolean> => {
    if (!("callSC" in ipfs.provider)) return false;
    if (!ipfs.chainId) return false;

    console.log("ownerSet ~ chainId:", ipfs.chainId);
    try {
      const params = {
        target: ipfsAddress(ipfs.chainId),
        func: `setOwner`,
        parameter: new Args().addString(newOwner).serialize()
      };
      const op = await ipfs.provider.callSC(params);
      console.info("ownerSet ~ params:", params);
      console.info("ownerSet ~ op:", op);

      const txHash = op.id;
      toast.success("Transaction sent: " + shortenString(txHash));
      console.info(`https://massexplo.io/tx/${txHash}`);

      const status = await op.waitSpeculativeExecution();
      if (status !== OperationStatus.SpeculativeSuccess) {
        console.error(`Failed to ownerSet ~ status: ${status}`);
        return false;
      }

      console.info(`Owner set ok`);

      await ipfs.fetchOwner();
      return true;
    } catch (error) {
      console.info("Info:", error);
      return false;
    }
  };

  $effect(() => {
    if (ipfs.ready) ipfs.fetchOwner();
  });
</script>

<div class="flex h-32 flex-col items-center">
  <div class="flex flex-col gap-2">
    <span>{ipfs.owner} IPFS Owner</span>
    <span>{newOwner} New Owner</span>
  </div>
  <div class="button-standard">
    <button class="btn btn-primary" onclick={() => ownerSet()}> Set new Owner</button>
  </div>
</div>
