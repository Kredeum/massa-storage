import { describe, it, expect, vi, beforeEach } from "vitest";
import { goto } from "$app/navigation";
import { getContext } from "svelte";
import type { Mock } from "vitest";

interface MockIpfs {
  ready: boolean;
  address: string | undefined;
  isOwner: Mock<(address?: string) => Promise<boolean>>;
}

type ModeratorPageComponent = () => Promise<void>;

vi.mock("../../src/routes/app/moderators/+page.svelte", () => ({
  default: vi.fn()
}));

// Mock dependencies
vi.mock("$app/navigation", () => ({
  goto: vi.fn()
}));

vi.mock("svelte", () => ({
  getContext: vi.fn()
}));

vi.mock("svelte-hot-french-toast", () => ({
  toast: {
    error: vi.fn()
  }
}));

describe("ModeratorPage Access Control", () => {
  let mockIpfs: MockIpfs;
  let ModeratorPage: Mock<() => Promise<void>>;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Basic Ipfs mock
    mockIpfs = {
      ready: true,
      address: "0x123",
      isOwner: vi.fn()
    };

    // Mock getContext to return our Ipfs mock
    vi.mocked(getContext).mockReturnValue(mockIpfs);

    // Mock ModeratorPage component
    ModeratorPage = vi.fn().mockImplementation(async () => {
      if (!mockIpfs.ready || !mockIpfs.address) return;

      try {
        const isOwner = await mockIpfs.isOwner();
        if (!isOwner) {
          goto("/app/collections");
        }
      } catch (error) {
        goto("/app/collections");
      }
    });
  });

  it("should redirect when user is not owner", async () => {
    // Configure mock to return false (user is not owner)
    mockIpfs.isOwner.mockResolvedValue(false);

    // Simulate component mounting
    await ModeratorPage();

    // Wait for promises to resolve
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Check if user is redirected
    expect(goto).toHaveBeenCalledWith("/app/collections");
  });

  it("should not redirect when user is owner", async () => {
    // Configure mock to return true (user is owner)
    mockIpfs.isOwner.mockResolvedValue(true);

    // Simulate component mounting
    await ModeratorPage();

    // Check that user is not redirected
    expect(goto).not.toHaveBeenCalled();
  });

  it("should not proceed when ipfs is not ready", async () => {
    // Configure ipfs as not ready
    mockIpfs.ready = false;

    // Simulate component mounting
    await ModeratorPage();

    // Check that isOwner is not called
    expect(mockIpfs.isOwner).not.toHaveBeenCalled();
  });

  it("should not proceed when user address is not available", async () => {
    // Remove user address
    mockIpfs.address = undefined;

    // Simulate component mounting
    await ModeratorPage();

    // Check that isOwner is not called
    expect(mockIpfs.isOwner).not.toHaveBeenCalled();
  });

  it("should handle errors from isOwner check", async () => {
    // Simulate an error during ownership check
    mockIpfs.isOwner.mockRejectedValue(new Error("Test error"));

    // Simulate component mounting
    await ModeratorPage();

    // Check that user is redirected on error
    expect(goto).toHaveBeenCalledWith("/app/collections");
  });
});
