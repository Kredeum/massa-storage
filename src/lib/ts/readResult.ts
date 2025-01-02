import type { JsonRPCResponseExecuteReadOnly } from "@hicaru/bearby.js";
import { Args } from "$lib/massa";

const readU64 = (data: JsonRPCResponseExecuteReadOnly[]): bigint | undefined => {
  console.log("readU64 data", data);

  if (!data) return;
  const ok = data[0]?.result?.[0]?.result?.Ok as unknown as ArrayBuffer;
  console.log("readU64 ok", ok);

  if (!ok) return;
  const value = new Args(new Uint8Array(ok)).nextU64();
  console.log("readU64 value", value);

  return value;
};

export { readU64 };
