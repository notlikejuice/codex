import TypeaheadOverlay from "./typeahead-overlay.js";
import { Box, Text } from "ink";
import os from "os";
import path from "path";
import React from "react";

/**
 * Props for <MemoryOverlay>.
 */
type Props = {
  onSelect: (option: string) => void;
  onExit: () => void;
  memoryEnabled: boolean;
};

export default function MemoryOverlay({
  onSelect,
  onExit,
  memoryEnabled,
}: Props): JSX.Element {
  
  // Get the session file path
  const sessionDir = path.join(process.cwd(), ".codex");
  const sessionFile = path.join(sessionDir, "session.json");
  const sessionFilePath = sessionFile.replace(os.homedir(), "~");

  const items = [
    {
      label: `Enable session persistence`,
      value: 'on',
    },
    {
      label: `Disable session persistence`, 
      value: 'off',
    },
    {
      label: `Clear session data from ${sessionFilePath}`,
      value: 'clear',
    },
  ];

  // Filter items based on current state
  const filteredItems = items.filter((item) => {
    if (item.value === 'on' && memoryEnabled) {
      return false;
    }
    if (item.value === 'off' && !memoryEnabled) {
      return false;
    }
    return true;
  });

  return (
    <TypeaheadOverlay
      title="Memory Management"
      description={
        <Box flexDirection="column">
          <Text>
            Current status: <Text color={memoryEnabled ? "greenBright" : "red"}>
              {memoryEnabled ? "enabled" : "disabled"}
            </Text>
          </Text>
          <Text dimColor>
            Session data is stored in: {sessionFilePath}
          </Text>
        </Box>
      }
      initialItems={filteredItems}
      onSelect={onSelect}
      onExit={onExit}
    />
  );
}