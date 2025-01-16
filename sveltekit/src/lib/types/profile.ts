import { TEST_ADDRESSES } from "$lib/config/test-addresses";

export type ModeratorAddress = (typeof TEST_ADDRESSES)[keyof typeof TEST_ADDRESSES];

export interface ModeratorProfile {
  address: ModeratorAddress;
  addedAt: number; // Unix timestamp in milliseconds
  active: boolean;
}

export interface AddModeratorEvent {
  address: ModeratorAddress;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface RemoveModeratorEvent {
  address: ModeratorAddress;
  timestamp: number; // Unix timestamp in milliseconds
}

export interface ModeratorState {
  moderators: ModeratorProfile[];
  error?: string;
}
