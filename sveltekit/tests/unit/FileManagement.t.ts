import { describe, it, expect, beforeEach } from "vitest";
import FileManagement from "$lib/components/fileManagement/FileManagement.svelte";

describe.skip("FileManagement", () => {
  let fileManagement: FileManagement;

  beforeEach(() => {
    // fileManagement = new FileManagement();
  });

  it("Should detect file types from extensions", () => {
    // Test various file extensions
  });

  it("Should handle file selection", () => {
    // Test single/multiple selection
  });

  it("Should update file status", () => {
    // Test status transitions
  });
});
