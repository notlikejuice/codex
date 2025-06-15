import { describe, it, expect } from "vitest";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import type { ResponseItem } from "openai/resources/responses/responses.mjs";

describe("session memory", () => {
  it("persists messages after enabling memory", async () => {
    const dir = mkdtempSync(join(tmpdir(), "codex-mem-") );
    const prev = process.cwd();
    process.chdir(dir);
    try {
      const { saveSessionMemory, loadSessionMemory } = await import("../src/utils/storage/session-memory.js");
      const sessionInfo = {
        id: "test",
        user: "",
        version: "x",
        model: "gpt-4",
        timestamp: new Date().toISOString(),
        instructions: "",
      };

      let items: Array<ResponseItem> = [];

      const onItem = (item: ResponseItem) => {
        items = [...items, item];
        if (memoryEnabled) {
          saveSessionMemory(sessionInfo, items);
        }
      };

      let memoryEnabled = false;
      // first item with memory disabled -> no file
      onItem({
        id: "1",
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: "hello" }],
      } as ResponseItem);

      const sessionPath = join(dir, ".codex", "session.json");
      expect(existsSync(sessionPath)).toBe(false);

      // enable memory and persist existing items
      memoryEnabled = true;
      saveSessionMemory(sessionInfo, items);
      expect(existsSync(sessionPath)).toBe(true);
      let data = JSON.parse(readFileSync(sessionPath, "utf8"));
      expect(data.items.length).toBe(1);

      // another message while memory enabled
      onItem({
        id: "2",
        type: "message",
        role: "assistant",
        content: [{ type: "output_text", text: "hi" }],
      } as ResponseItem);

      data = JSON.parse(readFileSync(sessionPath, "utf8"));
      expect(data.items.length).toBe(2);
      const loaded = loadSessionMemory();
      expect(loaded?.items.length).toBe(2);
    } finally {
      process.chdir(prev);
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

