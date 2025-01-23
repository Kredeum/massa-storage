// import { getContext } from "svelte";
// import toast from "svelte-hot-french-toast";
// import { Ipfs } from "./ipfs.svelte";

// const ipfs: Ipfs = getContext("ipfs");

// class isMod extends Ipfs{
//   let userAddress = $state<string>("");
//   let isModerator = $state<boolean>(false);

//   const checkIfModerator = async () => {
//     userAddress = ipfs?.address ?? "";
//     if (!userAddress) toast.error("User address not found");
//     isModerator = (await ipfs?.modHas(userAddress)) ?? false;
//   }
// };

// $effect(() => {
//   checkIfModerator();
// });

// constructor(    ) {
//   checkIfModerator();
// }
