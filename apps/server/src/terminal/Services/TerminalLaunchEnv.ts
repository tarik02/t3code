import type {
  TerminalAttachInput,
  TerminalOpenInput,
  TerminalRestartInput,
} from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

import { TerminalCwdError, TerminalSessionLookupError } from "./Manager.ts";
import type { TerminalAttachRuntimeInput } from "../TerminalAttachRuntimeInput.ts";

export interface TerminalLaunchEnvShape {
  readonly resolveOpenInput: (
    input: TerminalOpenInput,
  ) => Effect.Effect<TerminalOpenInput, TerminalCwdError>;
  readonly resolveRestartInput: (
    input: TerminalRestartInput,
  ) => Effect.Effect<TerminalRestartInput, TerminalCwdError>;
  readonly resolveAttachInput: (
    input: TerminalAttachInput,
  ) => Effect.Effect<TerminalAttachRuntimeInput, TerminalCwdError | TerminalSessionLookupError>;
}

export class TerminalLaunchEnv extends Context.Service<TerminalLaunchEnv, TerminalLaunchEnvShape>()(
  "t3/terminal/Services/TerminalLaunchEnv",
) {}
