// common source to sveltekit typescript and wasm assemblyscript
// BE CAREFULL: some typescript types not accepted by the wasm compiler

const MODERATOR = "moderator";
const CID = "cid";

const IPFS_API_DEFAULT = "http://localhost:5001";

const STATUS_APPROVED = "1";
const STATUS_REJECTED = "0";
const STATUS_PENDING = "-1";

function statusLabel(status: string): string {
  if (status == STATUS_APPROVED) return "Approved";
  if (status == STATUS_REJECTED) return "Rejected";
  if (status == STATUS_PENDING) return "Pending";
  return "Unknown";
}

export { MODERATOR, CID, IPFS_API_DEFAULT, STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING, statusLabel };
