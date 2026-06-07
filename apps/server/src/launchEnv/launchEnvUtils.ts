export type EnvRecord = Readonly<Record<string, string | undefined>>;

export interface LaunchEnvContextInput {
  readonly projectRoot: string;
  readonly projectId: string;
  readonly threadId: string;
  readonly worktreePath?: string | null;
}

export function isManagedRuntimeEnvKey(key: string): boolean {
  return key.toUpperCase().startsWith("T3CODE_");
}

export function stripManagedRuntimeEnvKeys(env: EnvRecord | undefined): Record<string, string> {
  const next: Record<string, string> = {};
  if (!env) return next;
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) continue;
    if (isManagedRuntimeEnvKey(key)) continue;
    next[key] = value;
  }
  return next;
}

export function buildLaunchContextEnv(input: LaunchEnvContextInput): Record<string, string> {
  const env: Record<string, string> = {
    T3CODE_PROJECT_ROOT: input.projectRoot,
    T3CODE_PROJECT_ID: input.projectId,
    T3CODE_THREAD_ID: input.threadId,
  };
  if (input.worktreePath) {
    env.T3CODE_WORKTREE_PATH = input.worktreePath;
  }
  return env;
}

export function mergeResolvedLaunchEnv(input: {
  readonly t3Home: string;
  readonly extraEnv?: EnvRecord;
  readonly context: LaunchEnvContextInput;
}): Record<string, string> {
  return {
    ...stripManagedRuntimeEnvKeys(input.extraEnv),
    T3CODE_HOME: input.t3Home,
    ...buildLaunchContextEnv(input.context),
  };
}
