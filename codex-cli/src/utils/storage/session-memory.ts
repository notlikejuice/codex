import type { TerminalChatSession } from "../session.js";
import type { ResponseItem } from "openai/resources/responses/responses";

import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import path from "path";

const SESSION_DIR = path.join(process.cwd(), ".codex");
const SESSION_FILE = path.join(SESSION_DIR, "session.json");

/**
 * Load the project-local session memory, if it exists.
 */
export function loadSessionMemory(): { session: TerminalChatSession; items: Array<ResponseItem> } | null {
  if (!existsSync(SESSION_FILE)) {
    return null;
  }
  try {
    const content = readFileSync(SESSION_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Persist the session memory to the project-local .codex/session.json file.
 */
export function saveSessionMemory(session: TerminalChatSession, items: Array<ResponseItem>): void {
  try {
    if (!existsSync(SESSION_DIR)) {
      mkdirSync(SESSION_DIR, { recursive: true });
    }
    writeFileSync(SESSION_FILE, JSON.stringify({ session, items }, null, 2), "utf-8");
  } catch {
    // best-effort, ignore failures
  }
}

/**
 * Clear the project-local session memory.
 */
export function clearSessionMemory(): void {
  if (existsSync(SESSION_FILE)) {
    try {
      unlinkSync(SESSION_FILE);
    } catch {
      // ignore
    }
  }
}

/**
 * Return a summary of the current session memory status.
 */
export function sessionMemoryStatus(): { exists: boolean; session?: TerminalChatSession; itemsCount?: number } {
  const mem = loadSessionMemory();
  if (!mem) {
    return { exists: false };
  }
  return { exists: true, session: mem.session, itemsCount: mem.items.length };
}