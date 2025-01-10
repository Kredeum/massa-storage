declare module "@ipld/dag-pb" {
  export interface PBNode {
    Data?: Uint8Array;
    Links: PBLink[];
  }

  export interface PBLink {
    Hash: CID | Uint8Array; // Allow both CID and Uint8Array
    Name?: string;
    Tsize?: number;
  }

  export function encode(node: PBNode): Uint8Array;
  export function decode(data: Uint8Array): PBNode;

  export const code: number;
  export const name: string;
}
