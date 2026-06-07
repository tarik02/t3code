import type { ProjectScript } from "@t3tools/contracts";

function stripManagedRuntimeEnvKeys(
  extraEnv: Record<string, string> | undefined,
): Record<string, string> {
  if (!extraEnv) return {};
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries(extraEnv)) {
    if (key.toUpperCase().startsWith("T3CODE_")) continue;
    next[key] = value;
  }
  return next;
}

export function projectScriptCwd(input: {
  project: {
    cwd: string;
  };
  worktreePath?: string | null;
}): string {
  return input.worktreePath ?? input.project.cwd;
}

export function projectScriptRuntimeEnv(
  input: {
    readonly extraEnv?: Record<string, string>;
  } = {},
): Record<string, string> {
  return stripManagedRuntimeEnvKeys(input.extraEnv);
}

export function setupProjectScript(scripts: readonly ProjectScript[]): ProjectScript | null {
  return scripts.find((script) => script.runOnWorktreeCreate) ?? null;
}
