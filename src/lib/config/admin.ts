import { TEST_ADDRESSES } from "./test-addresses";

// Adresse de l'administrateur
export const adminAddress = TEST_ADDRESSES.admin;

// Vérifie si une adresse est admin
export function isAdmin(address: string): boolean {
  return address === adminAddress;
}
