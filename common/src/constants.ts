

const GREETING_KEY = "GREETING";

const MODERATOR = "moderator";
const CID = "cid";

const STATUS_APPROVED = "1";
const STATUS_REJECTED = "0";
const STATUS_PENDING = "-1";

type StatusType = typeof STATUS_PENDING | typeof STATUS_APPROVED | typeof STATUS_REJECTED;

const statusLabel = (status: StatusType) => status == STATUS_APPROVED ? "Approved" : status == STATUS_REJECTED ? "Rejected" : "Pending";

export { type StatusType, MODERATOR, CID, GREETING_KEY, STATUS_APPROVED, STATUS_REJECTED, STATUS_PENDING, statusLabel };
