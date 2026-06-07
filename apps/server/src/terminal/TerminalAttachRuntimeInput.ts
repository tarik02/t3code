import type { ProjectId, TerminalAttachInput } from "@t3tools/contracts";

export type TerminalAttachRuntimeInput = TerminalAttachInput & {
  readonly projectId: ProjectId;
};
